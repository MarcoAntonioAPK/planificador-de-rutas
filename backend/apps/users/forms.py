from django.contrib.auth.forms import UserChangeForm, UserCreationForm

from .models import User


class RouteFlowUserCreationForm(UserCreationForm):
    class Meta(UserCreationForm.Meta):
        model = User
        fields = ("email", "name", "phone")


class RouteFlowUserChangeForm(UserChangeForm):
    class Meta(UserChangeForm.Meta):
        model = User
        fields = "__all__"
