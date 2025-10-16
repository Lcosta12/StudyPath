from django.contrib import admin
from .models import Materia

@admin.register(Materia)
class MateriaAdmin(admin.ModelAdmin):
    list_display = ['id', 'nome', 'status', 'usuario', 'criado_em']
    list_filter = ['status', 'usuario', 'criado_em']
    search_fields = ['nome', 'usuario__username', 'usuario__email']
    list_editable = ['status']
    ordering = ['-criado_em']
    
    # Organiza os campos no formulário de edição
    fieldsets = (
        ('Informações da Matéria', {
            'fields': ('nome', 'status', 'usuario')
        }),
        ('Datas', {
            'fields': ('criado_em', 'atualizado_em'),
            'classes': ('collapse',)
        }),
    )
    
    # Campos somente leitura (auto-gerenciados)
    readonly_fields = ['criado_em', 'atualizado_em']
    
    # Melhora a performance das consultas
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.select_related('usuario')
    
    # Mostra informações do usuário de forma mais clara
    def get_usuario_info(self, obj):
        return f"{obj.usuario.username} ({obj.usuario.email})"
    get_usuario_info.short_description = "Usuário"
    get_usuario_info.admin_order_field = "usuario__username"
