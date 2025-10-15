from rest_framework import serializers
from .models import Materia

class MateriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Materia
        fields = ['id', 'nome', 'status', 'criado_em', 'atualizado_em']
        read_only_fields = ['criado_em', 'atualizado_em']