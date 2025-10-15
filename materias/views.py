import pandas as pd
import pdfplumber
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Materia
from .serializers import MateriaSerializer
import os

# Lista todas as matérias do usuário
class MateriaListView(generics.ListAPIView):
    serializer_class = MateriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Materia.objects.filter(usuario=self.request.user)

# Atualiza status de uma matéria
class MateriaUpdateView(generics.UpdateAPIView):
    serializer_class = MateriaSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Materia.objects.filter(usuario=self.request.user)

@csrf_exempt
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def importar_materias(request):
    if request.method == "POST" and request.FILES.get("arquivo"):
        arquivo = request.FILES["arquivo"]
        caminho = default_storage.save(arquivo.name, arquivo)

        materias_criadas = []

        try:
            nomes_materias = []
            
            if arquivo.name.endswith((".xls", ".xlsx")):
                df = pd.read_excel(caminho)
                for idx, row in df.iterrows():
                    nome = row.get("Nome") or row.get("Matéria") or str(row[0])
                    if nome and nome.strip():  # Evita nomes vazios
                        nomes_materias.append(nome.strip())
                    
            elif arquivo.name.endswith(".pdf"):
                with pdfplumber.open(caminho) as pdf:
                    for page in pdf.pages:
                        table = page.extract_table()
                        if table:
                            for row in table[1:]:  # Pula cabeçalho
                                if len(row) > 3 and row[3]:
                                    nomes_materias.append(row[3].strip())
            else:
                return Response({"erro": "Formato não suportado"}, status=status.HTTP_400_BAD_REQUEST)

            # Salva no banco de dados
            for nome in nomes_materias:
                materia, criada = Materia.objects.get_or_create(
                    nome=nome,
                    usuario=request.user,
                    defaults={'status': 'pendente'}
                )
                if criada:
                    materias_criadas.append(materia)

        finally:
            if os.path.exists(caminho):
                os.remove(caminho)

        # Retorna todas as matérias do usuário
        todas_materias = Materia.objects.filter(usuario=request.user)
        serializer = MateriaSerializer(todas_materias, many=True)
        
        return Response({
            'materias': serializer.data,
            'novas_materias': len(materias_criadas),
            'total': todas_materias.count()
        })

    return Response({"erro": "Arquivo não enviado"}, status=status.HTTP_400_BAD_REQUEST)
