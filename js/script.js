window.addEventListener('DOMContentLoaded', () => {
    // --- LẤY CÁC ELEMENT CẦN THIẾT ---
    const tabsContainer = document.getElementById('tabs-container');
    const loginTab = document.getElementById('login-tab');
    const registerTab = document.getElementById('register-tab');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const forgotPasswordLink = document.getElementById('forgot-password-link');
    const requestOtpForm = document.getElementById('request-otp-form');
    const verifyOtpForm = document.getElementById('verify-otp-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    const backToLoginLinks = document.querySelectorAll('.back-to-login');
    
    const FAKE_OTP = '123456';

    // --- BIẾN TRẠNG THÁI (STATE) ĐỂ QUẢN LÝ LOGIC PHỨC TẠP ---
    // Sửa lỗi 1: Đưa các biến này ra ngoài để tất cả các hàm đều có thể truy cập
    let pendingUserData = null;   // Lưu thông tin người dùng đang chờ đăng ký
    let usernameToReset = null;   // Lưu username đang chờ đổi mật khẩu
    let otpContext = '';          // Lưu ngữ cảnh ('register' hoặc 'forgot_password')

    // --- HÀM HELPER ---
    const showForm = (formToShow) => {
        [loginForm, registerForm, requestOtpForm, verifyOtpForm, resetPasswordForm].forEach(form => form.classList.remove('active'));
        formToShow.classList.add('active');
        tabsContainer.style.display = (formToShow === loginForm || formToShow === registerForm) ? 'flex' : 'none';
    };

    // --- GÁN CÁC SỰ KIỆN ---

    // Chuyển tab
    loginTab.addEventListener('click', () => { showForm(loginForm); loginTab.classList.add('active'); registerTab.classList.remove('active'); });
    registerTab.addEventListener('click', () => { showForm(registerForm); registerTab.classList.add('active'); loginTab.classList.remove('active'); });
    backToLoginLinks.forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); loginTab.click(); }); });

    // Đăng nhập
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const uname = document.getElementById('login-username').value;
        const pwd = document.getElementById('login-password').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.username === uname && u.password === pwd);
        if (user) {
            alert(`Đăng nhập thành công! Chào ${user.username}`);
            window.location.href = 'dashboard.html';
        } else {
            alert('Sai username hoặc mật khẩu.');
        }
        loginForm.reset();
    });

    // Bắt đầu luồng đăng ký
    registerForm.addEventListener('submit', e => {
        e.preventDefault();
        const uname = document.getElementById('reg-username').value;
        const pwd = document.getElementById('reg-password').value;
        const phone = document.getElementById('reg-phone').value;
        const role = document.getElementById('reg-role').value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        
        if (users.find(u => u.username === uname)) return alert('Username đã tồn tại!');
        if (!phone) return alert('Vui lòng nhập số điện thoại!');

        // Lưu thông tin chờ và đặt ngữ cảnh
        pendingUserData = { username: uname, password: pwd, phone: phone, role: role };
        otpContext = 'register';
        
        alert(`(Giả lập) Mã OTP đã được gửi đến SĐT ${phone}. Mã là: ${FAKE_OTP}`);
        showForm(verifyOtpForm);
    });

    // Bắt đầu luồng quên mật khẩu
    forgotPasswordLink.addEventListener('click', (e) => { e.preventDefault(); showForm(requestOtpForm); });
    
    // Sửa lỗi 2: Dùng đúng ID và logic cho quên mật khẩu
    requestOtpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        // Phải dùng username để tìm tài khoản, không phải SĐT
        const usernameInput = document.getElementById('login-username');
        const username = usernameInput.value;
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const userExists = users.find(u => u.username === username);

        if (userExists) {
            usernameToReset = username; // Lưu lại username để dùng sau
            otpContext = 'forgot_password'; // Đặt ngữ cảnh
            alert(`Mã OTP đã được gửi. Mã là: ${FAKE_OTP}`);
            showForm(verifyOtpForm);
        } else {
            alert('Username không tồn tại!');
        }
    });

    // --- XỬ LÝ OTP (ĐÂY LÀ PHẦN SỬA LỖI CHÍNH) ---
    verifyOtpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const otpCode = document.getElementById('otp-code').value;

        if (otpCode !== FAKE_OTP) {
            return alert('Mã OTP không chính xác. Vui lòng thử lại.');
        }

        // Dựa vào ngữ cảnh (otpContext) để quyết định hành động tiếp theo
        if (otpContext === 'register') {
            // === XỬ LÝ CHO VIỆC ĐĂNG KÝ ===
            let users = JSON.parse(localStorage.getItem('users')) || [];
            users.push(pendingUserData);
            localStorage.setItem('users', JSON.stringify(users));

            alert('Xác thực thành công! Đăng ký hoàn tất. Vui lòng đăng nhập.');

            // Dọn dẹp
            pendingUserData = null;
            otpContext = '';
            registerForm.reset();
            verifyOtpForm.reset();
            
            // Quay về trang đăng nhập
            loginTab.click();

        } else if (otpContext === 'forgot_password') {
            // === XỬ LÝ CHO VIỆC QUÊN MẬT KHẨU ===
            alert('Xác thực OTP thành công!');
            showForm(resetPasswordForm); // Chuyển đến form đổi mật khẩu
            verifyOtpForm.reset();
        }
    });

    // Đặt lại mật khẩu mới
    resetPasswordForm.addEventListener('submit', e => {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) return alert('Mật khẩu xác nhận không khớp!');
        
        if (usernameToReset) {
            let users = JSON.parse(localStorage.getItem('users')) || [];
            const userIndex = users.findIndex(u => u.username === usernameToReset);
            if (userIndex !== -1) {
                users[userIndex].password = newPassword;
                localStorage.setItem('users', JSON.stringify(users));
                
                alert('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
                
                // Dọn dẹp
                usernameToReset = null;
                otpContext = '';
                resetPasswordForm.reset();
                
                loginTab.click();
            }
        }
    });
});
