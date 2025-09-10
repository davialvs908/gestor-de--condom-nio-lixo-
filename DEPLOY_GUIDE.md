# 🚀 Guia de Deploy - SmartTrash Backend

## Opções de Hospedagem Recomendadas

### 1. Railway.app (RECOMENDADO) ⭐

**Por que Railway?**
- ✅ Gratuito até 500h/mês
- ✅ Deploy automático via GitHub
- ✅ HTTPS automático
- ✅ Fácil configuração

**Passos:**

1. **Crie conta em:** https://railway.app
2. **Conecte seu GitHub**
3. **Deploy from GitHub repo**
4. **Configure variáveis de ambiente:**
   ```
   SECRET_KEY=seu_secret_key_super_seguro_123
   CORS_ORIGINS=https://seu-frontend.github.io
   ```
5. **Deploy automático!**

### 2. Render.com (ALTERNATIVA)

1. **Crie conta em:** https://render.com
2. **New Web Service**
3. **Connect GitHub repo**
4. **Configurações:**
   - Build Command: `pip install -r requirements.txt`
   - Start Command: `gunicorn api_example:app`
   - Environment: `Python 3`

### 3. Heroku (PAGO - $5/mês)

1. **Instalar Heroku CLI**
2. **Comandos:**
   ```bash
   heroku create smarttrash-api
   git push heroku main
   heroku config:set SECRET_KEY=seu_secret_key
   ```

## Arquivos de Deploy Incluídos

- ✅ `Procfile` - Comando para iniciar app
- ✅ `requirements.txt` - Dependências Python
- ✅ `runtime.txt` - Versão Python
- ✅ `api_example.py` - Configurado para produção

## Configuração do Frontend

Após hospedar a API, atualize o `login.js`:

```javascript
function getApiBaseUrl() {
    if (window.location.hostname === 'localhost') {
        return 'http://localhost:5000';
    }
    
    // Substitua pela URL da sua API hospedada
    return 'https://sua-api.railway.app'; // ou render.com, heroku.com
}
```

## Testando a API

Depois do deploy, teste:
- `GET https://sua-api.railway.app/api/dashboard/1`
- `POST https://sua-api.railway.app/api/login`

## Variáveis de Ambiente Necessárias

```
SECRET_KEY=chave_secreta_super_forte
CORS_ORIGINS=https://seu-frontend.github.io,https://seu-dominio.com
PORT=5000 (automático na maioria dos hosts)
```

## Banco de Dados

O SQLite funciona perfeitamente para demo. Para produção real:
- Railway: PostgreSQL gratuito
- Render: PostgreSQL gratuito  
- Heroku: PostgreSQL $5/mês

## 🎯 Recomendação Final

**Use Railway.app** - é o mais fácil e gratuito!

1. Fork/clone o repo
2. Conecte no Railway
3. Deploy automático
4. Configure CORS_ORIGINS
5. Pronto! 🚀

