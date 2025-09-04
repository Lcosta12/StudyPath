from django.urls import path
from .views import importar_materias

urlpatterns = [
    path("importar/", importar_materias, name="importar_materias"),
]
