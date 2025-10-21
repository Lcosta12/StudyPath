# 📋 Configurações de Desenvolvimento - StudyPath

## 🔑 Credenciais de Teste
```
Username: Lcosta
Email: dev@mail.com  
Password: 123456
```

## 📧 Email Zoho
```
Account: studypathacademic@zohomail.com
Password: Loc120903@
```

## 🌐 URLs de Desenvolvimento
- **Frontend:** http://localhost:3000/
- **Backend:** http://127.0.0.1:8000/
- **n8n Dashboard:** http://localhost:5678/

## ⚡ Comandos Rápidos
```bash
# Ativar ambiente virtual
venv\Scripts\activate

# Rodar backend Django
python manage.py runserver

# Rodar frontend React
npm run dev

# Rodar n8n
n8n start
```

## 📧 Webhooks do n8n Configurados

### 1. Email de Boas-vindas
- **URL:** `http://localhost:5678/webhook-test/boas-vindas`
- **Gatilho:** Quando um novo usuário se cadastra
- **Dados enviados:**
```json
{
    "username": "usuario",
    "email": "email@exemplo.com",
    "curso": "Ciência da Computação",
    "user_id": 1,
    "message_type": "welcome"
}
```

### 2. Email de Recuperação de Senha
- **URL:** `http://localhost:5678/webhook-test/forgot-password`
- **Gatilho:** Quando usuário solicita recuperação de senha
- **Dados enviados:**
```json
{
    "username": "usuario",
    "email": "email@exemplo.com",
    "user_id": 1,
    "reset_token": "abc123-def456-ghi789",
    "reset_url": "http://localhost:3000/reset-password?token=abc123",
    "message_type": "forgot_password"
}
```

## 📝 APIs Disponíveis

### Backend APIs (Django)
- `POST /users/api/register/` - Cadastro (dispara email de boas-vindas)
- `POST /users/api/login/` - Login
- `POST /users/api/forgot-password/` - Recuperação de senha (dispara email)
- `POST /api/register-drf/` - Cadastro via DRF (para frontend)
- `POST /api/token/` - JWT Token

### Frontend Routes
- `/login` - Tela de login
- `/register` - Tela de cadastro
- `/forgot-password` - Esqueceu a senha
- `/home` - Dashboard principal

## 🔧 Variáveis de Ambiente (.env)

### Frontend
```bash
VITE_API_URL=http://127.0.0.1:8000/api/
```

### Backend (criar arquivo .env na raiz do projeto Django)
```bash
SECRET_KEY=sua_secret_key_aqui
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3

# N8N Webhooks
N8N_WELCOME_WEBHOOK=http://localhost:5678/webhook-test/boas-vindas
N8N_FORGOT_PASSWORD_WEBHOOK=http://localhost:5678/webhook-test/forgot-password

# Email Zoho
EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_HOST_USER=studypathacademic@zohomail.com
EMAIL_HOST_PASSWORD=Loc120903@
```

## 🧪 Como Testar a Integração

### 1. Iniciar todos os serviços:
```bash
# Terminal 1: n8n
n8n start

# Terminal 2: Backend Django
venv\Scripts\activate
python manage.py runserver

# Terminal 3: Frontend React
npm run dev
```

### 2. Testar cadastro com email:
- Acesse: `http://localhost:3000/register`
- Cadastre um novo usuário
- Verifique se o webhook foi enviado no console do Django
- Verifique se o email foi enviado no dashboard do n8n

### 3. Testar recuperação de senha:
- Acesse: `http://localhost:3000/forgot-password`
- Digite um email cadastrado
- Verifique o webhook no n8n

## 🎯 Templates de Email no n8n

### Email de Boas-vindas:
```
Assunto: Bem-vindo ao StudyPath!

Olá {{ $json.body.username }},

Seu cadastro foi realizado com sucesso!

Agora você tem acesso completo à nossa plataforma.
{{#if $json.body.curso}}Curso: {{ $json.body.curso }}{{/if}}

Acesse: http://localhost:3000/login

Atenciosamente,
Equipe StudyPath
```

### Email de Recuperação:
```
Assunto: Recuperação de Senha - StudyPath

Olá {{ $json.body.username }},

Você solicitou a recuperação de sua senha.

Clique no link abaixo para redefinir:
{{ $json.body.reset_url }}

Este link expira em 24 horas.

Se você não solicitou, ignore este email.

Atenciosamente,
Equipe StudyPath
```

## 🚀 Próximos Passos

1. ✅ Configurar emails no n8n com Zoho
2. ✅ Criar workflows de boas-vindas e recuperação
3. ✅ Integrar webhooks com Django
4. 🔄 Criar página de reset de senha no frontend
5. 🔄 Implementar sistema de tokens de recuperação no backend
6. 🔄 Adicionar validação de tokens expirados

## 🔍 Troubleshooting

### Webhook não funciona:
1. Verificar se n8n está rodando
2. Verificar URL do webhook
3. Verificar logs do Django
4. Testar webhook manualmente no n8n

### Email não chega:
1. Verificar configurações do Zoho
2. Verificar spam/lixo eletrônico
3. Testar envio manual no n8n
4. Verificar logs do n8n