#!/usr/bin/env python3
"""
SmartTrash Database Example
Exemplo de como usar o banco SQLite com Python
"""

import sqlite3
import json
from datetime import datetime, timedelta
import hashlib
import random

class SmartTrashDB:
    def __init__(self, db_path='smarttrash.db'):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Inicializa o banco de dados executando o schema"""
        conn = sqlite3.connect(self.db_path)
        
        # Ler e executar o schema
        try:
            with open('database_schema.sql', 'r', encoding='utf-8') as f:
                schema = f.read()
                conn.executescript(schema)
            print("✅ Banco de dados inicializado com sucesso!")
        except FileNotFoundError:
            print("❌ Arquivo database_schema.sql não encontrado!")
        except Exception as e:
            print(f"❌ Erro ao inicializar banco: {e}")
        finally:
            conn.close()
    
    def get_connection(self):
        """Retorna uma conexão com o banco"""
        conn = sqlite3.connect(self.db_path)
        conn.row_factory = sqlite3.Row  # Para acessar colunas por nome
        return conn
    
    def hash_password(self, password):
        """Gera hash da senha"""
        return hashlib.sha256(password.encode()).hexdigest()
    
    def create_user(self, name, email, password, phone, user_type):
        """Cria um novo usuário"""
        conn = self.get_connection()
        try:
            password_hash = self.hash_password(password)
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO users (name, email, password_hash, phone, user_type, status)
                VALUES (?, ?, ?, ?, ?, 'active')
            """, (name, email, password_hash, phone, user_type))
            
            user_id = cursor.lastrowid
            conn.commit()
            print(f"✅ Usuário {name} criado com ID: {user_id}")
            return user_id
        except sqlite3.IntegrityError:
            print(f"❌ E-mail {email} já existe!")
            return None
        finally:
            conn.close()
    
    def authenticate_user(self, email, password):
        """Autentica um usuário"""
        conn = self.get_connection()
        try:
            password_hash = self.hash_password(password)
            cursor = conn.cursor()
            cursor.execute("""
                SELECT id, name, email, user_type, status
                FROM users 
                WHERE email = ? AND password_hash = ? AND status = 'active'
            """, (email, password_hash))
            
            user = cursor.fetchone()
            if user:
                print(f"✅ Login realizado: {user['name']}")
                return dict(user)
            else:
                print("❌ Credenciais inválidas!")
                return None
        finally:
            conn.close()
    
    def create_condominium(self, name, address, units_count, manager_id):
        """Cria um novo condomínio"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO condominiums (name, address, units_count, manager_id, status)
                VALUES (?, ?, ?, ?, 'trial')
            """, (name, address, units_count, manager_id))
            
            condo_id = cursor.lastrowid
            conn.commit()
            print(f"✅ Condomínio {name} criado com ID: {condo_id}")
            return condo_id
        finally:
            conn.close()
    
    def add_sensor(self, sensor_code, condominium_id, location):
        """Adiciona um sensor IoT"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sensors (sensor_code, condominium_id, location, installation_date)
                VALUES (?, ?, ?, DATE('now'))
            """, (sensor_code, condominium_id, location))
            
            sensor_id = cursor.lastrowid
            conn.commit()
            print(f"✅ Sensor {sensor_code} adicionado com ID: {sensor_id}")
            return sensor_id
        finally:
            conn.close()
    
    def add_sensor_reading(self, sensor_id, fill_level, temperature=None, humidity=None):
        """Adiciona uma leitura do sensor"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO sensor_readings (sensor_id, fill_level, temperature, humidity, battery_voltage, signal_strength)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (sensor_id, fill_level, temperature, humidity, 
                  round(random.uniform(3.0, 4.2), 2),  # Voltagem da bateria
                  random.randint(-80, -30)))  # Força do sinal
            
            conn.commit()
            
            # Verificar se precisa gerar alerta
            self.check_and_create_alert(sensor_id, fill_level)
            
        finally:
            conn.close()
    
    def check_and_create_alert(self, sensor_id, fill_level):
        """Verifica se precisa criar alerta baseado no nível"""
        if fill_level >= 95:
            self.create_alert(sensor_id, 'high_level', 'critical', 
                            f'Contêiner crítico! Nível: {fill_level}%')
        elif fill_level >= 85:
            self.create_alert(sensor_id, 'high_level', 'high', 
                            f'Contêiner precisa de coleta. Nível: {fill_level}%')
    
    def create_alert(self, sensor_id, alert_type, severity, message):
        """Cria um alerta"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO alerts (sensor_id, alert_type, severity, message)
                VALUES (?, ?, ?, ?)
            """, (sensor_id, alert_type, severity, message))
            conn.commit()
            print(f"🚨 Alerta criado: {message}")
        finally:
            conn.close()
    
    def get_dashboard_data(self, condominium_id):
        """Retorna dados para o dashboard"""
        conn = self.get_connection()
        try:
            # Status dos sensores
            cursor = conn.cursor()
            cursor.execute("""
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
            """, (condominium_id,))
            
            sensors = [dict(row) for row in cursor.fetchall()]
            
            # Estatísticas
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_sensors,
                    AVG(sr.fill_level) as avg_fill_level,
                    COUNT(CASE WHEN sr.fill_level >= 85 THEN 1 END) as sensors_need_collection
                FROM sensors s
                LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
                WHERE s.condominium_id = ? AND s.status = 'active'
                AND sr.id = (SELECT MAX(id) FROM sensor_readings WHERE sensor_id = s.id)
            """, (condominium_id,))
            
            stats = dict(cursor.fetchone())
            
            return {
                'sensors': sensors,
                'stats': stats
            }
        finally:
            conn.close()
    
    def save_demo_request(self, form_data):
        """Salva solicitação de demonstração"""
        conn = self.get_connection()
        try:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO demo_requests 
                (name, email, phone, position, condominium_name, units_count, 
                 collections_per_week, main_challenges, request_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'demo')
            """, (
                form_data.get('name'),
                form_data.get('email'),
                form_data.get('phone'),
                form_data.get('position'),
                form_data.get('condominium_name'),
                form_data.get('units_count'),
                form_data.get('collections_per_week'),
                form_data.get('main_challenges')
            ))
            
            request_id = cursor.lastrowid
            conn.commit()
            print(f"✅ Solicitação de demo salva com ID: {request_id}")
            return request_id
        finally:
            conn.close()
    
    def generate_sample_data(self):
        """Gera dados de exemplo para demonstração"""
        print("🔄 Gerando dados de exemplo...")
        
        # Criar usuários de exemplo
        user1 = self.create_user("João Silva", "joao@exemplo.com", "123456", "75999887766", "gestor")
        user2 = self.create_user("Maria Santos", "maria@exemplo.com", "123456", "75988776655", "sindico")
        
        if user1:
            # Criar condomínio
            condo1 = self.create_condominium("Residencial Exemplo", "Rua Exemplo, 123", 50, user1)
            
            if condo1:
                # Adicionar sensores
                sensor1 = self.add_sensor("ST001", condo1, "Bloco A - Térreo")
                sensor2 = self.add_sensor("ST002", condo1, "Bloco B - Térreo")
                sensor3 = self.add_sensor("ST003", condo1, "Área de Lazer")
                
                # Gerar leituras dos últimos 7 dias
                for days_ago in range(7, 0, -1):
                    timestamp = datetime.now() - timedelta(days=days_ago)
                    
                    # Sensor 1 - Nível crescente
                    level1 = min(95, 20 + (7 - days_ago) * 12)
                    self.add_sensor_reading(sensor1, level1, 25.5, 60.0)
                    
                    # Sensor 2 - Nível moderado
                    level2 = random.randint(40, 70)
                    self.add_sensor_reading(sensor2, level2, 24.8, 58.0)
                    
                    # Sensor 3 - Nível baixo
                    level3 = random.randint(10, 40)
                    self.add_sensor_reading(sensor3, level3, 26.2, 62.0)
        
        print("✅ Dados de exemplo gerados!")

def main():
    """Função principal para demonstração"""
    print("🚀 SmartTrash Database Example")
    print("=" * 40)
    
    # Inicializar banco
    db = SmartTrashDB()
    
    # Gerar dados de exemplo
    db.generate_sample_data()
    
    # Testar autenticação
    print("\n🔐 Testando autenticação...")
    user = db.authenticate_user("joao@exemplo.com", "123456")
    
    if user:
        print(f"👤 Usuário logado: {user['name']} ({user['user_type']})")
        
        # Buscar dados do dashboard
        print("\n📊 Dados do Dashboard:")
        dashboard_data = db.get_dashboard_data(1)  # Condomínio ID 1
        
        print(f"📈 Estatísticas:")
        stats = dashboard_data['stats']
        print(f"   • Total de sensores: {stats['total_sensors']}")
        avg_level = stats['avg_fill_level'] if stats['avg_fill_level'] is not None else 0
        print(f"   • Nível médio: {avg_level:.1f}%")
        print(f"   • Precisam coleta: {stats['sensors_need_collection']}")
        
        print(f"\n🔍 Status dos Sensores:")
        for sensor in dashboard_data['sensors']:
            status_emoji = {
                'critical': '🔴',
                'warning': '🟡', 
                'attention': '🟠',
                'normal': '🟢'
            }.get(sensor['status'], '⚪')
            
            print(f"   {status_emoji} {sensor['location']}: {sensor['fill_level']}% "
                  f"(Bateria: {sensor['battery_voltage']}V)")
    
    print("\n✅ Exemplo concluído!")

if __name__ == "__main__":
    main()


