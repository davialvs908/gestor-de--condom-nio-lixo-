// Login functionality
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const accessForm = document.getElementById('accessForm');
    const contactModal = document.getElementById('contactModal');
    const registerModal = document.getElementById('registerModal');
    const loadingOverlay = document.getElementById('loadingOverlay');

    // Demo credentials
    const demoCredentials = {
        email: 'demo@smarttrash.com.br',
        password: 'demo123'
    };

    // Login form submission
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Show loading
        showLoading();
        
        try {
            // Detectar ambiente (local ou hospedado)
            const apiBaseUrl = getApiBaseUrl();
            
            // Real API call to SQLite backend
            const response = await fetch(`${apiBaseUrl}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include', // Para manter sessão
                body: JSON.stringify({
                    email: email,
                    password: password
                })
            });
            
            const data = await response.json();
            
            if (response.ok && data.success) {
                // Store user session with real data
                sessionStorage.setItem('smarttrash_user', JSON.stringify({
                    id: data.user.id,
                    email: data.user.email,
                    name: data.user.name,
                    user_type: data.user.user_type,
                    loginTime: new Date().toISOString()
                }));
                
                hideLoading();
                showSuccessMessage(`Bem-vindo, ${data.user.name}!`);
                
                // Redirect to dashboard
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                hideLoading();
                showErrorMessage(data.error || 'Erro no login. Tente novamente.');
            }
        } catch (error) {
            hideLoading();
            console.error('Erro na API:', error);
            
            // Verificar tipo de erro e tentar modo demo se API não estiver disponível
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                console.warn('API não disponível, tentando modo demo...');
                
                // Tentar login demo
                if (tryDemoLogin(email, password)) {
                    hideLoading();
                    showSuccessMessage('Login demo realizado com sucesso!');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    showErrorMessage('Credenciais inválidas. Use: demo@smarttrash.com.br / demo123');
                }
            } else {
                showErrorMessage('Erro de rede. Tente novamente em alguns segundos.');
            }
        }
    });

    // Register form submission
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const data = Object.fromEntries(formData);
            
            // Validar senhas
            if (data.password !== data.password_confirm) {
                showErrorMessage('As senhas não coincidem!');
                return;
            }
            
            // Validar termos
            if (!document.getElementById('registerTerms').checked) {
                showErrorMessage('Você deve aceitar os termos de uso!');
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Criando conta...';
            submitBtn.disabled = true;
            
            try {
                // Remover confirmação de senha antes de enviar
                delete data.password_confirm;
                
                const response = await fetch(`${getApiBaseUrl()}/api/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
                
                const result = await response.json();
                
                if (response.ok && result.success) {
                    submitBtn.innerHTML = '<i class="fas fa-check"></i> Conta Criada!';
                    
                    setTimeout(() => {
                        closeModal(registerModal);
                        showSuccessMessage('Cadastro realizado com sucesso! Aguarde aprovação da sua conta.');
                        
                        // Reset form
                        registerForm.reset();
                        submitBtn.innerHTML = originalText;
                        submitBtn.disabled = false;
                        
                        // Mostrar tela de login
                        showLoginForm();
                    }, 2000);
                } else {
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                    showErrorMessage(result.error || 'Erro no cadastro. Tente novamente.');
                }
            } catch (error) {
                console.error('Erro na API de cadastro:', error);
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
                showErrorMessage('Erro de conexão. Verifique sua internet e tente novamente.');
            }
        });
    }

    // Access form submission
    if (accessForm) {
        accessForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-check"></i> Enviado!';
                
                setTimeout(() => {
                    closeModal(contactModal);
                    showSuccessMessage('Solicitação enviada! Nossa equipe entrará em contato em até 24 horas.');
                    
                    // Reset form
                    accessForm.reset();
                    submitBtn.innerHTML = originalText;
                    submitBtn.disabled = false;
                }, 1000);
            }, 2000);
        });
    }

    // Modal functionality
    const closeButtons = document.querySelectorAll('.close');
    closeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const modal = this.closest('.modal');
            closeModal(modal);
        });
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target);
        }
    });
});

