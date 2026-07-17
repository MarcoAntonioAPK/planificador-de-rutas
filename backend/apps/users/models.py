from django.contrib.auth.models import AbstractUser
from django.db import models

from .managers import UserManager


class User(AbstractUser):
    class Role(models.TextChoices):
        ADMIN = "admin", "Administrador"
        PLANNER = "planner", "Planificador"
        DRIVER = "driver", "Conductor"

    username = None
    email = models.EmailField("correo electrónico", unique=True)
    name = models.CharField("nombre", max_length=150)
    role = models.CharField("rol", max_length=20, choices=Role.choices, default=Role.PLANNER)
    created_at = models.DateTimeField("creado", auto_now_add=True)
    updated_at = models.DateTimeField("actualizado", auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["name"]
    objects = UserManager()

    def __str__(self):
        return self.email
