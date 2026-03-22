(function () {
  'use strict';

  const SESSION_KEY = 'nextbot_session';
  const API_BASE = '/api';

  const Auth = {
    session: null,

    init() {
      try {
        const s = localStorage.getItem(SESSION_KEY);
        if (s) this.session = JSON.parse(s);
      } catch (e) {
        console.error('Failed to load session', e);
        this.session = null;
      }
    },

    _saveSession() {
      if (this.session) {
        localStorage.setItem(SESSION_KEY, JSON.stringify(this.session));
      } else {
        localStorage.removeItem(SESSION_KEY);
      }
    },

    async register(username, password) {
      try {
        const res = await fetch(`${API_BASE}/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          return { success: true, message: 'Registration successful' };
        }
        return { success: false, message: data.error || 'Registration failed' };
      } catch (e) {
        return { success: false, message: 'Server error' };
      }
    },

    async login(username, password) {
      try {
        const res = await fetch(`${API_BASE}/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (res.ok) {
          this.session = { 
            ...data,
            loginTime: Date.now() 
          };
          this._saveSession();
          return { success: true, message: 'Login successful' };
        }
        return { success: false, message: data.error || 'Invalid credentials' };
      } catch (e) {
        return { success: false, message: 'Server error' };
      }
    },

    logout() { 
      this.session = null; 
      this._saveSession(); 
      location.reload();
      return { success: true }; 
    },

    isLoggedIn() { return !!this.session && !!this.session.token; },
    getCurrentUser() { return this.session; },
    getToken() { return this.session?.token || ''; },

    async updateSettings(newSettings) {
      // For now, settings are local or optionally synced if you add an endpoint
      if (this.session) {
        this.session.settings = { ...this.session.settings, ...newSettings };
        this._saveSession();
      }
      return { success: true, settings: this.session?.settings };
    }
  };

  Auth.init();
  window.auth = Auth;

  // Global Auth UI logic
  document.addEventListener('DOMContentLoaded', () => {
    const modalHTML = `
      <div id="loginModal" class="modal">
        <div class="modal-content">
          <div class="modal-header">
            <h2 id="authTitle">NextBot Login</h2>
            <button id="authClose" class="close-btn">&times;</button>
          </div>
          <div class="login-form">
            <input id="authUsername" type="text" placeholder="Username" />
            <input id="authPassword" type="password" placeholder="Password" />
            <div id="authError" class="form-error"></div>
            <div class="form-buttons">
              <button id="authLogin" class="primary-btn">Login</button>
              <button id="authRegister" class="secondary-btn">Register</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHTML);

    const modal = document.getElementById('loginModal');
    const btnClose = document.getElementById('authClose');
    const btnLogin = document.getElementById('authLogin');
    const btnRegister = document.getElementById('authRegister');
    const inputUser = document.getElementById('authUsername');
    const inputPass = document.getElementById('authPassword');
    const err = document.getElementById('authError');

    btnClose.onclick = () => modal.classList.remove('active');

    btnLogin.onclick = async () => {
      err.textContent = 'Logging in...';
      const r = await Auth.login(inputUser.value, inputPass.value);
      if (r.success) { location.reload(); }
      else err.textContent = r.message;
    };

    btnRegister.onclick = async () => {
      err.textContent = 'Registering...';
      const r = await Auth.register(inputUser.value, inputPass.value);
      if (r.success) {
        err.textContent = 'Success! Logging in...';
        await Auth.login(inputUser.value, inputPass.value);
        location.reload();
      } else err.textContent = r.message;
    };

    window.showLogin = () => modal.classList.add('active');
  });

})();