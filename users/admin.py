from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Exibe colunas extras no admin
    list_display = ("username", "email", "first_name", "last_name", "curso", "is_staff")
