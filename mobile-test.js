// 모바일 테스트 JavaScript
let deviceId = null;

// 페이지 로드 시 기기 정보 수집
document.addEventListener('DOMContentLoaded', function() {
    collectDeviceInfo();
    generateTestQR();
    checkCompatibility();
});

function collectDeviceInfo() {
    // 화면 크기
    document.getElementById('screenSize').textContent = 
        `${window.screen.width} x ${window.screen.height} (뷰포트: ${window.innerWidth} x ${window.innerHeight})`;
    
    // 사용자 에이전트 (간단히)
    const ua = navigator.userAgent;
    let deviceType = 'Unknown';
    if (ua.match(/iPhone|iPad/)) deviceType = 'iOS';
    else if (ua.match(/Android/)) deviceType = 'Android';
    else if (ua.match(/Mobile/)) deviceType = 'Mobile';
    
    document.getElementById('userAgent').textContent = deviceType;
    
    // 터치 지원
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    document.getElementById('touchSupport').textContent = hasTouch ? '✅ 지원됨' : '❌ 미지원';
    
    // 진동 지원
    const hasVibration = 'vibrate' in navigator;
    document.getElementById('vibrationSupport').textContent = hasVibration ? '✅ 지원됨' : '❌ 미지원';
    
    // 카메라 접근 (getUserMedia)
    const hasCamera = 'mediaDevices' in navigator && 'getUserMedia' in navigator.mediaDevices;
    document.getElementById('cameraSupport').textContent = hasCamera ? '✅ 지원됨' : '❌ 미지원';
}

function generateTestQR() {
    // 현재 URL 기반으로 참여자 페이지 URL 생성
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
    const participantUrl = baseUrl + 'participant.html?event=모바일테스트';
    
    // URL 표시
    document.getElementById('testUrl').innerHTML = 
        `<strong>참여자 테스트 URL:</strong><br>${participantUrl}`;
    
    // QR 코드 생성
    const qrContainer = document.getElementById('testQRCode');
    
    if (typeof QRCode !== 'undefined') {
        QRCode.toCanvas(qrContainer, participantUrl, {
            width: 200,
            height: 200,
            margin: 2,
            color: {
                dark: '#333333',
                light: '#FFFFFF'
            }
        }, function (error) {
            if (error) {
                qrContainer.innerHTML = '<p style="color: #e53e3e;">QR 코드 생성 실패</p>';
            }
        });
    } else {
        qrContainer.innerHTML = '<p style="color: #ed8936;">QR 라이브러리 로딩 중...</p>';
    }
}

function checkCompatibility() {
    const ua = navigator.userAgent;
    
    // iOS 체크
    if (ua.match(/iPhone|iPad/)) {
        document.getElementById('iosStatus').className = 'status-indicator status-good';
        document.getElementById('iosText').textContent = '현재 기기 (iOS)';
    } else {
        document.getElementById('iosStatus').className = 'status-indicator status-warn';
        document.getElementById('iosText').textContent = '다른 기기에서 테스트 필요';
    }
    
    // Android 체크
    if (ua.match(/Android/)) {
        document.getElementById('androidStatus').className = 'status-indicator status-good';
        document.getElementById('androidText').textContent = '현재 기기 (Android)';
    } else {
        document.getElementById('androidStatus').className = 'status-indicator status-warn';
        document.getElementById('androidText').textContent = '다른 기기에서 테스트 필요';
    }
    
    // 모바일 최적화 체크
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
        document.getElementById('mobileStatus').className = 'status-indicator status-good';
        document.getElementById('mobileText').textContent = '모바일 화면으로 최적화됨';
    } else {
        document.getElementById('mobileStatus').className = 'status-indicator status-warn';
        document.getElementById('mobileText').textContent = '데스크톱 화면 (모바일에서 재테스트)';
    }
}

function testTouch() {
    const resultDiv = document.getElementById('touchResult');
    resultDiv.style.display = 'block';
    
    let results = [];
    
    // 터치 이벤트 테스트
    const hasTouch = 'ontouchstart' in window;
    results.push(`터치 이벤트: ${hasTouch ? '✅' : '❌'}`);
    
    // 진동 테스트
    if (navigator.vibrate) {
        navigator.vibrate([200, 100, 200]);
        results.push('진동: ✅ 테스트 진동 실행됨');
    } else {
        results.push('진동: ❌ 미지원');
    }
    
    // 클릭/터치 반응 시간
    const startTime = Date.now();
    setTimeout(() => {
        const responseTime = Date.now() - startTime;
        results.push(`반응 시간: ${responseTime}ms`);
        
        resultDiv.innerHTML = results.join('<br>');
    }, 10);
    
    // 버튼 피드백
    const button = event.target;
    button.style.transform = 'scale(0.95)';
    setTimeout(() => {
        button.style.transform = 'scale(1)';
    }, 150);
}

function testParticipant() {
    // 참여자 시뮬레이션
    localStorage.setItem('eventName', '모바일테스트');
    
    // 디바이스 ID 생성 (간단 버전)
    deviceId = 'MOBILE_' + Date.now().toString().substring(-8);
    
    // 참여자 데이터 추가
    const participant = {
        id: Date.now(),
        deviceId: deviceId,
        timestamp: new Date().toISOString(),
        eventName: '모바일테스트',
        anonymousId: 'USER_' + deviceId.substring(-4)
    };
    
    let participants = JSON.parse(localStorage.getItem('participants')) || [];
    participants.push(participant);
    localStorage.setItem('participants', JSON.stringify(participants));
    
    alert(`✅ 참여 테스트 완료!\\n고유 ID: ${participant.anonymousId}`);
    
    // 진동 피드백
    if (navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
    }
}

function testQuiz() {
    // 퀴즈 페이지로 이동
    window.location.href = 'quiz.html?event=모바일테스트';
}

// 화면 회전 감지
window.addEventListener('orientationchange', function() {
    setTimeout(() => {
        collectDeviceInfo();
        checkCompatibility();
    }, 100);
});

// 화면 크기 변경 감지
window.addEventListener('resize', function() {
    setTimeout(() => {
        collectDeviceInfo();
        checkCompatibility();
    }, 100);
});