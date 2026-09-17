import csv
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
import uuid
from decimal import Decimal, InvalidOperation

from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import user_passes_test
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

import datetime
import re
from django.core.exceptions import ValidationError
from django.core.validators import validate_email, URLValidator
from django.utils.dateparse import parse_date, parse_datetime
from django.utils.text import slugify
from .models import Cohort, Student


def _json_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def _cohort_payload(cohort, include_private=False):
    paid_count = cohort.students.filter(payment_status="paid").count()
    total_count = cohort.students.count()
    max_cap = cohort.max_capacity or 50
    payload = {
        "id": cohort.id,
        "title": cohort.title,
        "track": cohort.track,
        "slug": cohort.slug,
        "base_fee": str(cohort.base_fee),
        "early_bird_fee": str(cohort.early_bird_fee),
        "max_capacity": max_cap,
        "enrolled_count": paid_count,
        "total_registrations": total_count,
        "remaining_seats": max(0, max_cap - paid_count),
        "is_full": paid_count >= max_cap,
        "registration_start": cohort.registration_start.isoformat() if cohort.registration_start else None,
        "registration_end": cohort.registration_end.isoformat() if cohort.registration_end else None,
        "status": cohort.status,
        "syllabus": cohort.syllabus,
    }
    if include_private:
        payload["whatsapp_url"] = cohort.whatsapp_url
        payload["orientation_url"] = cohort.orientation_url
    return payload


@ensure_csrf_cookie
@require_GET
def csrf_token(request):
    return JsonResponse({"ready": True})


@require_GET
def public_cohorts(request):
    cohorts = Cohort.objects.filter(status=Cohort.Status.ACTIVE, registration_end__gte=timezone.now())
    return JsonResponse({"cohorts": [_cohort_payload(cohort) for cohort in cohorts]})


