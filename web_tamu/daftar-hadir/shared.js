const Shared = {
    sessionTimeout: null,
    SESSION_TIMEOUT_MS: 30 * 60 * 1000,

    hideLoading() {
        setTimeout(() => {
            const el = document.getElementById('loading-screen');
            if (el) el.classList.add('hidden');
        }, 300);
    },

    initTheme() {
        const saved = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', saved);
        this.updateThemeIcon(saved);
    },

    toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('theme', next);
        this.updateThemeIcon(next);
    },

    updateThemeIcon(theme) {
        const icon = document.querySelector('#theme-toggle i');
        if (icon) icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    },

    startClock() {
        const update = () => {
            const now = new Date();
            const opts = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateEl = document.getElementById('date-display');
            const timeEl = document.getElementById('time-display');
            if (dateEl) dateEl.textContent = now.toLocaleDateString('id-ID', opts);
            if (timeEl) timeEl.textContent = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        };
        update();
        setInterval(update, 1000);
    },

    loadData() {
        try {
            const data = localStorage.getItem('guest_data');
            return data ? JSON.parse(data) : [];
        } catch { return []; }
    },

    saveData(guests) {
        localStorage.setItem('guest_data', JSON.stringify(guests));
    },

    isLoggedIn() {
        return localStorage.getItem('admin_logged_in') === 'true';
    },

    login() {
        localStorage.setItem('admin_logged_in', 'true');
        localStorage.setItem('admin_login_time', Date.now().toString());
        this.startSessionTimeout();
    },

    logout() {
        localStorage.removeItem('admin_logged_in');
        localStorage.removeItem('admin_login_time');
        this.clearSessionTimeout();
    },

    startSessionTimeout() {
        this.clearSessionTimeout();
        this.sessionTimeout = setTimeout(() => {
            this.logout();
            this.showToast('warning', 'Sesi habis. Silakan login kembali.');
            setTimeout(() => { window.location.href = 'login.html'; }, 1500);
        }, this.SESSION_TIMEOUT_MS);
    },

    clearSessionTimeout() {
        if (this.sessionTimeout) {
            clearTimeout(this.sessionTimeout);
            this.sessionTimeout = null;
        }
    },

    resetSessionTimeout() {
        if (this.isLoggedIn()) {
            localStorage.setItem('admin_login_time', Date.now().toString());
            this.startSessionTimeout();
        }
    },

    esc(str) {
        const div = document.createElement('div');
        div.textContent = str || '';
        return div.innerHTML;
    },

    showToast(type, message) {
        const icons = { success: 'fa-check-circle', error: 'fa-times-circle', warning: 'fa-exclamation-triangle' };
        const container = document.getElementById('toast-container');
        if (!container) return;
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `<i class="fas ${icons[type]}"></i><span>${message}</span>`;
        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Sistem Daftar Hadir', { body: message, icon: 'assets/logo.png' });
        }
    },

    requestNotificationPermission() {
        if ('Notification' in window && Notification.permission === 'default') {
            Notification.requestPermission();
        }
    },

    confirmCallback: null,

    showConfirm(title, message, callback) {
        document.getElementById('confirm-title').textContent = title;
        document.getElementById('confirm-message').textContent = message;
        this.confirmCallback = callback;
        document.getElementById('confirm-modal').classList.add('active');
    },

    closeConfirmModal() {
        document.getElementById('confirm-modal').classList.remove('active');
        this.confirmCallback = null;
    },

    initScrollTop() {
        const btn = document.getElementById('scroll-top');
        if (!btn) return;
        window.addEventListener('scroll', () => {
            btn.classList.toggle('visible', window.scrollY > 300);
        });
        btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    },

    animateNumber(id, target) {
        const el = document.getElementById(id);
        if (!el) return;
        const current = parseInt(el.textContent) || 0;
        if (current === target) return;
        const diff = target - current;
        const step = Math.ceil(Math.abs(diff) / 15);
        let val = current;
        const interval = setInterval(() => {
            val += diff > 0 ? step : -step;
            if ((diff > 0 && val >= target) || (diff < 0 && val <= target)) {
                val = target;
                clearInterval(interval);
            }
            el.textContent = val;
        }, 30);
    },

    validatePhone(value) {
        const clean = value.replace(/[\s\-]/g, '');
        const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,11}$/;
        return phoneRegex.test(clean);
    },

    formatPhone(value) {
        let clean = value.replace(/[\s\-]/g, '');
        if (clean.startsWith('+62')) clean = '0' + clean.slice(3);
        if (clean.startsWith('62')) clean = '0' + clean.slice(2);
        return clean;
    },

    generateQR(data) {
        if (typeof qrcode === 'undefined') return null;
        try {
            const qr = qrcode(0, 'M');
            qr.addData(JSON.stringify(data));
            qr.make();
            return qr.createImgTag(4, 4);
        } catch { return null; }
    },

    showSkeletonLoading(containerId, rows) {
        const container = document.getElementById(containerId);
        if (!container) return;
        let html = '';
        for (let i = 0; i < (rows || 5); i++) {
            html += `<div class="skeleton-row">
                <div class="skeleton skeleton-cell"></div>
                <div class="skeleton skeleton-cell"></div>
                <div class="skeleton skeleton-cell"></div>
                <div class="skeleton skeleton-cell"></div>
                <div class="skeleton skeleton-cell"></div>
            </div>`;
        }
        container.innerHTML = html;
    },

    initCommon() {
        this.initTheme();
        this.startClock();
        this.initScrollTop();
        this.requestNotificationPermission();

        const themeBtn = document.getElementById('theme-toggle');
        if (themeBtn) themeBtn.addEventListener('click', () => this.toggleTheme());

        const confirmOk = document.getElementById('confirm-ok');
        const confirmCancel = document.getElementById('confirm-cancel');
        const confirmModal = document.getElementById('confirm-modal');

        if (confirmOk) confirmOk.addEventListener('click', () => {
            if (this.confirmCallback) this.confirmCallback();
            this.closeConfirmModal();
        });
        if (confirmCancel) confirmCancel.addEventListener('click', () => this.closeConfirmModal());
        if (confirmModal) confirmModal.addEventListener('click', (e) => {
            if (e.target === e.currentTarget) this.closeConfirmModal();
        });

        if (this.isLoggedIn()) {
            this.startSessionTimeout();
            document.addEventListener('click', () => this.resetSessionTimeout());
            document.addEventListener('keydown', () => this.resetSessionTimeout());
        }

        this.hideLoading();
    }
};
