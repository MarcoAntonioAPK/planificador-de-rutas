from django.urls import path
from . import views

app_name = "users"
urlpatterns = [
    path("csrf/", views.csrf, name="csrf"),
    path("login/", views.login_view, name="login"),
    path("register/", views.register, name="register"),
    path("me/", views.me, name="me"),
    path("password-reset/", views.password_reset, name="password-reset"),
    path("logout/", views.logout_view, name="logout"),
]
