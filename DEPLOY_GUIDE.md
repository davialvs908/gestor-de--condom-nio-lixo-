# 🚀 Guia Completo de Deploy - SmartTrash

## 📋 Pré-requisitos
- ✅ Conta no GitHub
- ✅ Git instalado no computador
- ✅ Projeto SmartTrash funcionando localmente

## 🔥 OPÇÃO 1: Deploy Completo (Frontend + Backend)

### 🎯 Passo 1: Criar Repositório no GitHub
1. Vá para [GitHub.com](https://github.com)
2. Clique em "New repository"
3. Nome: `smarttrash` (ou outro de sua escolha)
4. Deixe público (para usar GitHub Pages grátis)
5. ✅ Marque "Add a README file"
6. Clique "Create repository"

### 🎯 Passo 2: Subir Código para GitHub
```bash
# No terminal, dentro da pasta do projeto:
git init
git add .
git commit -m "🚀 Initial commit - SmartTrash IoT System"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/smarttrash.git
git push -u origin main
```

### 🎯 Passo 3: Deploy do Frontend (GitHub Pages)
1. No GitHub, vá em **Settings** do repositório
2. Role até **Pages** (menu lateral)
3. Em **Source**: selecione "Deploy from a branch"
4. **Branch**: `main`
5. **Folder**: `/ (root)`
6. Clique **Save**
7. ✅ Em 2-5 minutos: `https://SEU-USUARIO.github.io/smarttrash`

### 🎯 Passo 4: Deploy do Backend (Railway - GRÁTIS)
1. Vá para [Railway.app](https://railway.app)
2. Faça login com GitHub
3. Clique "New Project"
4. Selecione "Deploy from GitHub repo"
5. Escolha seu repositório `smarttrash`
6. ✅ Deploy automático será feito
7. Copie a URL gerada (ex: `https://smarttrash-production.up.railway.app`)

### 🎯 Passo 5: Conectar Frontend ao Backend
Edite os arquivos JS para usar a URL do Railway:

**login.js** (linha ~117):
```javascript
const response = await fetch('https://SEU-APP.up.railway.app/api/register', {
```

**script.js** e outros arquivos JS:
```javascript
// Substitua localhost:5000 pela URL do Railway
const API_URL = 'https://SEU-APP.up.railway.app';
```

## 🔥 OPÇÃO 2: Deploy Apenas Frontend

### Para testar apenas o frontend:
1. Siga passos 1-3 acima
2. O sistema funcionará em modo "demo" sem backend
3. ✅ Acesse: `https://SEU-USUARIO.github.io/smarttrash`

## 🔥 OPÇÃO 3: Deploy Backend Alternativo (Render)

### Se Railway não funcionar:
1. Vá para [Render.com](https://render.com)
2. Conecte com GitHub
3. "New Web Service"
4. Selecione repositório
5. Configurações:
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app`
   - **Python Version**: 3.11.0
6. ✅ Deploy automático

## 📱 URLs Finais

Após deploy completo, você terá:

### 🌐 Frontend (GitHub Pages)
```
https://SEU-USUARIO.github.io/smarttrash
```

### ⚡ Backend API (Railway/Render)
```
https://SEU-APP.up.railway.app
```

### 🔗 Endpoints da API
```
POST https://SEU-APP.up.railway.app/api/login
POST https://SEU-APP.up.railway.app/api/register
GET  https://SEU-APP.up.railway.app/api/dashboard/1
```

## 🔧 Configurações Adicionais

### Domínio Personalizado (Opcional)
1. Compre domínio (ex: smarttrash.com.br)
2. No GitHub Pages: adicione arquivo `CNAME`
3. Configure DNS do domínio

### HTTPS Automático
- ✅ GitHub Pages: HTTPS automático
- ✅ Railway/Render: HTTPS automático

### Variáveis de Ambiente
No Railway/Render, configure:
```
SECRET_KEY=sua-chave-secreta-aqui
FLASK_ENV=production
```

## 🚨 Troubleshooting

### Frontend não carrega?
- ✅ Verifique se `index.html` existe na raiz
- ✅ Aguarde 5-10 minutos após configurar Pages
- ✅ Verifique Settings > Pages no GitHub

### Backend com erro?
- ✅ Verifique logs no Railway/Render
- ✅ Confirme que `requirements.txt` está correto
- ✅ Teste localmente antes do deploy

### API não conecta?
- ✅ Verifique CORS no `api_example.py`
- ✅ Use HTTPS (não HTTP) nas URLs
- ✅ Confirme URL do backend nos arquivos JS

## 🎯 Próximos Passos

1. ✅ **Teste completo** do sistema online
2. 🎨 **Personalize** cores e logos
3. 📊 **Adicione** mais funcionalidades
4. 📱 **Crie** app mobile (React Native)
5. 🤖 **Integre** com sensores IoT reais

## 📞 Suporte

Se precisar de ajuda:
- 📧 **Email**: smarttrashdevs@gmail.com
- 📱 **WhatsApp**: (75) 98182-9675
- 🐙 **GitHub Issues**: No repositório do projeto

---

**🚀 Boa sorte com seu deploy!** 

*Lembre-se: GitHub Pages é gratuito para repositórios públicos, Railway oferece 500 horas grátis/mês.*