// Validation functions
function validateLogin(email, password) {
    const demoCredentials = {
        email: 'demo@smarttrash.com.br',
        password: 'demo123'
    };
    
    // Check demo credentials
    if (email === demoCredentials.email && password === demoCredentials.password) {
        return true;
    }
    
    // Check other valid credentials (for demo purposes)
    const validCredentials = [
        { email: 'gestor@condominio.com', password: '123456' },
        { email: 'admin@smarttrash.com.br', password: 'admin123' },
        { email: 'joao.silva@email.com', password: 'senha123' }
    ];
    
    return validCredentials.some(cred => 
        cred.email === email && cred.password === password
    );
}

// Demo login function
function loginDemo() {
    document.getElementById('email').value = 'demo@smarttrash.com.br';
    document.getElementById('password').value = 'demo123';
    
    // Auto submit after a short delay
    setTimeout(() => {
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }, 500);
}

// Password toggle
function togglePassword() {
    const passwordInput = document.getElementById('password');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Modal functions
function openContactModal() {
    const modal = document.getElementById('contactModal');
    modal.style.display = 'block';
    // Manter barra de rolagem visível
    document.body.style.overflowY = 'scroll';
}

function closeModal(modal) {
    modal.style.display = 'none';
    // Restaurar barra de rolagem
    document.body.style.overflowY = 'auto';
}

// Loading functions
function showLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'flex';
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    overlay.style.display = 'none';
}

// Função para detectar URL da API baseada no ambiente
function getApiBaseUrl() {
    // Se estiver rodando localmente
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:5000';
    }
    
    // Se estiver hospedado, usar a mesma origem ou URL específica da API
    // Para GitHub Pages ou outros hosts estáticos, você pode configurar uma API externa
    return window.location.origin; // ou 'https://sua-api-hospedada.com'
}

// Função para tentar login demo quando API não estiver disponível
function tryDemoLogin(email, password) {
    const demoCredentials = [
        { email: 'demo@smarttrash.com.br', password: 'demo123' },
        { email: 'davialves.20@gmail.com', password: '123456' },
        { email: 'admin@smarttrash.com', password: 'admin123' }
    ];
    
    const validCredential = demoCredentials.find(cred => 
        cred.email === email && cred.password === password
    );
    
    if (validCredential) {
        // Criar dados de usuário demo
        const userData = {
            id: 1,
            name: 'DAVI ALMEIDA DOS SANTOS ALVES',
            email: validCredential.email,
            role: 'gestor',
            condominium: 'SmartTrash',
            condominium_id: 1,
            mode: 'demo'
        };
        
        // Salvar no sessionStorage
        sessionStorage.setItem('smarttrash_user', JSON.stringify(userData));
        
        return true;
    }
    
    return false;
}

// Exportar funções globalmente
window.getApiBaseUrl = getApiBaseUrl;
window.tryDemoLogin = tryDemoLogin;

// Message functions
function showSuccessMessage(message) {
    showMessage(message, 'success');
}

function showErrorMessage(message) {
    showMessage(message, 'error');
}

