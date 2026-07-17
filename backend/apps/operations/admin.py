from django.contrib import admin

from .models import Company, Membership, PlannedRoute, RestrictedZone, RestrictedZoneGroup, TruckType

admin.site.register((Company, Membership, TruckType, RestrictedZoneGroup, RestrictedZone, PlannedRoute))
