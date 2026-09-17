import hashlib
import hmac
import json
import os
from datetime import timedelta
from decimal import Decimal

from django.test import TestCase, override_settings
from django.urls import reverse
from django.utils import timezone

from .models import Cohort, Student


class PaymentFlowTests(TestCase):
    def setUp(self):
        self.cohort = Cohort.objects.create(title="Cohort 001", track="Web Foundations", slug="cohort-001", base_fee=Decimal("500"), early_bird_fee=Decimal("400"), registration_start=timezone.now() - timedelta(days=1), registration_end=timezone.now() + timedelta(days=10), status=Cohort.Status.ACTIVE)

    def test_public_cohorts_only_returns_active_open_cohorts(self):
        response = self.client.get(reverse("public-cohorts"))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()["cohorts"]), 1)

    @override_settings(PAYSTACK_SECRET_KEY="test-secret")
    def test_webhook_marks_matching_student_paid(self):
        student = Student.objects.create(full_name="Ama Serwaa", email="ama@example.com", whatsapp_number="+233240000000", cohort=self.cohort, paystack_reference="PSK-001")
        payload = {"event": "charge.success", "data": {"reference": student.paystack_reference, "amount": 40000}}
        body = json.dumps(payload).encode()
        signature = hmac.new(b"test-secret", body, hashlib.sha512).hexdigest()
        with override_settings(PAYSTACK_SECRET_KEY="test-secret"):
            response = self.client.post(reverse("paystack-webhook"), body, content_type="application/json", HTTP_X_PAYSTACK_SIGNATURE=signature)
        self.assertEqual(response.status_code, 200)
        student.refresh_from_db()
        self.assertEqual(student.payment_status, "paid")
        self.assertEqual(student.amount_paid, Decimal("400"))