@require_POST
def initialize_payment(request):
    data = _json_body(request)
    if data is None:
        return JsonResponse({"error": "Request body must be valid JSON."}, status=400)
    
    full_name = str(data.get("full_name", "")).strip()
    email = str(data.get("email", "")).strip()
    whatsapp_number = str(data.get("whatsapp_number", "")).strip()
    cohort_slug = str(data.get("cohort_slug", "")).strip()

    # Input validation
    if not full_name or len(full_name) < 2:
        return JsonResponse({"error": "Please provide your full name (at least 2 characters)."}, status=400)
    if len(full_name) > 160:
        return JsonResponse({"error": "Full name cannot exceed 160 characters."}, status=400)

    try:
        validate_email(email)
    except Exception:
        return JsonResponse({"error": "Please provide a valid email address."}, status=400)

    phone_clean = re.sub(r"[\s\-]", "", whatsapp_number)
    if not re.match(r"^(\+?233|0)[0-9]{8,12}$", phone_clean) and not re.match(r"^\+?[0-9]{9,15}$", phone_clean):
        return JsonResponse({"error": "Please provide a valid WhatsApp phone number (e.g. 054 813 6155 or +233 54 813 6155)."}, status=400)

    if not cohort_slug:
        return JsonResponse({"error": "Please select a cohort track to enroll."}, status=400)

    try:
        cohort = Cohort.objects.get(slug=cohort_slug, status=Cohort.Status.ACTIVE)
    except Cohort.DoesNotExist:
        return JsonResponse({"error": "This cohort is not accepting registrations."}, status=404)

    # Student capacity enforcement
    paid_count = cohort.students.filter(payment_status="paid").count()
    if paid_count >= cohort.max_capacity:
        return JsonResponse({
            "error": f"Admissions for {cohort.title} are currently full ({cohort.max_capacity} seat capacity reached). Please contact admissions for upcoming cohort availability."
        }, status=400)

    applicable_fee = cohort.early_bird_fee if (cohort.early_bird_fee and cohort.early_bird_fee > 0) else cohort.base_fee
    student = Student.objects.create(
        full_name=full_name,
        email=email,
        whatsapp_number=whatsapp_number,
        cohort=cohort,
        amount_paid=applicable_fee,
    )
    reference = f"POI-{student.id}-{uuid.uuid4().hex[:10].upper()}"
    student.paystack_reference = reference
    student.save(update_fields=("paystack_reference",))

    secret_key = getattr(settings, "PAYSTACK_SECRET_KEY", None) or os.environ.get("PAYSTACK_SECRET_KEY")
    if not secret_key:
        return JsonResponse({
            "reference": reference,
            "authorization_url": None,
            "message": "PAYSTACK_SECRET_KEY is not configured.",
        }, status=201)

    callback_url = data.get("callback_url") or getattr(settings, "PAYSTACK_CALLBACK_URL", "") or os.environ.get("PAYSTACK_CALLBACK_URL", "")
    if not callback_url:
        callback_url = request.build_absolute_uri("/enrollment/success")

    payload = json.dumps({
        "email": student.email,
        "amount": int(applicable_fee * 100),
        "currency": "GHS",
        "reference": reference,
        "callback_url": callback_url,
        "metadata": {
            "student_id": student.id,
            "cohort_title": cohort.title,
            "phone": student.whatsapp_number,
        },
    }).encode()
    req = urllib.request.Request(
        "https://api.paystack.co/transaction/initialize",
        data=payload,
        headers={
            "Authorization": f"Bearer {secret_key}",
            "Content-Type": "application/json",
            "User-Agent": "Mozilla/5.0 (compatible; PoietikAcademy/1.0)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as response:
            paystack_data = json.loads(response.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        return JsonResponse({"error": f"Unable to initialize Paystack checkout: {error}"}, status=502)
    if not paystack_data.get("status"):
        return JsonResponse({"error": paystack_data.get("message", "Paystack rejected the request.")}, status=502)

    return JsonResponse({
        "reference": reference,
        "authorization_url": paystack_data["data"]["authorization_url"],
        "access_code": paystack_data["data"].get("access_code"),
        "public_key": getattr(settings, "PAYSTACK_PUBLIC_KEY", ""),
    }, status=201)


@require_GET
def verify_payment(request):
    reference = request.GET.get("reference", "").strip()
    if not reference:
        return JsonResponse({"error": "Reference parameter is required."}, status=400)

    secret_key = getattr(settings, "PAYSTACK_SECRET_KEY", None) or os.environ.get("PAYSTACK_SECRET_KEY", "")
    student = Student.objects.filter(paystack_reference=reference).select_related("cohort").first()

    req = urllib.request.Request(
        f"https://api.paystack.co/transaction/verify/{reference}",
        headers={
            "Authorization": f"Bearer {secret_key}",
            "User-Agent": "Mozilla/5.0 (compatible; PoietikAcademy/1.0)",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=15) as resp:
            data = json.loads(resp.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError) as e:
        if student and student.payment_status == "paid":
            return JsonResponse({
                "status": "success",
                "verified": True,
                "reference": reference,
                "whatsapp_url": student.cohort.whatsapp_url or "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT",
                "student": {
                    "name": student.full_name,
                    "email": student.email,
                    "track": student.cohort.track,
                    "amount_paid": str(student.amount_paid),
                },
            })
        return JsonResponse({"error": f"Paystack verification request failed: {e}"}, status=502)

    if not data.get("status"):
        return JsonResponse({"error": data.get("message", "Unable to verify transaction.")}, status=400)

    txn_data = data.get("data", {})
    txn_status = txn_data.get("status")

    if txn_status == "success":
        if student:
            student.payment_status = "paid"
            student.amount_paid = Decimal(txn_data.get("amount", 0)) / Decimal("100")
            student.save(update_fields=("payment_status", "amount_paid"))
        whatsapp_link = (student.cohort.whatsapp_url if student and student.cohort else "") or "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT"
        return JsonResponse({
            "status": "success",
            "verified": True,
            "reference": reference,
            "whatsapp_url": whatsapp_link,
            "student": {
                "name": student.full_name if student else txn_data.get("customer", {}).get("email"),
                "email": student.email if student else txn_data.get("customer", {}).get("email"),
                "track": student.cohort.track if student and student.cohort else "Cohort 001",
                "amount_paid": str(Decimal(txn_data.get("amount", 0)) / Decimal("100")),
            },
        })
    else:
        return JsonResponse({
            "status": txn_status,
            "verified": False,
            "reference": reference,
            "message": txn_data.get(
                "gateway_response",
                "Payment not verified yet. The cohort WhatsApp group link is visible only to students with confirmed payment.",
            ),
            "whatsapp_url": None,
        })


@require_POST
def admin_login(request):
    data = _json_body(request)
    if not data:
        return JsonResponse({"error": "Invalid request body."}, status=400)
    username = data.get("username", "").strip()
    password = data.get("password", "")
    if not username or not password:
        return JsonResponse({"error": "Username and password are required."}, status=400)

    user = authenticate(request, username=username, password=password)
    if user is not None and user.is_staff:
        login(request, user)
        return JsonResponse({
            "status": "ok",
            "user": {
                "username": user.username,
                "email": user.email,
                "is_staff": user.is_staff,
                "is_superuser": user.is_superuser,
            },
        })
    return JsonResponse({"error": "Invalid username or password, or unauthorized access."}, status=401)


@require_GET
def admin_me(request):
    if request.user.is_authenticated and request.user.is_staff:
        return JsonResponse({
            "authenticated": True,
            "user": {
                "username": request.user.username,
                "email": request.user.email,
                "is_staff": request.user.is_staff,
                "is_superuser": request.user.is_superuser,
            },
        })
    return JsonResponse({"authenticated": False, "user": None})


@require_POST
def admin_logout(request):
    logout(request)
    return JsonResponse({"status": "ok"})


def _is_staff(user):
    return user.is_authenticated and user.is_staff


@user_passes_test(_is_staff, login_url=None)
def admin_cohorts_api(request):
    if request.method == "GET":
        cohorts = Cohort.objects.all().order_by("-registration_start")
        return JsonResponse({"cohorts": [_cohort_payload(c, include_private=True) for c in cohorts]})

    if request.method == "POST":
        data = _json_body(request)
        if not data:
            return JsonResponse({"error": "Invalid JSON body."}, status=400)

        cohort_id = data.get("id")
        title = data.get("title", "").strip()
        track = data.get("track", "").strip()
        slug = data.get("slug", "").strip()
        status = data.get("status", Cohort.Status.ACTIVE)
        whatsapp_url = data.get("whatsapp_url", "").strip()
        syllabus = data.get("syllabus", "").strip()

        if not title or len(title) < 3:
            return JsonResponse({"error": "Cohort title must be at least 3 characters long."}, status=400)
        if not track or len(track) < 3:
            return JsonResponse({"error": "Track name must be at least 3 characters long."}, status=400)

        # Capacity validation
        try:
            max_capacity = int(data.get("max_capacity", 50))
            if max_capacity < 1 or max_capacity > 10000:
                return JsonResponse({"error": "Student capacity cap must be between 1 and 10,000 seats."}, status=400)
        except (ValueError, TypeError):
            return JsonResponse({"error": "Capacity cap must be a valid whole number."}, status=400)

        # Tuition fees validation
        try:
            base_fee = Decimal(str(data.get("base_fee", 0)))
            if base_fee < 0:
                return JsonResponse({"error": "Standard tuition fee cannot be negative."}, status=400)
        except (InvalidOperation, TypeError, ValueError):
            return JsonResponse({"error": "Standard tuition fee must be a valid number."}, status=400)

        try:
            early_bird_fee = Decimal(str(data.get("early_bird_fee", 0)))
            if early_bird_fee < 0:
                return JsonResponse({"error": "Early-bird tuition fee cannot be negative."}, status=400)
        except (InvalidOperation, TypeError, ValueError):
            return JsonResponse({"error": "Early-bird fee must be a valid number."}, status=400)

        # WhatsApp URL validation
        if whatsapp_url:
            url_validator = URLValidator(schemes=["http", "https"])
            try:
                url_validator(whatsapp_url)
            except ValidationError:
                return JsonResponse({"error": "WhatsApp link must be a valid URL (e.g. https://chat.whatsapp.com/...)"}, status=400)

        start_val = data.get("registration_start")
        end_val = data.get("registration_end")
        reg_start = None
        reg_end = None
        if start_val:
            parsed = parse_datetime(str(start_val))
            if not parsed:
                d = parse_date(str(start_val))
                if d:
                    parsed = datetime.datetime.combine(d, datetime.time.min, tzinfo=datetime.timezone.utc)
            reg_start = parsed
        if not reg_start:
            reg_start = timezone.now()

        if end_val:
            parsed = parse_datetime(str(end_val))
            if not parsed:
                d = parse_date(str(end_val))
                if d:
                    parsed = datetime.datetime.combine(d, datetime.time.max, tzinfo=datetime.timezone.utc)
            reg_end = parsed
        if not reg_end:
            reg_end = reg_start + datetime.timedelta(days=60)

        if reg_end < reg_start:
            return JsonResponse({"error": "Registration deadline cannot be earlier than the start date."}, status=400)

        cohort = None
        if cohort_id:
            cohort = Cohort.objects.filter(id=cohort_id).first()

        if not cohort and slug:
            cohort = Cohort.objects.filter(slug=slug).first()

        if cohort:
            # Enforce that cap cannot be lower than students already enrolled and paid
            paid_count = cohort.students.filter(payment_status="paid").count()
            if max_capacity < paid_count:
                return JsonResponse({
                    "error": f"Capacity cap ({max_capacity}) cannot be lower than currently enrolled students ({paid_count}). Increase the cap to at least {paid_count}."
                }, status=400)

            cohort.title = title
            cohort.track = track
            if slug:
                cohort.slug = slug
            cohort.max_capacity = max_capacity
            cohort.base_fee = base_fee
            cohort.early_bird_fee = early_bird_fee
            cohort.registration_start = reg_start
            cohort.registration_end = reg_end
            cohort.status = status
            cohort.whatsapp_url = whatsapp_url
            cohort.syllabus = syllabus
            cohort.save()
        else:
            if not slug:
                slug = slugify(title)
            base_slug = slug
            counter = 1
            while Cohort.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1

            cohort = Cohort.objects.create(
                title=title,
                track=track,
                slug=slug,
                max_capacity=max_capacity,
                base_fee=base_fee,
                early_bird_fee=early_bird_fee,
                registration_start=reg_start,
                registration_end=reg_end,
                status=status,
                whatsapp_url=whatsapp_url,
                syllabus=syllabus,
                created_by=request.user if request.user.is_authenticated else None,
            )

        return JsonResponse({
            "status": "ok",
            "message": "Cohort saved successfully.",
            "cohort": _cohort_payload(cohort, include_private=True),
        })

    return JsonResponse({"error": "Method not allowed."}, status=405)


@user_passes_test(_is_staff, login_url=None)
def admin_delete_cohort(request, cohort_id):
    if request.method not in ("POST", "DELETE"):
        return JsonResponse({"error": "Method not allowed."}, status=405)
    try:
        cohort = Cohort.objects.get(id=cohort_id)
    except Cohort.DoesNotExist:
        return JsonResponse({"error": "Cohort not found."}, status=404)

    title = cohort.title
    # Delete associated student registrations to prevent PROTECT foreign key failure
    cohort.students.all().delete()
    cohort.delete()
    return JsonResponse({
        "status": "ok",
        "message": f'Admission cohort "{title}" deleted successfully.',
    })


@user_passes_test(_is_staff, login_url=None)
def admin_delete_student(request, student_id):
    if request.method not in ("POST", "DELETE"):
        return JsonResponse({"error": "Method not allowed."}, status=405)
    try:
        student = Student.objects.get(id=student_id)
    except Student.DoesNotExist:
        return JsonResponse({"error": "Student registration not found."}, status=404)

    name = student.full_name
    student.delete()
    return JsonResponse({
        "status": "ok",
        "message": f'Student registration for "{name}" deleted successfully.',
    })


@user_passes_test(_is_staff, login_url=None)
@require_GET
def admin_overview_api(request):
    students = Student.objects.select_related("cohort").all()
    cohorts = Cohort.objects.all()

    total_students = students.count()
    paid_students = students.filter(payment_status="paid")
    total_revenue = sum((s.amount_paid for s in paid_students), Decimal("0.00"))

    foundations_students = students.filter(cohort__track__icontains="foundation")
    foundations_count = foundations_students.count()
    foundations_revenue = sum((s.amount_paid for s in foundations_students.filter(payment_status="paid")), Decimal("0.00"))

    fullstack_students = students.filter(cohort__track__icontains="full")
    fullstack_count = fullstack_students.count()
    fullstack_revenue = sum((s.amount_paid for s in fullstack_students.filter(payment_status="paid")), Decimal("0.00"))

    active_cohorts = cohorts.filter(status=Cohort.Status.ACTIVE)
    dynamic_max_cap = sum((c.max_capacity for c in active_cohorts), 0)
    if dynamic_max_cap == 0:
        dynamic_max_cap = sum((c.max_capacity for c in cohorts), 0) or 50

    recent_list = [
        {
            "id": f"{s.id:03d}",
            "name": s.full_name,
            "track": s.cohort.track,
            "amount": f"GH₵{s.amount_paid:.2f}",
            "payment_status": s.payment_status,
            "paymentStatus": "Verified Settled" if s.payment_status == "paid" else "Pending Payment",
            "date": s.registration_date.strftime("%d %b %Y, %H:%M"),
            "phone": s.whatsapp_number,
        }
        for s in students.order_by("-registration_date")[:6]
    ]

    cohort_summaries = [
        {
            "id": c.id,
            "title": c.title,
            "track": c.track,
            "status": c.status,
            "early_bird_fee": str(c.early_bird_fee),
            "whatsapp_configured": bool(c.whatsapp_url),
            "student_count": c.students.count(),
            "enrolled_count": c.students.filter(payment_status="paid").count(),
            "max_capacity": c.max_capacity,
            "remaining_seats": max(0, c.max_capacity - c.students.filter(payment_status="paid").count()),
            "is_full": c.students.filter(payment_status="paid").count() >= c.max_capacity,
        }
        for c in cohorts
    ]

    return JsonResponse({
        "total_revenue": f"GH₵{total_revenue:,.2f}",
        "total_revenue_raw": float(total_revenue),
        "total_students": total_students,
        "max_capacity": dynamic_max_cap,
        "verified_count": paid_students.count(),
        "pending_count": total_students - paid_students.count(),
        "foundations_count": foundations_count,
        "foundations_revenue": f"GH₵{foundations_revenue:,.2f}",
        "fullstack_count": fullstack_count,
        "fullstack_revenue": f"GH₵{fullstack_revenue:,.2f}",
        "recent_students": recent_list,
        "cohorts": cohort_summaries,
    })


@user_passes_test(_is_staff, login_url=None)
@require_GET
def admin_students(request):
    students = Student.objects.select_related("cohort").all()
    query = request.GET.get("q", "").strip()
    track = request.GET.get("track", "").strip()
    status = request.GET.get("status", "").strip()
    if query:
        students = (
            students.filter(full_name__icontains=query)
            | students.filter(whatsapp_number__icontains=query)
            | students.filter(email__icontains=query)
        )
    if track and track != "All Tracks":
        students = students.filter(cohort__track__icontains=track)
    if status and status != "All Payment Status":
        normalized = "paid" if ("verified" in status.lower() or "paid" in status.lower()) else "pending"
        students = students.filter(payment_status=normalized)

    data = [
        {
            "id": f"{student.id:03d}",
            "initials": "".join([part[0].upper() for part in student.full_name.split()[:2]]) or "ST",
            "name": student.full_name,
            "email": student.email,
            "phone": student.whatsapp_number,
            "track": student.cohort.track,
            "amount": f"GH₵{student.amount_paid:.2f}",
            "amount_paid": str(student.amount_paid),
            "paymentStatus": "Verified Settled" if student.payment_status == "paid" else "Pending Payment",
            "payment_status": student.payment_status,
            "paystack_reference": student.paystack_reference or "",
            "date": student.registration_date.strftime("%d %b %Y"),
            "registration_date": student.registration_date.isoformat(),
        }
        for student in students
    ]
    return JsonResponse({"students": data})


@user_passes_test(_is_staff, login_url=None)
@require_GET
def export_students(request):
    response = HttpResponse(content_type="text/csv")
    response["Content-Disposition"] = 'attachment; filename="poietik-students.csv"'
    writer = csv.writer(response)
    writer.writerow(("Name", "Email", "WhatsApp", "Track", "Amount Paid (GH₵)", "Paystack Reference", "Registration Date", "Payment Status"))
    for student in Student.objects.select_related("cohort"):
        writer.writerow((student.full_name, student.email, student.whatsapp_number, student.cohort.track, student.amount_paid, student.paystack_reference or "", student.registration_date.isoformat(), student.payment_status))
    return response


@csrf_exempt
@require_POST
def paystack_webhook(request):
    signature = request.headers.get("x-paystack-signature", "")
    secret_key = settings.PAYSTACK_SECRET_KEY
    expected = hmac.new(secret_key.encode(), request.body, hashlib.sha512).hexdigest()
    if not secret_key or not hmac.compare_digest(signature, expected):
        return JsonResponse({"error": "Invalid webhook signature."}, status=401)
    event = _json_body(request)
    if not event or event.get("event") != "charge.success":
        return JsonResponse({"received": True})
    reference = event.get("data", {}).get("reference")
    try:
        with transaction.atomic():
            student = Student.objects.select_for_update().get(paystack_reference=reference)
            student.payment_status = "paid"
            student.amount_paid = Decimal(event["data"].get("amount", 0)) / Decimal("100")
            student.save(update_fields=("payment_status", "amount_paid"))
    except (Student.DoesNotExist, InvalidOperation, KeyError):
        return JsonResponse({"error": "Unknown payment reference."}, status=404)
    return JsonResponse({"received": True})
