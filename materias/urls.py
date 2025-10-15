from django.urls import path
from .views import importar_materias, MateriaListView, MateriaUpdateView

urlpatterns = [
    path("importar/", importar_materias, name="importar_materias"),
    path("", MateriaListView.as_view(), name="listar_materias"),
    path("<int:pk>/", MateriaUpdateView.as_view(), name="atualizar_materia"),
]
