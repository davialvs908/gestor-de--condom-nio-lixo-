-- SmartTrash Database Schema
-- SQLite Database Structure for IoT Waste Management System

-- Tabela de Usuários (Gestores, Síndicos, Empresas)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    user_type VARCHAR(20) CHECK(user_type IN ('gestor', 'sindico', 'administradora', 'empresa_coleta')) NOT NULL,
    status VARCHAR(10) CHECK(status IN ('active', 'inactive', 'pending')) DEFAULT 'pending',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Condomínios
CREATE TABLE condominiums (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(150) NOT NULL,
    address TEXT NOT NULL,
    city VARCHAR(100) DEFAULT 'Feira de Santana',
    state VARCHAR(2) DEFAULT 'BA',
    zip_code VARCHAR(10),
    units_count INTEGER NOT NULL,
    manager_id INTEGER,
    plan_type VARCHAR(10) CHECK(plan_type IN ('basic', 'premium')) DEFAULT 'basic',
    monthly_fee DECIMAL(10,2) DEFAULT 200.00,
    installation_date DATE,
    status VARCHAR(10) CHECK(status IN ('active', 'inactive', 'trial')) DEFAULT 'trial',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (manager_id) REFERENCES users(id)
);

-- Tabela de Sensores IoT
CREATE TABLE sensors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_code VARCHAR(50) UNIQUE NOT NULL,
    condominium_id INTEGER NOT NULL,
    location VARCHAR(100) NOT NULL, -- Ex: "Bloco A - Térreo", "Área de Lazer"
    container_type VARCHAR(15) CHECK(container_type IN ('organic', 'recyclable', 'general')) DEFAULT 'general',
    installation_date DATE NOT NULL,
    last_maintenance DATE,
    battery_level INTEGER DEFAULT 100, -- Percentual da bateria
    status VARCHAR(15) CHECK(status IN ('active', 'inactive', 'maintenance')) DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condominium_id) REFERENCES condominiums(id)
);

-- Tabela de Leituras dos Sensores (Dados IoT)
CREATE TABLE sensor_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    fill_level INTEGER NOT NULL, -- Percentual de preenchimento (0-100)
    temperature DECIMAL(5,2), -- Temperatura do sensor
    humidity DECIMAL(5,2), -- Umidade
    battery_voltage DECIMAL(4,2), -- Voltagem da bateria
    signal_strength INTEGER, -- Força do sinal (-100 a 0 dBm)
    reading_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

-- Tabela de Empresas de Coleta
CREATE TABLE collection_companies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name VARCHAR(150) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    contact_name VARCHAR(100),
    email VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    service_area TEXT, -- Regiões que atendem
    price_per_collection DECIMAL(10,2),
    partnership_type VARCHAR(20) CHECK(partnership_type IN ('licenciamento', 'plataforma_completa', 'estrategica')),
    status VARCHAR(15) CHECK(status IN ('active', 'inactive', 'negotiating')) DEFAULT 'negotiating',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Coletas Realizadas
CREATE TABLE collections (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    company_id INTEGER,
    collection_date DATETIME NOT NULL,
    fill_level_before INTEGER, -- Nível antes da coleta
    fill_level_after INTEGER DEFAULT 0, -- Nível após a coleta
    collection_type VARCHAR(15) CHECK(collection_type IN ('scheduled', 'emergency', 'maintenance')) DEFAULT 'scheduled',
    cost DECIMAL(10,2),
    notes TEXT,
    status VARCHAR(15) CHECK(status IN ('completed', 'cancelled', 'pending')) DEFAULT 'completed',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id),
    FOREIGN KEY (company_id) REFERENCES collection_companies(id)
);

-- Tabela de Alertas Automáticos
CREATE TABLE alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id INTEGER NOT NULL,
    alert_type VARCHAR(20) CHECK(alert_type IN ('high_level', 'battery_low', 'sensor_offline', 'maintenance_due')) NOT NULL,
    severity VARCHAR(10) CHECK(severity IN ('low', 'medium', 'high', 'critical')) NOT NULL,
    message TEXT NOT NULL,
    is_resolved BOOLEAN DEFAULT FALSE,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sensor_id) REFERENCES sensors(id)
);

-- Tabela de Notificações WhatsApp
CREATE TABLE whatsapp_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    condominium_id INTEGER NOT NULL,
    phone_number VARCHAR(20) NOT NULL,
    message TEXT NOT NULL,
    message_type VARCHAR(20) CHECK(message_type IN ('collection_alert', 'maintenance', 'general')) NOT NULL,
    status VARCHAR(15) CHECK(status IN ('sent', 'delivered', 'failed', 'pending')) DEFAULT 'pending',
    sent_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (condominium_id) REFERENCES condominiums(id)
);

