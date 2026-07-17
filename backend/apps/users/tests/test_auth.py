import json
from django.test import Client, TestCase
from django.urls import reverse

from apps.operations.models import Company, Membership
from apps.users.models import Role, User


class AuthenticationTests(TestCase):
    def setUp(self):
        self.role = Role.objects.get(code=Role.Code.PLANNER)
        self.company = Company.objects.create(name="Prueba", slug="prueba")
        self.user = User.objects.create_user(email="planner@example.com", password="safe-password-123", name="Laura", phone="5551234567")
        Membership.objects.create(company=self.company, user=self.user, role=self.role)
        self.client = Client(enforce_csrf_checks=True)

    def test_user_uses_email_as_identifier(self):
        self.assertEqual(self.user.email, "planner@example.com")
        self.assertEqual(self.user.USERNAME_FIELD, "email")
        self.assertEqual(self.user.memberships.get().role.code, Role.Code.PLANNER)

    def test_login_requires_csrf_and_returns_safe_profile(self):
        csrf_response = self.client.get(reverse("users:csrf"))
        token = csrf_response.json()["csrfToken"]
        response = self.client.post(
            reverse("users:login"),
            data=json.dumps({"email": self.user.email, "password": "safe-password-123"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["user"]["email"], self.user.email)
        self.assertNotIn("password", response.json()["user"])
        self.assertEqual(response.json()["user"]["memberships"][0]["company"], "Prueba")

    def test_login_rejects_invalid_credentials(self):
        token = self.client.get(reverse("users:csrf")).json()["csrfToken"]
        response = self.client.post(
            reverse("users:login"),
            data=json.dumps({"email": self.user.email, "password": "incorrect"}),
            content_type="application/json",
            HTTP_X_CSRFTOKEN=token,
        )
        self.assertEqual(response.status_code, 401)
        self.assertEqual(response.json()["code"], "invalid_credentials")
