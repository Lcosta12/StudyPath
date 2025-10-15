from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Materia(models.Model):
    STATUS_CHOICES = [
        ('pendente', 'Pendente'),
        ('concluida', 'Concluída'),
    ]
    
    nome = models.CharField(max_length=200)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pendente')
    usuario = models.ForeignKey(User, on_delete=models.CASCADE, related_name='materias')
    criado_em = models.DateTimeField(auto_now_add=True)
    atualizado_em = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['nome', 'usuario']  # Evita duplicatas por usuário
    
    def __str__(self):
        return f"{self.nome} - {self.get_status_display()}"
