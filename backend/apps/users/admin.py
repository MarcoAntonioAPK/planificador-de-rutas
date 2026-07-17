from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .forms import RouteFlowUserChangeForm, RouteFlowUserCreationForm
from .models import User


@admin.register(User)
class RouteFlowUserAdmin(UserAdmin):
    add_form = RouteFlowUserCreationForm
    form = RouteFlowUserChangeForm
    ordering = ("email",)
    list_display = ("email", "name", "role", "is_active", "is_staff")
    search_fields = ("email", "name")
    fieldsets = (
        (None, {"fields": ("email", "password")}),
        ("Perfil", {"fields": ("name", "role")}),
        ("Permisos", {"fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions")}),
        ("Fechas", {"fields": ("last_login", "date_joined", "created_at", "updated_at")}),
    )
    readonly_fields = ("created_at", "updated_at")
    add_fieldsets = ((None, {"classes": ("wide",), "fields": ("email", "name", "role", "password1", "password2")}),)
