from django.urls import path

from . import views

urlpatterns = [
    path("csrf/", views.csrf_token, name="csrf-token"),
    path("cohorts/", views.public_cohorts, name="public-cohorts"),
    path("enroll/initialize/", views.initialize_payment, name="initialize-payment"),
    path("admin/students/", views.admin_students, name="admin-students"),
    path("admin/students/export/", views.export_students, name="export-students"),
    path("payments/paystack/webhook/", views.paystack_webhook, name="paystack-webhook"),
]
