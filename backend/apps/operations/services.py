from django.core.exceptions import PermissionDenied

from apps.users.models import Role


def membership_for(user, company_id, allowed_roles=None):
    if user.is_superuser:
        return None
    membership = user.memberships.select_related("role").filter(
        company_id=company_id, is_active=True
    ).first()
    if not membership or (allowed_roles and membership.role.code not in allowed_roles):
        raise PermissionDenied
    return membership


def ensure_route_access(user, route, write=False):
    membership = membership_for(user, route.company_id)
    if membership is None or membership.role.code == Role.Code.ADMIN:
        return
    if membership.role.code == Role.Code.PLANNER and route.planner_id == user.id:
        return
    if not write and membership.role.code == Role.Code.DRIVER and route.driver_id == user.id:
        return
    raise PermissionDenied


def here_truck_parameters(truck):
    """Parámetros compatibles con Routing API v8; las medidas se expresan en cm/kg."""
    return {
        "transportMode": "truck",
        "vehicle[height]": truck.height_cm,
        "vehicle[width]": truck.width_cm,
        "vehicle[length]": truck.length_cm,
        "vehicle[grossWeight]": truck.gross_weight_kg,
        "vehicle[axleCount]": truck.axle_count,
        "vehicle[trailerCount]": truck.trailer_count,
    }
