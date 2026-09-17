import os
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
from academy.models import Cohort


class Command(BaseCommand):
    help = "Sets up the initial superuser admin and default active cohort for deployment."

    def handle(self, *args, **options):
        User = get_user_model()
        username = os.environ.get("ADMIN_USERNAME", "saint-poietik").strip()
        password = os.environ.get("ADMIN_PASSWORD", "poietikacademyi$thebestinwEb£duc8tion").strip()
        email = os.environ.get("ADMIN_EMAIL", "ignituspoietik@gmail.com").strip()

        # 1. Ensure Superuser exists and has correct password
        admin_user, created = User.objects.get_or_create(
            username=username,
            defaults={
                "email": email,
                "is_staff": True,
                "is_superuser": True,
            },
        )
        admin_user.set_password(password)
        admin_user.is_staff = True
        admin_user.is_superuser = True
        admin_user.email = email
        admin_user.save()

        if created:
            self.stdout.write(self.style.SUCCESS(f"[setup_initial_data] Created superuser '{username}'."))
        else:
            self.stdout.write(self.style.SUCCESS(f"[setup_initial_data] Updated superuser '{username}' credentials."))

        # 2. Ensure initial active cohort exists if database is fresh
        if not Cohort.objects.filter(status=Cohort.Status.ACTIVE).exists():
            now = timezone.now()
            default_whatsapp = os.environ.get("WHATSAPP_GROUP_URL", "https://chat.whatsapp.com/EQCSUbUfF555mJtbhk5uoT")
            cohort, c_created = Cohort.objects.get_or_create(
                slug="cohort-001",
                defaults={
                    "title": "Cohort 001 — Web Foundations & Full-Stack",
                    "track": "Full-Stack Development",
                    "base_fee": Decimal("1800.00"),
                    "early_bird_fee": Decimal("1200.00"),
                    "max_capacity": 50,
                    "registration_start": now - timedelta(days=7),
                    "registration_end": now + timedelta(days=90),
                    "syllabus": "Modern Full-Stack Web Development curriculum covering HTML5/CSS3, JavaScript (ES6+), React 19, Python/Django 6, PostgreSQL, and Cloud Deployment.",
                    "status": Cohort.Status.ACTIVE,
                    "whatsapp_url": default_whatsapp,
                    "created_by": admin_user,
                },
            )
            if c_created:
                self.stdout.write(self.style.SUCCESS(f"[setup_initial_data] Created initial active cohort '{cohort.title}'."))
            else:
                self.stdout.write(self.style.SUCCESS(f"[setup_initial_data] Initial cohort '{cohort.title}' already exists."))
        else:
            self.stdout.write(self.style.SUCCESS("[setup_initial_data] Active cohort(s) already exist in database."))

        self.stdout.write(self.style.SUCCESS("[setup_initial_data] Initialization complete!"))

