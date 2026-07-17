from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    username = None
    email = models.EmailField("correo electrónico", unique=True)
    name = models.CharField("nombre completo", max_length=150)
    phone = models.CharField("número de teléfono", max_length=20)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]
    objects = UserManager()

    def __str__(self):
        return self.email


class Role(models.Model):
    """Catálogo global de perfiles; los permisos no se guardan como texto en User."""

    class Code(models.TextChoices):
        SUPERADMIN = "superadmin", "SuperAdmin"
        ADMIN = "admin", "Admin"
        PLANNER = "planner", "Planificador"
        DRIVER = "driver", "Chofer"

    code = models.CharField("código", max_length=20, choices=Code.choices, unique=True)
    name = models.CharField("nombre", max_length=40)

    def __str__(self):
        return self.name
