import json

from django.conf import settings
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.forms import PasswordResetForm
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from django.db import IntegrityError
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST

from apps.operations.models import Company

from .services import profile_for, register_company_user


def _payload(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def _error(code, message, status=400, details=None):
    return JsonResponse({"code": code, "message": message, "details": details or {}}, status=status)


@require_GET
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def login_view(request):
    data = _payload(request)
    if data is None:
        return _error("invalid_json", "El cuerpo JSON no es válido.")
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return _error("required_fields", "Correo y contraseña son obligatorios.")
    user = authenticate(request, email=email, password=password)
    if user is None:
        return _error("invalid_credentials", "Las credenciales no son válidas.", 401)
    login(request, user)
    return JsonResponse({"user": profile_for(user)})


@require_POST
def register(request):
    data = _payload(request)
    required = ("name", "phone", "email", "password", "companyId", "role")
    if data is None or any(not data.get(field) for field in required):
        return _error("required_fields", "Todos los campos son obligatorios.")
    try:
        company = Company.objects.get(pk=data["companyId"], is_active=True)
        validate_password(data["password"])
        user = register_company_user(
            name=data["name"].strip(), phone=data["phone"].strip(),
            email=data["email"].strip(), password=data["password"],
            company=company, role_code=data["role"],
        )
    except Company.DoesNotExist:
        return _error("company_not_found", "La empresa no existe.", 404)
    except ValidationError as error:
        return _error("invalid_password", "La contraseña no cumple la política.", details={"password": error.messages})
    except ValueError as error:
        return _error("invalid_role", str(error))
    except IntegrityError:
        return _error("email_exists", "Ya existe una cuenta con ese correo.", 409)
    login(request, user)
    return JsonResponse({"user": profile_for(user)}, status=201)


@require_GET
def me(request):
    if not request.user.is_authenticated:
        return _error("authentication_required", "Inicia sesión para continuar.", 401)
    return JsonResponse({"user": profile_for(request.user)})


@require_POST
def password_reset(request):
    data = _payload(request) or {}
    form = PasswordResetForm({"email": data.get("email", "")})
    if not form.is_valid():
        return _error("invalid_email", "Introduce un correo válido.", details=form.errors.get_json_data())
    form.save(
        request=request,
        use_https=request.is_secure(),
        from_email=settings.DEFAULT_FROM_EMAIL,
        email_template_name="registration/password_reset_email.html",
        extra_email_context={"frontend_url": settings.FRONTEND_URL},
    )
    return JsonResponse({"message": "Si la cuenta existe, recibirá instrucciones para recuperar el acceso."})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({}, status=204)
