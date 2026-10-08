// InterviewAce Authentication UI Script

document.addEventListener('DOMContentLoaded', () => {
    // Password Visibility Toggle
    const togglePasswordBtn = document.getElementById('togglePassword');
    const passwordInput = document.getElementById('passwordInput');
    const eyeIcon = document.getElementById('eyeIcon');

    if (togglePasswordBtn && passwordInput && eyeIcon) {
        togglePasswordBtn.addEventListener('click', () => {
            const isPassword = passwordInput.type === 'password';
            passwordInput.type = isPassword ? 'text' : 'password';
            eyeIcon.className = isPassword ? 'bi bi-eye-slash' : 'bi bi-eye';
        });
    }

    // Disable button on form submit to prevent double submission
    const loginForm = document.getElementById('loginForm');
    const loginBtn = document.getElementById('loginBtn');
    if (loginForm && loginBtn) {
        loginForm.addEventListener('submit', () => {
            loginBtn.disabled = true;
            loginBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span> Verifying...';
        });
    }

    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            const pass = document.getElementById('regPassword');
            const confirmPass = document.getElementById('regConfirmPassword');
            if (pass && confirmPass && pass.value !== confirmPass.value) {
                e.preventDefault();
                alert('Passwords do not match.');
            }
        });
    }
});
