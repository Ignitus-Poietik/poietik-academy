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
    path("admin/overview/", views.admin_overview_api, name="admin-overview-api"),
    path("admin/cohorts/", views.admin_cohorts_api, name="admin-cohorts-api"),
    path("admin/cohorts/<int:cohort_id>/delete/", views.admin_delete_cohort, name="admin-delete-cohort"),
    path("admin/students/", views.admin_students, name="admin-students"),
    path("admin/students/<int:student_id>/delete/", views.admin_delete_student, name="admin-delete-student"),
    path("admin/students/export/", views.export_students, name="export-students"),
]
