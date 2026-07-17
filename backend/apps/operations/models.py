from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

from apps.users.models import Role


class Company(models.Model):
    name = models.CharField("razón social", max_length=160)
    slug = models.SlugField(unique=True)
    is_active = models.BooleanField(default=True)
    primary_color = models.CharField(max_length=7, default="#2563EB")
    secondary_color = models.CharField(max_length=7, default="#0F172A")
    accent_color = models.CharField(max_length=7, default="#16A36A")
    logo_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "empresas"

    def __str__(self):
        return self.name


class Membership(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="memberships")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="memberships")
    role = models.ForeignKey(Role, on_delete=models.PROTECT, related_name="memberships")
    supervisor = models.ForeignKey("self", blank=True, null=True, on_delete=models.SET_NULL, related_name="reports")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("company", "user"), name="unique_company_user")]
        indexes = [models.Index(fields=("company", "role"), name="membership_company_role_idx")]


class TruckType(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="truck_types")
    name = models.CharField(max_length=80)
    height_cm = models.PositiveIntegerField()
    width_cm = models.PositiveIntegerField()
    length_cm = models.PositiveIntegerField()
    gross_weight_kg = models.PositiveIntegerField()
    axle_count = models.PositiveSmallIntegerField(validators=[MinValueValidator(2), MaxValueValidator(12)])
    trailer_count = models.PositiveSmallIntegerField(default=1, validators=[MaxValueValidator(3)])
    is_active = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("company", "name"), name="unique_company_truck_type")]


class RestrictedZoneGroup(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="zone_groups")
    name = models.CharField(max_length=100)
    description = models.CharField(max_length=250, blank=True)
    color = models.CharField(max_length=7, default="#DC2626")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_zone_groups")
    is_visible = models.BooleanField(default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=("company", "name"), name="unique_company_zone_group")]


class RestrictedZone(models.Model):
    group = models.ForeignKey(RestrictedZoneGroup, on_delete=models.CASCADE, related_name="zones")
    name = models.CharField(max_length=120)
    polygon = models.JSONField(help_text="GeoJSON Polygon en coordenadas longitud/latitud")
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="created_zones")
    created_at = models.DateTimeField(auto_now_add=True)


class PlannedRoute(models.Model):
    class Status(models.TextChoices):
        DRAFT = "draft", "Borrador"
        ASSIGNED = "assigned", "Asignada"
        IN_PROGRESS = "in_progress", "En curso"
        COMPLETED = "completed", "Completada"

    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="routes")
    planner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name="planned_routes")
    driver = models.ForeignKey(settings.AUTH_USER_MODEL, blank=True, null=True, on_delete=models.PROTECT, related_name="assigned_routes")
    truck_type = models.ForeignKey(TruckType, on_delete=models.PROTECT, related_name="routes")
    name = models.CharField(max_length=140)
    origin = models.JSONField(help_text="Punto GeoJSON")
    destination = models.JSONField(help_text="Punto GeoJSON")
    route_geometry = models.JSONField(blank=True, default=dict)
    cargo_type = models.CharField(max_length=100)
    cargo_weight_kg = models.PositiveIntegerField()
    departure_at = models.DateTimeField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.DRAFT)
    distance_m = models.PositiveIntegerField(blank=True, null=True)
    duration_seconds = models.PositiveIntegerField(blank=True, null=True)
    here_request = models.JSONField(blank=True, default=dict)
    restricted_zones = models.ManyToManyField(RestrictedZone, blank=True, related_name="routes")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        indexes = [models.Index(fields=("company", "status", "departure_at"), name="route_company_status_idx")]
