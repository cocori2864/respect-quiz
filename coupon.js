/**
 * 쿠폰 관리 JavaScript
 * 기능: 쿠폰 표시, 관리자 사용 처리
 */

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
    const coupon = coupons.find(c => c.couponCode === params.code);
    
    if (!coupon) {
        alert('유효하지 않은 쿠폰입니다.');
        window.location.href = 'index.html';
        return;
    }
    
    displayCoupon(coupon);
}

function displayCoupon(coupon) {
    const params = getUrlParams();
    document.getElementById('couponTitle').textContent = params.event + ' 쿠폰';
    document.getElementById('eventCouponName').textContent = params.event + ' 쿠폰';
    document.title = params.event + ' 쿠폰';

    if (coupon.used) {
        document.getElementById('couponCard').style.display = 'none';
        document.getElementById('usedCoupon').style.display = 'block';
        document.getElementById('usedTime').textContent = new Date(coupon.usedTime).toLocaleString();
    } else {
        document.getElementById('couponScore').textContent = coupon.score;
        document.getElementById('issueTime').textContent = new Date(coupon.timestamp).toLocaleString();
        document.getElementById('couponCodeText').textContent = coupon.couponCode;
    }
}

function useCoupon() {
    if (confirm('관리자만 사용하세요. 쿠폰을 사용 처리하시겠습니까?')) {
        const params = getUrlParams();
        let coupons = JSON.parse(localStorage.getItem('coupons')) || [];
        const couponIndex = coupons.findIndex(c => c.couponCode === params.code);

        if (couponIndex !== -1 && !coupons[couponIndex].used) {
            coupons[couponIndex].used = true;
            coupons[couponIndex].usedTime = new Date().toISOString();
            localStorage.setItem('coupons', JSON.stringify(coupons));
            displayCoupon(coupons[couponIndex]);
            alert('쿠폰이 사용 처리되었습니다.');
        } else {
            alert('이미 사용된 쿠폰이거나 유효하지 않은 쿠폰입니다.');
        }
    }
}

function goBack() {
    window.history.back();
}

document.addEventListener('DOMContentLoaded', loadCoupon);