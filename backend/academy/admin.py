from django.contrib import admin
from .models import Cohort, Student


@admin.register(Cohort)
class CohortAdmin(admin.ModelAdmin):
    list_display = ("title", "track", "early_bird_fee", "status", "registration_end")
    list_filter = ("status", "track")
    search_fields = ("title", "track", "slug")
    prepopulated_fields = {"slug": ("title",)}


@admin.register(Student)
class StudentAdmin(admin.ModelAdmin):
    list_display = ("full_name", "email", "cohort", "amount_paid", "payment_status", "registration_date")
    list_filter = ("payment_status", "cohort__track")
    search_fields = ("full_name", "email", "whatsapp_number", "paystack_reference")
    readonly_fields = ("registration_date",)
