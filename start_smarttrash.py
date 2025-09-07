#!/usr/bin/env python3
"""
SmartTrash - Script de Inicialização Automática
Configura e inicia o sistema completo SmartTrash
"""

import os
import sys
import subprocess
import sqlite3
import time
import webbrowser
from pathlib import Path

def print_banner():
    """Exibe banner do SmartTrash"""
    banner = """
    ╔═══════════════════════════════════════════════════════════╗
    ║                    🗑️  SMARTTRASH  🗑️                     ║
    ║              Gestão Inteligente de Resíduos               ║
    ║                                                           ║
    ║  🚀 Inicializador Automático                              ║
    ║  📊 SQLite + Flask + Frontend Integrado                   ║
    ╚═══════════════════════════════════════════════════════════╝
    """
    print(banner)

def check_requirements():
    """Verifica se os arquivos necessários existem"""
    print("🔍 Verificando arquivos necessários...")
    
    required_files = [
        'database_schema.sql',
        'api_example.py',
        'requirements.txt',
        'index.html',
        'login.html',
        'dashboard.html'
    ]
    
    missing_files = []
    for file in required_files:
        if not Path(file).exists():
            missing_files.append(file)
    
    if missing_files:
        print(f"❌ Arquivos não encontrados: {', '.join(missing_files)}")
        return False
    
    print("✅ Todos os arquivos necessários encontrados!")
    return True

def install_dependencies():
    """Instala dependências Python"""
    print("📦 Instalando dependências...")
    
    try:
        # Verificar se pip está disponível
        subprocess.run([sys.executable, '-m', 'pip', '--version'], 
                      check=True, capture_output=True)
        
        # Instalar dependências
        subprocess.run([sys.executable, '-m', 'pip', 'install', '-r', 'requirements.txt'], 
                      check=True)
        print("✅ Dependências instaladas com sucesso!")
        return True
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False
    except FileNotFoundError:
        print("❌ pip não encontrado. Instale Python com pip primeiro.")
        return False

def setup_database():
    """Configura o banco de dados SQLite"""
    print("🗄️ Configurando banco de dados...")
    
    try:
        # Verificar se banco já existe
        if Path('smarttrash.db').exists():
            print("📊 Banco de dados já existe. Verificando estrutura...")
            
            conn = sqlite3.connect('smarttrash.db')
            cursor = conn.cursor()
            
            # Verificar se tabelas existem
            cursor.execute("""
                SELECT name FROM sqlite_master 
                WHERE type='table' AND name='users'
            """)
            
            if cursor.fetchone():
                print("✅ Banco de dados configurado corretamente!")
                conn.close()
                return True
            
            conn.close()
        
        # Criar banco de dados
        print("🔨 Criando banco de dados...")
        
        conn = sqlite3.connect('smarttrash.db')
        
        # Executar schema
        with open('database_schema.sql', 'r', encoding='utf-8') as f:
            schema = f.read()
            conn.executescript(schema)
        
        conn.close()
        print("✅ Banco de dados criado com sucesso!")
        
        # Gerar dados de exemplo
        print("📝 Gerando dados de exemplo...")
        subprocess.run([sys.executable, 'database_example.py'], check=True)
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao configurar banco: {e}")
        return False

def start_api_server():
    """Inicia o servidor Flask em background"""
    print("🚀 Iniciando servidor API...")
    
    try:
        # Verificar se porta 5000 está livre
        import socket
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        result = sock.connect_ex(('localhost', 5000))
        sock.close()
        
        if result == 0:
            print("⚠️ Porta 5000 já está em uso. Servidor pode já estar rodando.")
            return True
        
        # Iniciar servidor em background
        process = subprocess.Popen(
            [sys.executable, 'api_example.py'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        
        # Aguardar alguns segundos para o servidor iniciar
        time.sleep(3)
        
        # Verificar se processo ainda está rodando
        if process.poll() is None:
            print("✅ Servidor API iniciado com sucesso!")
            print("🌐 API disponível em: http://localhost:5000")
            return True
        else:
            stdout, stderr = process.communicate()
            print(f"❌ Erro ao iniciar servidor: {stderr.decode()}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao iniciar servidor: {e}")
        return False

def open_browser():
    """Abre o navegador com o site"""
    print("🌐 Abrindo navegador...")
    
    try:
        # Verificar se index.html existe
        if not Path('index.html').exists():
            print("❌ index.html não encontrado!")
            return False
        
        # Abrir arquivo local no navegador
        file_path = Path('index.html').absolute()
        webbrowser.open(f'file://{file_path}')
        
        print("✅ Navegador aberto com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao abrir navegador: {e}")
        return False

def show_credentials():
    """Exibe credenciais de acesso"""
    print("\n" + "="*60)
    print("🔐 CREDENCIAIS DE ACESSO")
    print("="*60)
    print()
    print("📧 USUÁRIOS DE TESTE (SQLite):")
    print("   • E-mail: joao@exemplo.com")
    print("   • Senha: 123456")
    print("   • Tipo: Gestor")
    print()
    print("   • E-mail: maria@exemplo.com") 
    print("   • Senha: 123456")
    print("   • Tipo: Síndico")
    print()
    print("🎭 MODO DEMO (Fallback):")
    print("   • E-mail: demo@smarttrash.com.br")
    print("   • Senha: demo123")
    print()
    print("🌐 URLS IMPORTANTES:")
    print("   • Site: file://index.html")
    print("   • Login: file://login.html") 
    print("   • API: http://localhost:5000")
    print("   • Dashboard API: http://localhost:5000/api/dashboard/1")
    print()
    print("="*60)

def main():
    """Função principal"""
    print_banner()
    
    # Verificar arquivos
    if not check_requirements():
        print("\n❌ Verifique se todos os arquivos estão presentes e tente novamente.")
        return False
    
    # Instalar dependências
    if not install_dependencies():
        print("\n❌ Falha na instalação de dependências.")
        return False
    
    # Configurar banco
    if not setup_database():
        print("\n❌ Falha na configuração do banco de dados.")
        return False
    
    # Iniciar servidor
    if not start_api_server():
        print("\n❌ Falha ao iniciar servidor API.")
        return False
    
    # Abrir navegador
    if not open_browser():
        print("\n⚠️ Falha ao abrir navegador automaticamente.")
        print("   Abra manualmente: file://index.html")
    
    # Mostrar credenciais
    show_credentials()
    
    print("\n🎉 SmartTrash iniciado com sucesso!")
    print("\n💡 DICAS:")
    print("   • Use Ctrl+C para parar o servidor")
    print("   • Acesse http://localhost:5000 para testar a API")
    print("   • Dados são salvos em smarttrash.db")
    print("   • Logs da API aparecerão no terminal")
    
    print("\n⏳ Servidor rodando... (Pressione Ctrl+C para parar)")
    
    try:
        # Manter script rodando
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n🛑 Parando SmartTrash...")
        print("✅ Sistema finalizado com sucesso!")
        return True

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)


