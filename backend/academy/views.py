import csv
import hashlib
import hmac
import json
import os
import urllib.error
import urllib.request
import uuid
from decimal import Decimal, InvalidOperation

from django.contrib.auth.decorators import user_passes_test
from django.conf import settings
from django.db import transaction
from django.http import HttpResponse, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.csrf import ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_POST

from .models import Cohort, Student


def _json_body(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def _cohort_payload(cohort):
    return {
        "id": cohort.id,
        "title": cohort.title,
        "track": cohort.track,
        "slug": cohort.slug,
        "base_fee": str(cohort.base_fee),
        "early_bird_fee": str(cohort.early_bird_fee),
        "registration_start": cohort.registration_start,
        "registration_end": cohort.registration_end,
        "status": cohort.status,
        "whatsapp_url": cohort.whatsapp_url,
        "orientation_url": cohort.orientation_url,
    }


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
    required = ("full_name", "email", "whatsapp_number", "cohort_slug")
    if any(not data.get(key) for key in required):
        return JsonResponse({"error": "Full name, email, WhatsApp number, and cohort are required."}, status=400)
    try:
        cohort = Cohort.objects.get(slug=data["cohort_slug"], status=Cohort.Status.ACTIVE)
    except Cohort.DoesNotExist:
        return JsonResponse({"error": "This cohort is not accepting registrations."}, status=404)

    student = Student.objects.create(full_name=data["full_name"], email=data["email"], whatsapp_number=data["whatsapp_number"], cohort=cohort, amount_paid=cohort.early_bird_fee)
    reference = f"POI-{student.id}-{uuid.uuid4().hex[:10].upper()}"
    student.paystack_reference = reference
    student.save(update_fields=("paystack_reference",))

    secret_key = os.environ.get("PAYSTACK_SECRET_KEY")
    if not secret_key:
        return JsonResponse({"reference": reference, "authorization_url": None, "message": "PAYSTACK_SECRET_KEY is not configured."}, status=201)
    payload = json.dumps({"email": student.email, "amount": int(cohort.early_bird_fee * 100), "reference": reference, "callback_url": os.environ.get("PAYSTACK_CALLBACK_URL", "")}).encode()
    request = urllib.request.Request("https://api.paystack.co/transaction/initialize", data=payload, headers={"Authorization": f"Bearer {secret_key}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=15) as response:
            paystack_data = json.loads(response.read().decode())
    except (urllib.error.URLError, json.JSONDecodeError) as error:
        return JsonResponse({"error": f"Unable to initialize Paystack checkout: {error}"}, status=502)
    if not paystack_data.get("status"):
        return JsonResponse({"error": paystack_data.get("message", "Paystack rejected the request.")}, status=502)
    return JsonResponse({"reference": reference, "authorization_url": paystack_data["data"]["authorization_url"]}, status=201)


def _is_staff(request):
    return request.user.is_authenticated and request.user.is_staff


@user_passes_test(_is_staff, login_url=None)
@require_GET
def admin_students(request):
    students = Student.objects.select_related("cohort").all()
    query = request.GET.get("q", "").strip()
    track = request.GET.get("track", "").strip()
    status = request.GET.get("status", "").strip()
    if query:
        students = students.filter(full_name__icontains=query) | students.filter(whatsapp_number__icontains=query)
    if track:
        students = students.filter(cohort__track=track)
    if status:
        students = students.filter(payment_status=status)
    data = [{"id": student.id, "name": student.full_name, "email": student.email, "whatsapp_number": student.whatsapp_number, "track": student.cohort.track, "amount_paid": str(student.amount_paid), "paystack_reference": student.paystack_reference, "registration_date": student.registration_date, "payment_status": student.payment_status} for student in students]
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
