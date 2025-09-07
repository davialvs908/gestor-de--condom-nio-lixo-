#!/usr/bin/env python3
"""
🚀 SmartTrash - Inicialização Completa
Execute este arquivo para inicializar o sistema completo
"""

import os
import sys
import subprocess
import time
import sqlite3
from database_example import SmartTrashDB

def print_banner():
    print("=" * 60)
    print("🗂️  SMARTTRASH - SISTEMA DE GESTÃO INTELIGENTE")
    print("=" * 60)
    print("🚀 Iniciando sistema...")
    print()

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("📦 Verificando dependências...")
    
    try:
        import flask
        import flask_cors
        print("✅ Flask instalado")
    except ImportError:
        print("❌ Flask não encontrado!")
        print("💡 Execute: pip install flask flask-cors")
        return False
    
    return True

def initialize_database():
    """Inicializa o banco de dados"""
    print("🗄️  Inicializando banco de dados...")
    
    # Remover banco existente se houver problemas
    if os.path.exists('smarttrash.db'):
        print("🔄 Removendo banco existente...")
        os.remove('smarttrash.db')
    
    try:
        # Criar novo banco
        db = SmartTrashDB()
        
        # Criar usuários de exemplo
        print("👤 Criando usuários de exemplo...")
        user1 = db.create_user("João Silva", "joao@exemplo.com", "123456", "75999887766", "gestor")
        user2 = db.create_user("Maria Santos", "maria@exemplo.com", "123456", "75988776655", "sindico")
        user3 = db.create_user("Admin SmartTrash", "admin@smarttrash.com.br", "admin123", "75981829675", "gestor")
        
        # Criar usuário demo
        demo_user = db.create_user("Usuário Demo", "demo@smarttrash.com.br", "demo123", "75999999999", "gestor")
        
        if user1:
            # Criar condomínio
            condo1 = db.create_condominium("Residencial Jardins", "Rua das Flores, 123", 50, user1)
            
            if condo1:
                # Adicionar sensores
                sensor1 = db.add_sensor("ST001", condo1, "Bloco A - Térreo")
                sensor2 = db.add_sensor("ST002", condo1, "Bloco B - Térreo") 
                sensor3 = db.add_sensor("ST003", condo1, "Área de Lazer")
                
                # Adicionar algumas leituras
                if sensor1:
                    db.add_sensor_reading(sensor1, 85, 25.5, 60.0)
                if sensor2:
                    db.add_sensor_reading(sensor2, 45, 24.8, 58.0)
                if sensor3:
                    db.add_sensor_reading(sensor3, 25, 26.2, 62.0)
        
        print("✅ Banco de dados inicializado com sucesso!")
        return True
        
    except Exception as e:
        print(f"❌ Erro ao inicializar banco: {e}")
        return False

def start_api_server():
    """Inicia o servidor da API"""
    print("⚡ Iniciando servidor da API...")
    print("🌐 Servidor será executado em: http://localhost:5000")
    print("🔐 Página de login: abra login.html no navegador")
    print()
    print("📋 CREDENCIAIS PARA TESTE:")
    print("   • Demo: demo@smarttrash.com.br / demo123")
    print("   • Gestor: joao@exemplo.com / 123456")
    print("   • Admin: admin@smarttrash.com.br / admin123")
    print()
    print("⚠️  Para parar o servidor: pressione Ctrl+C")
    print("=" * 60)
    
    # Importar e executar a API
    try:
        from api_example import app
        app.run(debug=True, host='0.0.0.0', port=5000)
    except KeyboardInterrupt:
        print("\n🛑 Servidor parado pelo usuário")
    except Exception as e:
        print(f"\n❌ Erro ao iniciar servidor: {e}")

def main():
    """Função principal"""
    print_banner()
    
    # Verificar dependências
    if not check_dependencies():
        sys.exit(1)
    
    # Inicializar banco
    if not initialize_database():
        print("❌ Falha ao inicializar banco de dados")
        sys.exit(1)
    
    print()
    print("🎉 Sistema inicializado com sucesso!")
    print()
    
    # Perguntar se deve iniciar servidor
    resposta = input("🚀 Deseja iniciar o servidor agora? (s/n): ").lower().strip()
    
    if resposta in ['s', 'sim', 'y', 'yes', '']:
        print()
        start_api_server()
    else:
        print()
        print("💡 Para iniciar o servidor manualmente:")
        print("   python api_example.py")
        print()
        print("🌐 Depois acesse: http://localhost:5000")
        print("📱 Ou abra login.html no navegador")

if __name__ == "__main__":
    main()
