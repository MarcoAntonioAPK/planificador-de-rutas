import json
from datetime import timedelta

from django.test import TestCase
from django.utils import timezone

from apps.operations.models import Company, Membership, PlannedRoute, TruckType
from apps.users.models import Role, User


class TenantPermissionTests(TestCase):
    def setUp(self):
        self.company = Company.objects.create(name="Salzillo", slug="salzillo")
        self.other_company = Company.objects.create(name="Otra", slug="otra")
        self.roles = {role.code: role for role in Role.objects.all()}
        self.admin = self.member("admin@test.mx", "Admin", Role.Code.ADMIN)
        self.planner = self.member("planner@test.mx", "Planner", Role.Code.PLANNER)
        self.driver = self.member("driver@test.mx", "Driver", Role.Code.DRIVER)
        self.truck = TruckType.objects.create(company=self.company, name="Caja seca", height_cm=410, width_cm=260, length_cm=2100, gross_weight_kg=48000, axle_count=5)
        self.route = PlannedRoute.objects.create(company=self.company, planner=self.planner, driver=self.driver, truck_type=self.truck, name="Ruta prueba", origin={"type": "Point", "coordinates": [-106, 28]}, destination={"type": "Point", "coordinates": [-100, 25]}, cargo_type="General", cargo_weight_kg=10000, departure_at=timezone.now() + timedelta(hours=1))

    def member(self, email, name, role):
        user = User.objects.create_user(email=email, name=name, phone="5550000000", password="Temporal2026.")
        Membership.objects.create(company=self.company, user=user, role=self.roles[role])
        return user

    def test_driver_only_lists_assigned_routes(self):
        self.client.force_login(self.driver)
        response = self.client.get(f"/api/v1/companies/{self.company.id}/routes/")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["routes"][0]["id"], self.route.id)

    def test_driver_cannot_create_route(self):
        self.client.force_login(self.driver)
        response = self.client.post(f"/api/v1/companies/{self.company.id}/routes/", data=json.dumps({}), content_type="application/json")
        self.assertEqual(response.status_code, 403)

    def test_admin_cannot_read_another_company(self):
        self.client.force_login(self.admin)
        response = self.client.get(f"/api/v1/companies/{self.other_company.id}/members/")
        self.assertEqual(response.status_code, 403)
