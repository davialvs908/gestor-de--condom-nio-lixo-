#!/usr/bin/env python3
"""
SmartTrash API Example
API Flask simples para conectar o site ao banco SQLite
"""

from flask import Flask, request, jsonify, session
from flask_cors import CORS
import sqlite3
import hashlib
import os
from datetime import datetime
import json

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'smarttrash_secret_key_change_in_production')

# Configurar CORS para produção e desenvolvimento
cors_origins = os.environ.get('CORS_ORIGINS', '*').split(',')
CORS(app, 
     origins=cors_origins,  # Configurável via variável de ambiente
     methods=['GET', 'POST', 'OPTIONS'],
     allow_headers=['Content-Type', 'Authorization'],
     supports_credentials=True)

DATABASE = 'smarttrash.db'

def get_db_connection():
    """Conecta ao banco SQLite"""
    conn = sqlite3.connect(DATABASE)
    conn.row_factory = sqlite3.Row
    return conn

def hash_password(password):
    """Gera hash da senha"""
    return hashlib.sha256(password.encode()).hexdigest()

@app.route('/api/login', methods=['POST'])
def login():
    """Endpoint de login"""
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        if not email or not password:
            return jsonify({'error': 'E-mail e senha são obrigatórios'}), 400
        
        conn = get_db_connection()
        password_hash = hash_password(password)
        
        user = conn.execute("""
            SELECT id, name, email, user_type, status
            FROM users 
            WHERE email = ? AND password_hash = ? AND status = 'active'
        """, (email, password_hash)).fetchone()
        
        conn.close()
        
        if user:
            session['user_id'] = user['id']
            session['user_name'] = user['name']
            session['user_type'] = user['user_type']
            
            return jsonify({
                'success': True,
                'user': {
                    'id': user['id'],
                    'name': user['name'],
                    'email': user['email'],
                    'user_type': user['user_type']
                }
            })
        else:
            return jsonify({'error': 'Credenciais inválidas'}), 401
            
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/register', methods=['POST'])
def register():
    """Endpoint de cadastro de usuário"""
    try:
        data = request.get_json()
        
        # Validar campos obrigatórios
        required_fields = ['name', 'email', 'password', 'phone', 'user_type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        # Validar formato do email
        import re
        email_pattern = r'^[^\s@]+@[^\s@]+\.[^\s@]+$'
        if not re.match(email_pattern, data.get('email')):
            return jsonify({'error': 'E-mail inválido'}), 400
        
        # Validar senha (mínimo 6 caracteres)
        if len(data.get('password', '')) < 6:
            return jsonify({'error': 'A senha deve ter pelo menos 6 caracteres'}), 400
        
        # Validar tipo de usuário
        valid_user_types = ['gestor', 'sindico', 'administradora', 'empresa_coleta']
        if data.get('user_type') not in valid_user_types:
            return jsonify({'error': 'Tipo de usuário inválido'}), 400
        
        conn = get_db_connection()
        
        # Verificar se email já existe
        existing_user = conn.execute("""
            SELECT id FROM users WHERE email = ?
        """, (data.get('email'),)).fetchone()
        
        if existing_user:
            conn.close()
            return jsonify({'error': 'E-mail já cadastrado'}), 400
        
        # Criar hash da senha
        password_hash = hash_password(data.get('password'))
        
        # Inserir novo usuário (ativo por padrão para facilitar testes)
        cursor = conn.cursor()
        cursor.execute("""
            INSERT INTO users (name, email, password_hash, phone, user_type, status)
            VALUES (?, ?, ?, ?, ?, 'active')
        """, (
            data.get('name'),
            data.get('email'),
            password_hash,
            data.get('phone'),
            data.get('user_type')
        ))
        
        user_id = cursor.lastrowid
        
        # Se fornecido dados do condomínio, criar também
        if data.get('condominium_name') and data.get('units_count'):
            cursor.execute("""
                INSERT INTO condominiums (name, address, units_count, manager_id, status)
                VALUES (?, ?, ?, ?, 'trial')
            """, (
                data.get('condominium_name'),
                data.get('address', ''),
                data.get('units_count'),
                user_id
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Cadastro realizado com sucesso! Você já pode fazer login.',
            'user_id': user_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/logout', methods=['POST'])
def logout():
    """Endpoint de logout"""
    session.clear()
    return jsonify({'success': True})

@app.route('/api/dashboard/<int:condominium_id>')
def get_dashboard_data(condominium_id):
    """Retorna dados do dashboard"""
    try:
        # Por enquanto, permitir acesso sem autenticação para testes
        # TODO: Implementar autenticação baseada em token JWT
        # if 'user_id' not in session:
        #     return jsonify({'error': 'Não autenticado'}), 401
        
        conn = get_db_connection()
        
        # Dados dos sensores
        sensors = conn.execute("""
            SELECT 
                s.id,
                s.sensor_code,
                s.location,
                sr.fill_level,
                sr.battery_voltage,
                sr.reading_timestamp,
                CASE 
                    WHEN sr.fill_level >= 95 THEN 'critical'
                    WHEN sr.fill_level >= 85 THEN 'warning'
                    WHEN sr.fill_level >= 70 THEN 'attention'
                    ELSE 'normal'
                END as status
            FROM sensors s
            LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
            WHERE s.condominium_id = ? AND s.status = 'active'
            AND sr.id = (SELECT MAX(id) FROM sensor_readings WHERE sensor_id = s.id)
            ORDER BY sr.fill_level DESC
        """, (condominium_id,)).fetchall()
        
        # Estatísticas
        stats = conn.execute("""
            SELECT 
                COUNT(*) as total_sensors,
                ROUND(AVG(sr.fill_level), 1) as avg_fill_level,
                COUNT(CASE WHEN sr.fill_level >= 85 THEN 1 END) as sensors_need_collection,
                COUNT(CASE WHEN sr.fill_level >= 95 THEN 1 END) as critical_sensors
            FROM sensors s
            LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
            WHERE s.condominium_id = ? AND s.status = 'active'
            AND sr.id = (SELECT MAX(id) FROM sensor_readings WHERE sensor_id = s.id)
        """, (condominium_id,)).fetchone()
        
        # Coletas do mês
        collections_count = conn.execute("""
            SELECT COUNT(*) as collections_this_month
            FROM collections col
            JOIN sensors s ON col.sensor_id = s.id
            WHERE s.condominium_id = ? 
            AND strftime('%Y-%m', col.collection_date) = strftime('%Y-%m', 'now')
            AND col.status = 'completed'
        """, (condominium_id,)).fetchone()
        
        # Alertas ativos
        alerts = conn.execute("""
            SELECT 
                a.id,
                a.alert_type,
                a.severity,
                a.message,
                a.created_at,
                s.location
            FROM alerts a
            JOIN sensors s ON a.sensor_id = s.id
            WHERE s.condominium_id = ? AND a.is_resolved = FALSE
            ORDER BY a.created_at DESC
            LIMIT 10
        """, (condominium_id,)).fetchall()
        
        conn.close()
        
        # Adicionar coletas às estatísticas
        stats_dict = dict(stats)
        if collections_count:
            stats_dict['collections_this_month'] = collections_count['collections_this_month']
        
        return jsonify({
            'sensors': [dict(row) for row in sensors],
            'stats': stats_dict,
            'alerts': [dict(row) for row in alerts]
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/containers', methods=['GET'])
def get_containers():
    """Lista todos os contêineres"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
            
        conn = get_db_connection()
        containers = conn.execute("""
            SELECT 
                s.id,
                s.sensor_code,
                s.location,
                s.waste_type,
                s.installation_date,
                s.status,
                sr.fill_level,
                sr.battery_voltage,
                sr.reading_timestamp
            FROM sensors s
            LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
            WHERE sr.id = (SELECT MAX(id) FROM sensor_readings WHERE sensor_id = s.id)
            ORDER BY s.location
        """).fetchall()
        
        conn.close()
        
        return jsonify([dict(row) for row in containers])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/containers', methods=['POST'])
def add_container():
    """Adiciona novo contêiner"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
            
        data = request.get_json()
        
        required_fields = ['sensor_code', 'location', 'condominium_id']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO sensors (sensor_code, condominium_id, location, waste_type, installation_date)
            VALUES (?, ?, ?, ?, DATE('now'))
        """, (
            data.get('sensor_code'),
            data.get('condominium_id'),
            data.get('location'),
            data.get('waste_type', 'general')
        ))
        
        container_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Contêiner adicionado com sucesso!',
            'container_id': container_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/alerts/<int:alert_id>/resolve', methods=['POST'])
def resolve_alert(alert_id):
    """Resolve um alerta"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
            
        conn = get_db_connection()
        
        conn.execute("""
            UPDATE alerts 
            SET is_resolved = TRUE, resolved_at = datetime('now')
            WHERE id = ?
        """, (alert_id,))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Alerta resolvido com sucesso!'
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/sensor-readings/<int:sensor_id>')
def get_sensor_readings(sensor_id):
    """Retorna histórico de leituras de um sensor"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        days = request.args.get('days', 7, type=int)
        
        conn = get_db_connection()
        readings = conn.execute("""
            SELECT 
                fill_level,
                temperature,
                humidity,
                battery_voltage,
                reading_timestamp
            FROM sensor_readings
            WHERE sensor_id = ? 
            AND reading_timestamp >= datetime('now', '-{} days')
            ORDER BY reading_timestamp ASC
        """.format(days), (sensor_id,)).fetchall()
        
        conn.close()
        
        return jsonify([dict(row) for row in readings])
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/demo-request', methods=['POST'])
def save_demo_request():
    """Salva solicitação de demonstração"""
    try:
        data = request.get_json()
        
        required_fields = ['name', 'email', 'phone']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'Campo {field} é obrigatório'}), 400
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO demo_requests 
            (name, email, phone, position, condominium_name, units_count, 
             collections_per_week, main_challenges, request_type)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'demo')
        """, (
            data.get('name'),
            data.get('email'),
            data.get('phone'),
            data.get('position'),
            data.get('condominium_name'),
            data.get('units_count'),
            data.get('collections_per_week'),
            data.get('main_challenges')
        ))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Solicitação enviada com sucesso!',
            'request_id': request_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/partnership-request', methods=['POST'])
def save_partnership_request():
    """Salva solicitação de parceria"""
    try:
        data = request.get_json()
        
        conn = get_db_connection()
        cursor = conn.cursor()
        
        cursor.execute("""
            INSERT INTO demo_requests 
            (name, email, phone, position, condominium_name, 
             main_challenges, request_type)
            VALUES (?, ?, ?, ?, ?, ?, 'partnership')
        """, (
            data.get('nomeContato'),
            data.get('emailEmpresa'),
            data.get('telefoneEmpresa'),
            data.get('cargoContato'),
            data.get('nomeEmpresa'),
            data.get('observacoes')
        ))
        
        request_id = cursor.lastrowid
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Proposta de parceria enviada!',
            'request_id': request_id
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/simulate-sensor-data', methods=['POST'])
def simulate_sensor_data():
    """Simula dados de sensores (para demonstração)"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        import random
        
        conn = get_db_connection()
        
        # Buscar todos os sensores ativos
        sensors = conn.execute("""
            SELECT id FROM sensors WHERE status = 'active'
        """).fetchall()
        
        # Gerar leituras aleatórias
        for sensor in sensors:
            # Simular variação realista
            last_reading = conn.execute("""
                SELECT fill_level FROM sensor_readings 
                WHERE sensor_id = ? 
                ORDER BY reading_timestamp DESC 
                LIMIT 1
            """, (sensor['id'],)).fetchone()
            
            if last_reading:
                # Variação de -5% a +10% do último valor
                base_level = last_reading['fill_level']
                variation = random.uniform(-5, 10)
                new_level = max(0, min(100, base_level + variation))
            else:
                new_level = random.randint(20, 80)
            
            # Inserir nova leitura
            conn.execute("""
                INSERT INTO sensor_readings 
                (sensor_id, fill_level, temperature, humidity, battery_voltage, signal_strength)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (
                sensor['id'],
                round(new_level),
                round(random.uniform(20, 30), 1),
                round(random.uniform(50, 70), 1),
                round(random.uniform(3.0, 4.2), 2),
                random.randint(-80, -30)
            ))
        
        conn.commit()
        conn.close()
        
        return jsonify({'success': True, 'message': 'Dados simulados gerados!'})
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/reports/monthly/<int:condominium_id>')
def get_monthly_report(condominium_id):
    """Gera relatório mensal"""
    try:
        if 'user_id' not in session:
            return jsonify({'error': 'Não autenticado'}), 401
        
        conn = get_db_connection()
        
        # Coletas do mês
        collections = conn.execute("""
            SELECT 
                COUNT(*) as total_collections,
                AVG(fill_level_before) as avg_fill_level,
                SUM(cost) as total_cost
            FROM collections col
            JOIN sensors s ON col.sensor_id = s.id
            WHERE s.condominium_id = ? 
            AND strftime('%Y-%m', col.collection_date) = strftime('%Y-%m', 'now')
            AND col.status = 'completed'
        """, (condominium_id,)).fetchone()
        
        # Economia estimada
        traditional_cost = 800  # Custo estimado método tradicional
        smarttrash_cost = 200   # Custo SmartTrash
        savings = traditional_cost - smarttrash_cost
        
        conn.close()
        
        return jsonify({
            'collections': dict(collections) if collections else {},
            'costs': {
                'traditional': traditional_cost,
                'smarttrash': smarttrash_cost,
                'savings': savings,
                'savings_percentage': round((savings / traditional_cost) * 100, 1)
            }
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(">> SmartTrash API iniciando...")
    print(">> Dashboard: http://localhost:5000/api/dashboard/1")
    print(">> Login: POST /api/login")
    print(">> Cadastro: POST /api/register")
    print("=" * 60)
    print(">> CREDENCIAIS PARA TESTE:")
    print("   E-mail: demo@smarttrash.com.br / Senha: 123456")
    print("   E-mail: davialves.20@gmail.com / Senha: 123456")
    print("=" * 60)
    print(">> ACESSE: Abra login.html no navegador")
    print(">> PARAR: Ctrl+C")
    print()
    
    # Configurar porta para deploy
    port = int(os.environ.get('PORT', 5000))
    host = os.environ.get('HOST', '0.0.0.0')
    
    app.run(debug=False, host=host, port=port, threaded=True)
