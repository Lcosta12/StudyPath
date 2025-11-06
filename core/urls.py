from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from users.views import RegisterView, CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView


def home(request):
    """View simples para a página raiz da API"""
    html = """
    <h1>StudyPath API</h1>
    <p>Backend funcionando corretamente</p>
    
    <h2>Rotas Disponíveis</h2>
    <ul>
        <li>/admin/ - Painel administrativo</li>
        <li>/api/register/ - Registrar usuário</li>
        <li>/api/token/ - Obter token JWT</li>
        <li>/api/token/refresh/ - Refresh token</li>
        <li>/users/ - API usuários</li>
        <li>/materias/ - API matérias</li>
    </ul>
    """
    return HttpResponse(html)


urlpatterns = [
    path("", home, name="home"),
    path("admin/", admin.site.urls),
    path("api/register/", RegisterView.as_view(), name="register"),
    path("api/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),

    path("users/", include("users.urls")),
    path("materias/", include("materias.urls")),
]
