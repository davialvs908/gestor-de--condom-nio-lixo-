# 🗂️ SmartTrash - Sistema de Gestão Inteligente de Resíduos

![SmartTrash](https://img.shields.io/badge/SmartTrash-IoT%20Solution-green)
![Python](https://img.shields.io/badge/Python-3.11-blue)
![Flask](https://img.shields.io/badge/Flask-2.3.3-red)
![SQLite](https://img.shields.io/badge/SQLite-Database-orange)

## 📋 Sobre o Projeto

O **SmartTrash** é uma solução completa de IoT para gestão inteligente de resíduos em condomínios e empresas. O sistema monitora contêineres em tempo real, otimiza rotas de coleta e reduz custos operacionais.

### 🎯 Funcionalidades Principais

- **🔐 Sistema de Login/Cadastro** - Autenticação completa com SQLite
- **📊 Dashboard em Tempo Real** - Monitoramento de sensores IoT
- **🚨 Alertas Inteligentes** - Notificações automáticas de coleta
- **📱 Interface Responsiva** - Compatível com mobile e desktop
- **🏢 Gestão Multi-Empresa** - Suporte para diferentes tipos de usuário
- **📈 Relatórios Detalhados** - Análises de desempenho e custos

## 🚀 Tecnologias Utilizadas

### Frontend
- **HTML5/CSS3** - Interface moderna e responsiva
- **JavaScript ES6+** - Interatividade e validações
- **Font Awesome** - Ícones profissionais
- **Google Fonts** - Tipografia elegante

### Backend
- **Python 3.11** - Linguagem principal
- **Flask** - Framework web minimalista
- **SQLite** - Banco de dados embarcado
- **Flask-CORS** - Suporte a requisições cross-origin

## 📦 Estrutura do Projeto

```
smarttrash/
├── 📄 index.html              # Página inicial
├── 🔐 login.html              # Sistema de login/cadastro
├── 🏢 empresas.html           # Página para empresas
├── 👥 gestores.html           # Página para gestores
├── 🏘️ gestao-condominial.html # Gestão condominial
├── 📊 dashboard.html          # Dashboard principal
├── 🎨 styles.css              # Estilos principais
├── ⚡ script.js               # JavaScript principal
├── 🔐 login.js                # Lógica de autenticação
├── 📊 dashboard.js            # Lógica do dashboard
├── 🐍 api_example.py          # API Flask
├── 🗄️ database_example.py     # Gerenciamento do banco
├── 📋 database_schema.sql     # Schema do banco
├── 🚀 start_smarttrash.py     # Inicialização completa
├── 📦 requirements.txt        # Dependências Python
├── 🌐 Procfile               # Configuração de deploy
└── 📖 README.md              # Este arquivo
```

## 🔧 Instalação e Configuração

### 1. Clonar o Repositório
```bash
git clone https://github.com/seu-usuario/smarttrash.git
cd smarttrash
```

### 2. Instalar Dependências
```bash
pip install -r requirements.txt
```

### 3. Inicializar Banco de Dados
```bash
python database_example.py
```

### 4. Iniciar o Servidor
```bash
python api_example.py
```

### 5. Acessar o Sistema
- **Frontend**: Abra `login.html` no navegador
- **API**: http://localhost:5000
- **Dashboard**: http://localhost:5000/api/dashboard/1

## 🌐 Deploy e Hospedagem

### GitHub Pages (Frontend)
1. Faça push do código para GitHub
2. Vá em Settings > Pages
3. Selecione branch `main`
4. Acesse: `https://seu-usuario.github.io/smarttrash`

### Railway (Backend - GRATUITO)
1. Conecte seu repositório GitHub
2. O Railway detectará automaticamente o `Procfile`
3. Deploy automático será feito

### Render (Alternativa)
1. Conecte repositório GitHub
2. Configure como Web Service
3. Comando de build: `pip install -r requirements.txt`
4. Comando de start: `gunicorn api_example:app`

## 👤 Usuários de Teste

### Credenciais Demo
- **Email**: `demo@smarttrash.com.br`
- **Senha**: `demo123`

### Outros Usuários
- **Gestor**: `joao.silva@email.com` / `senha123`
- **Admin**: `admin@smarttrash.com.br` / `admin123`

## 🎯 Endpoints da API

### Autenticação
- `POST /api/login` - Login de usuário
- `POST /api/register` - Cadastro de usuário
- `POST /api/logout` - Logout

### Dashboard
- `GET /api/dashboard/<condominium_id>` - Dados do dashboard
- `GET /api/containers` - Lista de contêineres
- `POST /api/containers` - Adicionar contêiner

### Relatórios
- `GET /api/reports/monthly/<condominium_id>` - Relatório mensal
- `POST /api/simulate-sensor-data` - Simular dados IoT

## 🔒 Segurança

- ✅ Senhas hasheadas com SHA-256
- ✅ Validação de entrada em todos os formulários
- ✅ Sanitização de dados SQL
- ✅ Sessões seguras com Flask
- ✅ CORS configurado adequadamente

## 📱 Responsividade

O sistema é totalmente responsivo e funciona em:
- 💻 **Desktop** - Experiência completa
- 📱 **Mobile** - Interface otimizada
- 📟 **Tablet** - Layout adaptativo

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 📞 Contato

- **Email**: smarttrashdevs@gmail.com
- **Telefone**: (75) 98182-9675
- **Website**: [SmartTrash](https://seu-usuario.github.io/smarttrash)

## 🏆 Funcionalidades Avançadas

### IoT Integration
- 📡 Sensores de nível ultrassônicos
- 🔋 Monitoramento de bateria
- 📶 Conectividade LoRaWAN/WiFi
- 🌡️ Sensores de temperatura

### Business Intelligence
- 📊 Dashboards executivos
- 📈 Análise preditiva
- 💰 ROI detalhado
- 🎯 KPIs personalizados

### Integrações
- 📱 WhatsApp Business API
- 📧 E-mail notifications
- 🗺️ Google Maps integration
- 📋 ERP/CRM integration

---

**Desenvolvido com ❤️ para um futuro mais sustentável** 🌱
