from django.db import migrations, models


def seed_roles(apps, schema_editor):
    Role = apps.get_model("users", "Role")
    for code, name in (
        ("superadmin", "SuperAdmin"),
        ("admin", "Admin"),
        ("planner", "Planificador"),
        ("driver", "Chofer"),
    ):
        Role.objects.get_or_create(code=code, defaults={"name": name})


class Migration(migrations.Migration):
    dependencies = [("users", "0001_initial")]
    operations = [
        migrations.CreateModel(
            name="Role",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("code", models.CharField(choices=[("superadmin", "SuperAdmin"), ("admin", "Admin"), ("planner", "Planificador"), ("driver", "Chofer")], max_length=20, unique=True, verbose_name="código")),
                ("name", models.CharField(max_length=40, verbose_name="nombre")),
            ],
        ),
        migrations.AddField(model_name="user", name="phone", field=models.CharField(default="", max_length=20, verbose_name="número de teléfono"), preserve_default=False),
        migrations.AlterField(model_name="user", name="name", field=models.CharField(max_length=150, verbose_name="nombre completo")),
        migrations.RemoveField(model_name="user", name="role"),
        migrations.RunPython(seed_roles, migrations.RunPython.noop),
    ]