-- Tabela de Leads/Demonstrações
CREATE TABLE demo_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    position VARCHAR(100), -- Cargo
    condominium_name VARCHAR(150),
    units_count INTEGER,
    collections_per_week INTEGER,
    main_challenges TEXT,
    request_type VARCHAR(15) CHECK(request_type IN ('demo', 'partnership', 'contact')) DEFAULT 'demo',
    status VARCHAR(15) CHECK(status IN ('new', 'contacted', 'scheduled', 'completed', 'lost')) DEFAULT 'new',
    notes TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Configurações do Sistema
CREATE TABLE system_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de Logs de Atividades
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(50),
    record_id INTEGER,
    old_values TEXT, -- JSON com valores anteriores
    new_values TEXT, -- JSON com novos valores
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Índices para Performance
CREATE INDEX idx_sensor_readings_sensor_timestamp ON sensor_readings(sensor_id, reading_timestamp);
CREATE INDEX idx_collections_sensor_date ON collections(sensor_id, collection_date);
CREATE INDEX idx_alerts_sensor_resolved ON alerts(sensor_id, is_resolved);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_sensors_condominium ON sensors(condominium_id);

-- Inserir configurações padrão
INSERT INTO system_settings (setting_key, setting_value, description) VALUES
('alert_high_level_threshold', '85', 'Percentual para alerta de nível alto'),
('alert_critical_level_threshold', '95', 'Percentual para alerta crítico'),
('battery_low_threshold', '20', 'Percentual mínimo de bateria'),
('whatsapp_api_token', '', 'Token da API do WhatsApp'),
('monthly_base_price', '200.00', 'Preço base mensal da plataforma'),
('sensor_installation_price', '50.00', 'Preço de instalação por sensor'),
('company_name', 'SmartTrash', 'Nome da empresa'),
('support_email', 'smarttrashdevs@gmail.com', 'E-mail de suporte'),
('support_phone', '75981829675', 'Telefone de suporte');

-- Dados de exemplo para desenvolvimento
INSERT INTO users (name, email, password_hash, phone, user_type, status) VALUES
('Admin SmartTrash', 'admin@smarttrash.com.br', '$2y$10$example_hash', '75981829675', 'gestor', 'active'),
('João Silva', 'joao.silva@email.com', '$2y$10$example_hash', '75999887766', 'gestor', 'active'),
('Maria Santos', 'maria.santos@email.com', '$2y$10$example_hash', '75988776655', 'sindico', 'active');

INSERT INTO condominiums (name, address, units_count, manager_id, status) VALUES
('Residencial Jardins', 'Rua das Flores, 123 - Jardim Acácia', 120, 2, 'active'),
('Condomínio Horizonte', 'Av. Presidente Dutra, 456 - Centro', 80, 3, 'active'),
('Torres do Sol', 'Rua do Sol, 789 - Kalilândia', 200, 2, 'trial');

-- Views úteis para relatórios
CREATE VIEW sensor_status_summary AS
SELECT 
    s.id,
    s.sensor_code,
    s.location,
    c.name as condominium_name,
    sr.fill_level,
    sr.battery_voltage,
    sr.reading_timestamp,
    CASE 
        WHEN sr.fill_level >= 95 THEN 'critical'
        WHEN sr.fill_level >= 85 THEN 'high'
        WHEN sr.fill_level >= 70 THEN 'medium'
        ELSE 'normal'
    END as status_level
FROM sensors s
JOIN condominiums c ON s.condominium_id = c.id
LEFT JOIN sensor_readings sr ON s.id = sr.sensor_id
WHERE sr.id = (
    SELECT MAX(id) FROM sensor_readings WHERE sensor_id = s.id
)
AND s.status = 'active';

CREATE VIEW monthly_collection_stats AS
SELECT 
    c.name as condominium_name,
    COUNT(col.id) as total_collections,
    AVG(col.fill_level_before) as avg_fill_level,
    SUM(col.cost) as total_cost,
    strftime('%Y-%m', col.collection_date) as month_year
FROM condominiums c
JOIN sensors s ON c.id = s.condominium_id
JOIN collections col ON s.id = col.sensor_id
WHERE col.status = 'completed'
GROUP BY c.id, strftime('%Y-%m', col.collection_date)
ORDER BY month_year DESC;


