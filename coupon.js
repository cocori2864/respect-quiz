// 쿠폰 JavaScript
let currentCoupon = null;

function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        code: urlParams.get('code'),
        event: urlParams.get('event') || '행사'
    };
}

function loadCoupon() {
    const params = getUrlParams();
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    
    // 쿠폰 코드로 찾기
    currentCoupon = coupons.find(c => c.couponCode === params.code);
    
    if (!currentCoupon) {
        alert('유효하지 않은 쿠폰입니다.');
        window.location.href = 'quiz.html?event=' + encodeURIComponent(params.event);
        return;
    }
    
    displayCoupon();
}

function displayCoupon() {
    const params = getUrlParams();
    
    // 제목 설정
    document.getElementById('couponTitle').textContent = params.event + ' 쿠폰 획득!';
    document.getElementById('eventCouponName').textContent = params.event + ' 쿠폰';
    document.title = params.event + ' 쿠폰';
    
    if (currentCoupon.used) {
        // 사용된 쿠폰
        document.getElementById('couponCard').style.display = 'none';
        document.getElementById('usedCoupon').style.display = 'block';
        document.getElementById('usedTime').textContent = 
            new Date(currentCoupon.usedTime).toLocaleString('ko-KR');
    } else {
        // 사용 가능한 쿠폰
        document.getElementById('couponScore').textContent = currentCoupon.score;
        document.getElementById('issueTime').textContent = 
            new Date(currentCoupon.timestamp).toLocaleString('ko-KR');
    }
}

function requestAdminUse() {
    // 관리자 확인
    const confirmed = confirm('관리자 확인: 이 쿠폰을 사용 처리하시겠습니까?\\n\\n⚠️ 이 작업은 되돌릴 수 없습니다.');
    
    if (!confirmed) {
        return;
    }
    
    // 쿠폰 사용 처리
    useCoupon();
}

function useCoupon() {
    if (!currentCoupon || currentCoupon.used) {
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
    displayCoupon();
    
    // 성공 알림
    alert('✅ 쿠폰이 사용 처리되었습니다!');
    
    // 진동 효과 (모바일)
    if (navigator.vibrate) {
        navigator.vibrate([300, 100, 300, 100, 300]);
    }
}

function goToQuiz() {
    const params = getUrlParams();
    window.location.href = 'quiz.html?event=' + encodeURIComponent(params.event);
}

// 쿠폰 상태 실시간 확인
function checkCouponStatus() {
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const updatedCoupon = coupons.find(c => c.couponCode === currentCoupon.couponCode);
    
    if (updatedCoupon && updatedCoupon.used !== currentCoupon.used) {
        // 쿠폰 상태가 변경됨
        currentCoupon = updatedCoupon;
        displayCoupon();
    }
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    loadCoupon();
    
    // 5초마다 쿠폰 상태 확인
    setInterval(checkCouponStatus, 5000);
});

// 스토리지 변경 감지 (다른 탭에서 쿠폰 상태 변경 시)
window.addEventListener('storage', function(e) {
    if (e.key === 'coupons') {
        checkCouponStatus();
    }
});