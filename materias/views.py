import pandas as pd
import pdfplumber
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import default_storage
import os

@csrf_exempt
def importar_materias(request):
    if request.method == "POST" and request.FILES.get("arquivo"):
        arquivo = request.FILES["arquivo"]
        caminho = default_storage.save(arquivo.name, arquivo)

        materias = []

        try:
            if arquivo.name.endswith((".xls", ".xlsx")):
                df = pd.read_excel(caminho)
                for idx, row in df.iterrows():
                    materias.append({
                        "id": idx + 1,
                        "nome": row.get("Nome") or row.get("Matéria") or str(row[0]),
                        "status": "pendente"
                    })
                    
            elif arquivo.name.endswith(".pdf"):
                with pdfplumber.open(caminho) as pdf:
                    for page in pdf.pages:
                        table = page.extract_table()
                        if table:
                            for idx, row in enumerate(table[1:]):
                                materias.append({
                                    "id": idx + 1,
                                    "nome": row[3],
                                    "status": "pendente"
                                })

            else:
                return JsonResponse({"erro": "Formato não suportado"}, status=400)

        finally:
            if os.path.exists(caminho):
                os.remove(caminho)

        return JsonResponse(materias, safe=False)

    return JsonResponse({"erro": "Arquivo não enviado"}, status=400)
