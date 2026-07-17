import json

from django.contrib.auth import get_user_model
from django.core.exceptions import PermissionDenied
from django.db import IntegrityError, transaction
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from django.views.decorators.http import require_http_methods

from apps.users.models import Role

from .models import Company, Membership, PlannedRoute, RestrictedZone, RestrictedZoneGroup, TruckType
from .services import ensure_route_access, here_truck_parameters, membership_for


def payload(request):
    try:
        return json.loads(request.body or "{}")
    except json.JSONDecodeError:
        return None


def error(code, message, status=400):
    return JsonResponse({"code": code, "message": message, "details": {}}, status=status)


def authenticated(view):
    def wrapped(request, *args, **kwargs):
        if not request.user.is_authenticated:
            return error("authentication_required", "Inicia sesión para continuar.", 401)
        try:
            return view(request, *args, **kwargs)
        except PermissionDenied:
            return error("permission_denied", "No tienes permisos para esta operación.", 403)
    return wrapped


@require_http_methods(["GET", "POST"])
@authenticated
def companies(request):
    if request.method == "GET":
        query = Company.objects.all() if request.user.is_superuser else Company.objects.filter(memberships__user=request.user)
        return JsonResponse({"companies": [{"id": c.id, "name": c.name, "slug": c.slug, "theme": {"primary": c.primary_color, "secondary": c.secondary_color, "accent": c.accent_color, "logoUrl": c.logo_url}} for c in query.distinct()]})
    if not request.user.is_superuser:
        raise PermissionDenied
    data = payload(request) or {}
    required = ("name", "slug", "adminEmail")
    if any(not data.get(key) for key in required):
        return error("required_fields", "Empresa, identificador y correo de Admin son obligatorios.")
    try:
        with transaction.atomic():
            company = Company.objects.create(name=data["name"], slug=data["slug"], primary_color=data.get("primaryColor", "#2563EB"), secondary_color=data.get("secondaryColor", "#0F172A"), accent_color=data.get("accentColor", "#16A36A"))
            user, created = get_user_model().objects.get_or_create(email=data["adminEmail"].lower(), defaults={"name": data.get("adminName", "Administrador"), "phone": data.get("adminPhone", "Pendiente")})
            if created:
                user.set_unusable_password(); user.save(update_fields=("password",))
            Membership.objects.create(company=company, user=user, role=Role.objects.get(code=Role.Code.ADMIN))
    except IntegrityError:
        return error("company_conflict", "La empresa o la relación ya existe.", 409)
    return JsonResponse({"id": company.id, "name": company.name}, status=201)


@require_http_methods(["GET", "POST"])
@authenticated
def members(request, company_id):
    membership_for(request.user, company_id, {Role.Code.ADMIN})
    if request.method == "GET":
        rows = Membership.objects.filter(company_id=company_id).select_related("user", "role", "supervisor__user")
        return JsonResponse({"members": [{"id": m.id, "name": m.user.name, "email": m.user.email, "phone": m.user.phone, "role": m.role.code, "supervisor": m.supervisor.user.name if m.supervisor else None} for m in rows]})
    data = payload(request) or {}
    if data.get("role") not in (Role.Code.PLANNER, Role.Code.DRIVER):
        return error("invalid_role", "Solo se pueden dar de alta Planificadores y Choferes.")
    user, created = get_user_model().objects.get_or_create(email=data.get("email", "").lower(), defaults={"name": data.get("name", ""), "phone": data.get("phone", "")})
    if created:
        user.set_password(data.get("password", "Temporal2026.")); user.save(update_fields=("password",))
    try:
        item = Membership.objects.create(company_id=company_id, user=user, role=Role.objects.get(code=data["role"]), supervisor_id=data.get("supervisorId"))
    except IntegrityError:
        return error("membership_exists", "El usuario ya pertenece a la empresa.", 409)
    return JsonResponse({"id": item.id}, status=201)


