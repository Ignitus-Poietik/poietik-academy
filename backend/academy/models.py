from django.conf import settings
from django.db import models
from django.utils.text import slugify


class Cohort(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Draft"
        ACTIVE = "active", "Active"
        CLOSED = "closed", "Closed"
        ARCHIVED = "archived", "Archived"

    title = models.CharField(max_length=160)
    track = models.CharField(max_length=120)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    base_fee = models.DecimalField(max_digits=10, decimal_places=2)
    early_bird_fee = models.DecimalField(max_digits=10, decimal_places=2)
    registration_start = models.DateTimeField()
    registration_end = models.DateTimeField()
    syllabus = models.TextField(blank=True)
    status = models.CharField(max_length=12, choices=Status.choices, default=Status.DRAFT)
    whatsapp_url = models.URLField(blank=True)
    orientation_url = models.URLField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, on_delete=models.SET_NULL)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.title)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.title} - {self.track}"


class Student(models.Model):
    full_name = models.CharField(max_length=160)
    email = models.EmailField()
    whatsapp_number = models.CharField(max_length=24)
    cohort = models.ForeignKey(Cohort, on_delete=models.PROTECT, related_name="students")
    amount_paid = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    paystack_reference = models.CharField(max_length=120, blank=True, unique=True, null=True)
    payment_status = models.CharField(max_length=20, default="pending")
    registration_date = models.DateTimeField(auto_now_add=True)
    whatsapp_invite_sent = models.BooleanField(default=False)

    class Meta:
        ordering = ("-registration_date",)

    def __str__(self):
        return self.full_name
