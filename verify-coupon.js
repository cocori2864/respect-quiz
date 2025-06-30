// 쿠폰 검증 JavaScript
let currentCoupon = null;
let adminMode = false;

function getCouponCodeFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('code');
}

function loadCouponForVerify() {
    const couponCode = getCouponCodeFromUrl();
    
    if (!couponCode) {
        showInvalidCoupon();
        return;
    }
    
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    currentCoupon = coupons.find(c => c.couponCode === couponCode);
    
    if (!currentCoupon) {
        showInvalidCoupon();
        return;
    }
    
    displayCouponInfo();
}

function displayCouponInfo() {
    document.getElementById('verifyCode').textContent = currentCoupon.couponCode;
    document.getElementById('verifyScore').textContent = currentCoupon.score;
    document.getElementById('verifyTime').textContent = 
        new Date(currentCoupon.timestamp).toLocaleString('ko-KR');
    
    const statusElement = document.getElementById('verifyStatus');
    const adminActions = document.getElementById('adminActions');
    const alreadyUsed = document.getElementById('alreadyUsed');
    
    if (currentCoupon.used) {
        statusElement.textContent = '사용 완료';
        statusElement.className = 'status-badge used';
        adminActions.style.display = 'none';
        alreadyUsed.style.display = 'block';
        document.getElementById('usedTime').textContent = 
            new Date(currentCoupon.usedTime).toLocaleString('ko-KR');
    } else {
        statusElement.textContent = '사용 가능';
        statusElement.className = 'status-badge available';
        alreadyUsed.style.display = 'none';
        
        if (adminMode) {
            adminActions.style.display = 'block';
        }
    }
}

function showInvalidCoupon() {
    document.getElementById('couponInfo').style.display = 'none';
    document.getElementById('adminActions').style.display = 'none';
    document.getElementById('alreadyUsed').style.display = 'none';
    document.getElementById('invalidCoupon').style.display = 'block';
}

function toggleAdminMode() {
    adminMode = !adminMode;
    const adminModeBtn = document.getElementById('adminModeBtn');
    
    if (adminMode) {
        // 관리자 모드 활성화 확인
        const password = prompt('관리자 비밀번호를 입력하세요:');
        if (password !== 'admin123') {
            alert('잘못된 비밀번호입니다.');
            adminMode = false;
            return;
        }
        
        adminModeBtn.textContent = '관리자 모드 (활성)';
        adminModeBtn.style.background = '#e53e3e';
        
        if (currentCoupon && !currentCoupon.used) {
            document.getElementById('adminActions').style.display = 'block';
        }
    } else {
        adminModeBtn.textContent = '관리자 모드';
        adminModeBtn.style.background = '';
        document.getElementById('adminActions').style.display = 'none';
    }
}

function useCoupon() {
    if (!adminMode || !currentCoupon || currentCoupon.used) {
        return;
    }
    
    const confirmUse = confirm('정말로 이 쿠폰을 사용 처리하시겠습니까?\\n\\n이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmUse) {
        return;
    }
    
    // 쿠폰 사용 처리
    currentCoupon.used = true;
    currentCoupon.usedTime = new Date().toISOString();
    
    // 로컬 스토리지 업데이트
    let coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const couponIndex = coupons.findIndex(c => c.couponCode === currentCoupon.couponCode);
    
    if (couponIndex !== -1) {
        coupons[couponIndex] = currentCoupon;
        localStorage.setItem('coupons', JSON.stringify(coupons));
    }
    
    // 화면 업데이트
    displayCouponInfo();
    
    // 성공 메시지
    alert('쿠폰이 성공적으로 사용 처리되었습니다.');
    
    // 진동 효과 (모바일)
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300]);
    }
}

function goBack() {
    window.history.back();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCouponForVerify();
});

// 스토리지 변경 감지
window.addEventListener('storage', function(e) {
    if (e.key === 'coupons' && currentCoupon) {
        loadCouponForVerify();
    }
});