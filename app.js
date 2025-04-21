document.addEventListener('DOMContentLoaded', () => {
    // Элементы DOM
    const loginForm = document.getElementById('login-form');
    const loginFormContainer = document.getElementById('login-form-container');
    const content = document.getElementById('content');
    const logoutBtn = document.getElementById('logout-btn');
    const loginBtn = document.getElementById('login-btn');
    const usernameSpan = document.getElementById('username');
    const networkStatus = document.getElementById('network-status');

    // Проверка авторизации при загрузке
    checkAuth();

    // Обработчик формы входа
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        // Валидация
        if (!validateEmail(email)) {
            document.getElementById('email-error').textContent = 'Введите корректный email';
            return;
        } else {
            document.getElementById('email-error').textContent = '';
        }
        
        if (password.length < 6) {
            document.getElementById('password-error').textContent = 'Пароль должен быть не менее 6 символов';
            return;
        } else {
            document.getElementById('password-error').textContent = '';
        }
        
        try {
            // Имитация запроса к API
            const response = await fakeApiLogin(email, password);
            
            if (response.success) {
                // Сохраняем токен
                localStorage.setItem('jwt', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                
                // Обновляем UI
                updateAuthUI(true, response.user.name);
                
                // Перенаправляем на защищенную страницу
                showContent();
            } else {
                alert(response.message || 'Ошибка авторизации');
            }
        } catch (error) {
            console.error('Ошибка авторизации:', error);
            alert('Произошла ошибка при авторизации');
        }
    });

    // Обработчик кнопки выхода
    logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('jwt');
        localStorage.removeItem('user');
        updateAuthUI(false);
        showLoginForm();
    });

    // Обработчик кнопки входа
    loginBtn.addEventListener('click', showLoginForm);

    // Проверка состояния сети
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // Функции
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    async function fakeApiLogin(email, password) {
        // Имитация задержки сети
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Проверка тестовых данных
        if (email === 'test@example.com' && password === 'password') {
            return {
                success: true,
                token: 'fake-jwt-token',
                user: {
                    id: 1,
                    name: 'Тестовый Пользователь',
                    email: email
                }
            };
        } else {
            return {
                success: false,
                message: 'Неверный email или пароль'
            };
        }
    }

    function checkAuth() {
        const token = localStorage.getItem('jwt');
        const user = JSON.parse(localStorage.getItem('user'));
        
        if (token && user) {
            // Проверка срока действия токена (в реальном приложении)
            updateAuthUI(true, user.name);
            showContent();
        } else {
            updateAuthUI(false);
            showLoginForm();
        }
    }

    function updateAuthUI(isAuthenticated, username = '') {
        if (isAuthenticated) {
            usernameSpan.textContent = username;
            logoutBtn.style.display = 'inline-block';
            loginBtn.style.display = 'none';
        } else {
            usernameSpan.textContent = '';
            logoutBtn.style.display = 'none';
            loginBtn.style.display = 'inline-block';
        }
    }

    function showContent() {
        loginFormContainer.style.display = 'none';
        content.style.display = 'block';
    }

    function showLoginForm() {
        loginFormContainer.style.display = 'block';
        content.style.display = 'none';
        loginForm.reset();
    }

    function updateNetworkStatus() {
        if (navigator.onLine) {
            showNotification('Соединение восстановлено', 'online');
        } else {
            showNotification('Вы в офлайне', 'offline');
        }
    }

    function showNotification(message, type) {
        // Удаляем предыдущие уведомления
        const oldNotifications = document.querySelectorAll('.notification');
        oldNotifications.forEach(notification => notification.remove());
        
        // Создаем новое уведомление
        const notification = document.createElement('div');
        notification.className = `notification ${type}-notification`;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        // Автоматическое скрытие через 3 секунды
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
});

// В начало файла app.js добавить:
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