function showMessage(message, type) {
    // Remove existing messages
    const existingMessages = document.querySelectorAll('.message-toast');
    existingMessages.forEach(msg => msg.remove());
    
    // Create message element
    const messageEl = document.createElement('div');
    messageEl.className = `message-toast ${type}`;
    messageEl.innerHTML = `
        <div class="message-content">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="message-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to page
    document.body.appendChild(messageEl);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (messageEl.parentElement) {
            messageEl.remove();
        }
    }, 5000);
}

// Form validation helpers
function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}

function validatePhone(phone) {
    const re = /^[\d\s\-\(\)\+]+$/;
    return re.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// Real-time form validation
document.addEventListener('DOMContentLoaded', function() {
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    
    if (emailInput) {
        emailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('error');
                showFieldError(this, 'Por favor, insira um e-mail válido');
            } else {
                this.classList.remove('error');
                hideFieldError(this);
            }
        });
    }
    
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            if (this.value.length > 0 && this.value.length < 6) {
                this.classList.add('error');
                showFieldError(this, 'A senha deve ter pelo menos 6 caracteres');
            } else {
                this.classList.remove('error');
                hideFieldError(this);
            }
        });
    }
});

function showFieldError(field, message) {
    hideFieldError(field);
    
    const errorEl = document.createElement('div');
    errorEl.className = 'field-error';
    errorEl.textContent = message;
    
    field.parentElement.appendChild(errorEl);
}

function hideFieldError(field) {
    const existingError = field.parentElement.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

// Register form functions
function showRegisterForm() {
    const registerModal = document.getElementById('registerModal');
    registerModal.style.display = 'block';
    // Manter barra de rolagem visível
    document.body.style.overflowY = 'scroll';
}

function showLoginForm() {
    const registerModal = document.getElementById('registerModal');
    if (registerModal) {
        registerModal.style.display = 'none';
    }
    // Restaurar barra de rolagem
    document.body.style.overflowY = 'auto';
}

function toggleRegisterPassword() {
    const passwordInput = document.getElementById('registerPassword');
    const toggleBtn = passwordInput.parentElement.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

function toggleRegisterPasswordConfirm() {
    const passwordInput = document.getElementById('registerPasswordConfirm');
    const toggleBtn = passwordInput.parentElement.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.classList.remove('fa-eye');
        toggleBtn.classList.add('fa-eye-slash');
    } else {
        passwordInput.type = 'password';
        toggleBtn.classList.remove('fa-eye-slash');
        toggleBtn.classList.add('fa-eye');
    }
}

// Enhanced validation for register form
document.addEventListener('DOMContentLoaded', function() {
    const registerEmailInput = document.getElementById('registerEmail');
    const registerPasswordInput = document.getElementById('registerPassword');
    const registerPasswordConfirmInput = document.getElementById('registerPasswordConfirm');
    const registerPhoneInput = document.getElementById('registerPhone');
    
    if (registerEmailInput) {
        registerEmailInput.addEventListener('blur', function() {
            if (this.value && !validateEmail(this.value)) {
                this.classList.add('error');
                showFieldError(this, 'Por favor, insira um e-mail válido');
            } else {
                this.classList.remove('error');
                hideFieldError(this);
            }
        });
    }
    
    if (registerPasswordInput) {
        registerPasswordInput.addEventListener('input', function() {
            if (this.value.length > 0 && this.value.length < 6) {
                this.classList.add('error');
                showFieldError(this, 'A senha deve ter pelo menos 6 caracteres');
            } else {
                this.classList.remove('error');
                hideFieldError(this);
            }
            
            // Verificar confirmação de senha
            if (registerPasswordConfirmInput && registerPasswordConfirmInput.value) {
                validatePasswordConfirmation();
            }
        });
    }
    
    if (registerPasswordConfirmInput) {
        registerPasswordConfirmInput.addEventListener('input', function() {
            validatePasswordConfirmation();
        });
    }
    
    if (registerPhoneInput) {
        registerPhoneInput.addEventListener('input', function() {
            // Formatar telefone automaticamente
            let value = this.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
                value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
                value = value.replace(/(\d{2})(\d{4})/, '($1) $2');
                value = value.replace(/(\d{2})/, '($1');
                this.value = value;
            }
        });
        
        registerPhoneInput.addEventListener('blur', function() {
            const phoneValue = this.value.replace(/\D/g, '');
            if (this.value && (phoneValue.length < 10 || phoneValue.length > 11)) {
                this.classList.add('error');
                showFieldError(this, 'Por favor, insira um telefone válido');
            } else {
                this.classList.remove('error');
                hideFieldError(this);
            }
        });
    }
    
    function validatePasswordConfirmation() {
        const password = registerPasswordInput.value;
        const passwordConfirm = registerPasswordConfirmInput.value;
        
        if (passwordConfirm && password !== passwordConfirm) {
            registerPasswordConfirmInput.classList.add('error');
            showFieldError(registerPasswordConfirmInput, 'As senhas não coincidem');
        } else {
            registerPasswordConfirmInput.classList.remove('error');
            hideFieldError(registerPasswordConfirmInput);
        }
    }
});
