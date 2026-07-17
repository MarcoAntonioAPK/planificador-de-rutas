import json

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.middleware.csrf import get_token
from django.views.decorators.http import require_GET, require_POST


def _payload(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


@require_GET
def csrf(request):
    return JsonResponse({"csrfToken": get_token(request)})


@require_POST
def login_view(request):
    data = _payload(request)
    if data is None:
        return JsonResponse({"code": "invalid_json", "message": "El cuerpo JSON no es válido.", "details": {}}, status=400)
    email = data.get("email", "").strip().lower()
    password = data.get("password", "")
    if not email or not password:
        return JsonResponse({"code": "required_fields", "message": "Correo y contraseña son obligatorios.", "details": {}}, status=400)
    user = authenticate(request, email=email, password=password)
    if user is None:
        return JsonResponse({"code": "invalid_credentials", "message": "Las credenciales no son válidas.", "details": {}}, status=401)
    login(request, user)
    return JsonResponse({"user": {"id": user.pk, "email": user.email, "name": user.name, "role": user.role}})


@require_POST
def logout_view(request):
    logout(request)
    return JsonResponse({}, status=204)
