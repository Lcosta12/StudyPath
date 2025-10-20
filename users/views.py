from rest_framework import generics
from .models import User
from rest_framework.serializers import ModelSerializer
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
import json

class UserSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "curso"]
        extra_kwargs = {"password": {"write_only": True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            curso=validated_data.get("curso", "")
        )
        return user

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

@csrf_exempt
@require_http_methods(["POST"])
def register_api(request):
    """API endpoint específica para cadastro via n8n"""
    try:
        data = json.loads(request.body)
        
        # Validação básica
        username = data.get('username')
        email = data.get('email')
        password = data.get('password')
        curso = data.get('curso', '')
        
        if not username or not email or not password:
            return JsonResponse({
                'success': False,
                'message': 'Username, email e password são obrigatórios'
            }, status=400)
        
        # Verifica se usuário já existe
        if User.objects.filter(username=username).exists():
            return JsonResponse({
                'success': False,
                'message': 'Username já existe'
            }, status=400)
            
        if User.objects.filter(email=email).exists():
            return JsonResponse({
                'success': False,
                'message': 'Email já existe'
            }, status=400)
        
        # Cria o usuário
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            curso=curso
        )
        
        return JsonResponse({
            'success': True,
            'message': 'Usuário criado com sucesso',
            'data': {
                'user_id': user.id,
                'username': user.username,
                'email': user.email,
                'curso': user.curso
            }
        })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def login_api(request):
    """API endpoint específica para login via n8n"""
    try:
        data = json.loads(request.body)
        
        username = data.get('username')
        password = data.get('password')
        
        if not username or not password:
            return JsonResponse({
                'success': False,
                'message': 'Username e password são obrigatórios'
            }, status=400)
        
        from django.contrib.auth import authenticate
        
        # Tenta autenticar o usuário
        user = authenticate(username=username, password=password)
        
        if user:
            return JsonResponse({
                'success': True,
                'message': 'Login realizado com sucesso',
                'data': {
                    'user_id': user.id,
                    'username': user.username,
                    'email': user.email,
                    'curso': user.curso
                }
            })
        else:
            return JsonResponse({
                'success': False,
                'message': 'Credenciais inválidas'
            }, status=401)
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }, status=500)

@csrf_exempt
@require_http_methods(["POST"])
def forgot_password_api(request):
    """API endpoint para recuperação de senha via n8n"""
    try:
        data = json.loads(request.body)
        
        email = data.get('email')
        
        if not email:
            return JsonResponse({
                'success': False,
                'message': 'Email é obrigatório'
            }, status=400)
        
        # Verifica se o usuário existe
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            # Por segurança, não revelamos se o email existe ou não
            return JsonResponse({
                'success': True,
                'message': 'Se o email existir, você receberá instruções de recuperação'
            })
        
        # TODO: Aqui você integrará com n8n para envio de email
        # Por enquanto, apenas simula o envio
        
        return JsonResponse({
            'success': True,
            'message': 'Instruções de recuperação enviadas para seu email',
            'data': {
                'email': email,
                'user_id': user.id,
                'username': user.username
            }
        })
            
    except json.JSONDecodeError:
        return JsonResponse({
            'success': False,
            'message': 'JSON inválido'
        }, status=400)
    except Exception as e:
        return JsonResponse({
            'success': False,
            'message': f'Erro interno: {str(e)}'
        }, status=500)
