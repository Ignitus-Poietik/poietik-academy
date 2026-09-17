from django.urls import path

from . import views

urlpatterns = [
    path("csrf/", views.csrf_token, name="csrf-token"),
    path("cohorts/", views.public_cohorts, name="public-cohorts"),
    path("enroll/initialize/", views.initialize_payment, name="initialize-payment"),
    path("payments/verify/", views.verify_payment, name="verify-payment"),
    path("payments/paystack/webhook/", views.paystack_webhook, name="paystack-webhook"),
    path("admin/login/", views.admin_login, name="admin-login"),
    path("admin/me/", views.admin_me, name="admin-me"),
    path("admin/logout/", views.admin_logout, name="admin-logout"),
    path("admin/students/", views.admin_students, name="admin-students"),
    path("admin/students/export/", views.export_students, name="export-students"),
]