@require_http_methods(["GET", "POST"])
@authenticated
def trucks(request, company_id):
    membership_for(request.user, company_id, {Role.Code.ADMIN, Role.Code.PLANNER})
    if request.method == "GET":
        return JsonResponse({"truckTypes": list(TruckType.objects.filter(company_id=company_id).values())})
    data = payload(request) or {}
    item = TruckType.objects.create(company_id=company_id, name=data["name"], height_cm=data["heightCm"], width_cm=data["widthCm"], length_cm=data["lengthCm"], gross_weight_kg=data["grossWeightKg"], axle_count=data["axleCount"], trailer_count=data.get("trailerCount", 1))
    return JsonResponse({"id": item.id}, status=201)


@require_http_methods(["GET", "POST"])
@authenticated
def zones(request, company_id):
    membership_for(request.user, company_id, {Role.Code.ADMIN, Role.Code.PLANNER})
    if request.method == "GET":
        groups = RestrictedZoneGroup.objects.filter(company_id=company_id).prefetch_related("zones")
        return JsonResponse({"groups": [{"id": group.id, "name": group.name, "color": group.color, "visible": group.is_visible, "zones": [{"id": zone.id, "name": zone.name, "polygon": zone.polygon} for zone in group.zones.all()]} for group in groups]})
    data = payload(request) or {}
    group, _ = RestrictedZoneGroup.objects.get_or_create(company_id=company_id, name=data["groupName"], defaults={"created_by": request.user, "color": data.get("color", "#DC2626")})
    zone = RestrictedZone.objects.create(group=group, name=data["name"], polygon=data["polygon"], created_by=request.user)
    return JsonResponse({"id": zone.id, "groupId": group.id}, status=201)


@require_http_methods(["GET", "POST"])
@authenticated
def routes(request, company_id):
    membership = membership_for(request.user, company_id)
    query = PlannedRoute.objects.filter(company_id=company_id).select_related("driver", "planner", "truck_type")
    if membership and membership.role.code == Role.Code.PLANNER:
        query = query.filter(planner=request.user)
    elif membership and membership.role.code == Role.Code.DRIVER:
        query = query.filter(driver=request.user)
    if request.method == "GET":
        return JsonResponse({"routes": [{"id": route.id, "name": route.name, "status": route.status, "driver": route.driver.name if route.driver else None, "departureAt": route.departure_at.isoformat(), "cargoType": route.cargo_type} for route in query]})
    if membership and membership.role.code not in (Role.Code.ADMIN, Role.Code.PLANNER):
        raise PermissionDenied
    data = payload(request) or {}
    truck = get_object_or_404(TruckType, pk=data["truckTypeId"], company_id=company_id)
    route = PlannedRoute.objects.create(company_id=company_id, planner=request.user, driver_id=data.get("driverId"), truck_type=truck, name=data["name"], origin=data["origin"], destination=data["destination"], cargo_type=data["cargoType"], cargo_weight_kg=data["cargoWeightKg"], departure_at=data["departureAt"], status=PlannedRoute.Status.ASSIGNED if data.get("driverId") else PlannedRoute.Status.DRAFT, here_request={"routing": {**here_truck_parameters(truck), "departureTime": data["departureAt"]}, "internalContext": {"cargoType": data["cargoType"], "cargoWeightKg": data["cargoWeightKg"]}})
    route.restricted_zones.set(data.get("restrictedZoneIds", []))
    return JsonResponse({"id": route.id, "hereRequest": route.here_request}, status=201)


@require_http_methods(["GET"])
@authenticated
def route_detail(request, route_id):
    route = get_object_or_404(PlannedRoute.objects.select_related("company", "planner", "driver", "truck_type"), pk=route_id)
    ensure_route_access(request.user, route)
    return JsonResponse({"route": {"id": route.id, "name": route.name, "company": route.company.name, "planner": route.planner.name, "driver": route.driver.name if route.driver else None, "origin": route.origin, "destination": route.destination, "cargoType": route.cargo_type, "cargoWeightKg": route.cargo_weight_kg, "departureAt": route.departure_at.isoformat(), "truckType": route.truck_type.name, "distanceM": route.distance_m, "durationSeconds": route.duration_seconds}})
