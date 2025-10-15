from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
    
    def validate(self, attrs):
        # Permite login com email ao invés de username
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            # Busca o usuário pelo email
            try:
                user = User.objects.get(email=email)
                username = user.username
            except User.DoesNotExist:
                raise serializers.ValidationError('Email não encontrado')
            
            # Autentica usando o username encontrado
            user = authenticate(username=username, password=password)
            
            if not user:
                raise serializers.ValidationError('Credenciais inválidas')
            
            if not user.is_active:
                raise serializers.ValidationError('Usuário inativo')
                
            # Define os dados para o token
            refresh = self.get_token(user)
            
            return {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            }
        else:
            raise serializers.ValidationError('Email e senha são obrigatórios')