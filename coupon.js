/**
 * 쿠폰 페이지 스크립트
 */

/**
 * URL에서 파라미터를 가져오는 함수
 * @returns {object} URL 파라미터 객체
 */
function getUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);
    return {
        event: urlParams.get('event') || '소통 감수성 퀴즈',
        score: urlParams.get('score') || '0'
    };
}

/**
 * 쿠폰 사용 처리 함수
 */
function useCoupon() {
    // 사용자에게 재확인
    if (confirm("정말로 쿠폰을 사용하시겠습니까?
이 작업은 되돌릴 수 없습니다.")) {
        // 쿠폰을 사용했다는 사실을 localStorage에 영구 기록
        localStorage.setItem('couponUsed', 'true');
        localStorage.setItem('couponUsedTime', new Date().toISOString());
        
        // 화면 업데이트
        displayCouponState();
        
        alert("쿠폰이 성공적으로 사용 처리되었습니다.");
    }
}

/**
 * 현재 쿠폰 상태에 따라 화면을 표시하는 함수
 */
function displayCouponState() {
    const couponUsed = localStorage.getItem('couponUsed') === 'true';

    if (couponUsed) {
        document.getElementById('couponCard').style.display = 'none';
        document.getElementById('usedCoupon').style.display = 'block';
        
        const usedTime = new Date(localStorage.getItem('couponUsedTime'));
        document.getElementById('usedTime').textContent = usedTime.toLocaleString('ko-KR');
    } else {
        document.getElementById('couponCard').style.display = 'block';
        document.getElementById('usedCoupon').style.display = 'none';
        
        const params = getUrlParams();
        document.getElementById('couponTitle').textContent = `"${params.event}" 쿠폰`;
        document.getElementById('couponScore').textContent = params.score;
    }
}

// --- 페이지 로드 시 실행 ---
document.addEventListener('DOMContentLoaded', () => {
    displayCouponState();
});