from django.contrib.auth import get_user_model
from django.db import transaction

from apps.operations.models import Company, Membership

from .models import Role


@transaction.atomic
def register_company_user(*, name, phone, email, password, company, role_code):
    """Crea un usuario dentro de una empresa sin permitir escalamiento de rol."""
    if role_code not in (Role.Code.PLANNER, Role.Code.DRIVER):
        raise ValueError("Solo puedes registrarte como Planificador o Chofer.")
    role = Role.objects.get(code=role_code)
    user = get_user_model().objects.create_user(
        email=email.lower(), password=password, name=name, phone=phone
    )
    Membership.objects.create(company=company, user=user, role=role)
    return user


def profile_for(user):
    memberships = user.memberships.select_related("company", "role")
    return {
        "id": user.pk,
        "email": user.email,
        "name": user.name,
        "phone": user.phone,
        "isSuperAdmin": user.is_superuser,
        "memberships": [
            {
                "companyId": item.company_id,
                "company": item.company.name,
                "role": item.role.code,
                "theme": {
                    "primary": item.company.primary_color,
                    "secondary": item.company.secondary_color,
                    "accent": item.company.accent_color,
                    "logoUrl": item.company.logo_url,
                },
            }
            for item in memberships
        ],
    }
