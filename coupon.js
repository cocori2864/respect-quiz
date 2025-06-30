/**
 * 쿠폰 관리 JavaScript
 * 기능: 쿠폰 표시, 관리자 사용 처리, 보안 강화 (백스페이스 방지)
 */
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
    
    // 쿠폰 사용 여부에 따른 버튼 제어
    const backButton = document.querySelector('.back-btn');
    
    if (currentCoupon.used) {
        // 사용된 쿠폰
        document.getElementById('couponCard').style.display = 'none';
        document.getElementById('usedCoupon').style.display = 'block';
        document.getElementById('usedTime').textContent = 
            new Date(currentCoupon.usedTime).toLocaleString('ko-KR');
        
        // "퀴즈로 돌아가기" 버튼 비활성화
        if (backButton) {
            backButton.disabled = true;
            backButton.textContent = '퀴즈 참여 완료';
            backButton.style.background = '#a0aec0';
            backButton.style.cursor = 'not-allowed';
            backButton.style.opacity = '0.6';
        }
    } else {
        // 사용 가능한 쿠폰
        document.getElementById('couponScore').textContent = currentCoupon.score;
        document.getElementById('issueTime').textContent = 
            new Date(currentCoupon.timestamp).toLocaleString('ko-KR');
        
        // 버튼 활성화 상태 유지
        if (backButton) {
            backButton.disabled = false;
            backButton.textContent = '퀴즈로 돌아가기';
            backButton.style.background = '';
            backButton.style.cursor = 'pointer';
            backButton.style.opacity = '1';
        }
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
    // 쿠폰이 사용된 경우 이동 방지
    if (currentCoupon && currentCoupon.used) {
        alert('쿠폰을 사용하여 추가 퀴즈 참여가 불가능합니다.');
        return;
    }
    
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
    
    // 뒤로가기 방지 (쿠폰 사용 후)
    preventBackNavigation();
});

// 스토리지 변경 감지 (다른 탭에서 쿠폰 상태 변경 시)
window.addEventListener('storage', function(e) {
    if (e.key === 'coupons') {
        checkCouponStatus();
    }
});

// 뒤로가기 방지 함수
function preventBackNavigation() {
    // 히스토리 상태 추가
    if (window.history && window.history.pushState) {
        window.history.pushState('couponPage', null, window.location.href);
        
        window.addEventListener('popstate', function(event) {
            // 쿠폰이 사용된 경우 뒤로가기 차단
            if (currentCoupon && currentCoupon.used) {
                window.history.pushState('couponPage', null, window.location.href);
                alert('쿠폰 사용이 완료되어 이전 페이지로 돌아갈 수 없습니다.\\n퀴즈 참여가 완료되었습니다.');
                return false;
            }
        });
    }
    
    // beforeunload 이벤트로 페이지 떠나기 방지
    window.addEventListener('beforeunload', function(event) {
        if (currentCoupon && currentCoupon.used) {
            const message = '쿠폰 사용이 완료되어 페이지를 떠날 수 없습니다.';
            event.preventDefault();
            event.returnValue = message;
            return message;
        }
    });
}