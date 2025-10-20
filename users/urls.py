from django.urls import path
from . import views

urlpatterns = [
    # APIs para n8n (simples)
    path('api/register/', views.register_api, name='register_api'),
    path('api/login/', views.login_api, name='login_api'),
    path('api/forgot-password/', views.forgot_password_api, name='forgot_password_api'),
    
    # APIs DRF para frontend
    path('api/register-drf/', views.RegisterView.as_view(), name='register-drf'),
    path('api/token/', views.CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
]