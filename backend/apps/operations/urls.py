from django.urls import path

from . import views

urlpatterns = [
    path("companies/", views.companies, name="companies"),
    path("companies/<int:company_id>/members/", views.members, name="members"),
    path("companies/<int:company_id>/truck-types/", views.trucks, name="trucks"),
    path("companies/<int:company_id>/restricted-zones/", views.zones, name="zones"),
    path("companies/<int:company_id>/routes/", views.routes, name="routes"),
    path("routes/<int:route_id>/", views.route_detail, name="route-detail"),
]
