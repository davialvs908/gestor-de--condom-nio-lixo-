#!/usr/bin/env python3
"""
SmartTrash Production App
Arquivo principal para deploy em produção
"""

import os
from api_example import app
from database_example import SmartTrashDB

# Configurações para produção
if __name__ == '__main__':
    # Inicializar banco se não existir
    if not os.path.exists('smarttrash.db'):
        print("🔄 Inicializando banco de dados...")
        db = SmartTrashDB()
        db.generate_sample_data()
        print("✅ Banco inicializado!")
    
    # Configurar porta para deploy
    port = int(os.environ.get('PORT', 5000))
    
    # Executar aplicação
    app.run(
        host='0.0.0.0',
        port=port,
        debug=False  # Desabilitar debug em produção
    )
