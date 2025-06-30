/**
 * 참여자 등록 JavaScript
 * 기능: 디바이스 고유ID 생성, 익명 참여 등록, 중복 참여 방지
 */
function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || localStorage.getItem('eventName') || '행사';
}

function getAccessSource() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('source') || 'direct';
}

function isMobileDevice() {
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function generateDeviceId() {
    // 기존 저장된 디바이스 ID가 있는지 확인
    const storedId = localStorage.getItem('deviceId');
    if (storedId) {
        console.log('기존 디바이스 ID 사용:', storedId);
        return storedId;
    }
    
    // 브라우저 고유 정보로 디바이스 ID 생성 (강화된 버전)
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Seoul Asan Medical Center Device ID', 2, 2);
    
    const deviceInfo = [
        navigator.userAgent,
        navigator.language,
        navigator.languages ? navigator.languages.join(',') : '',
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.platform,
        navigator.cookieEnabled,
        typeof navigator.doNotTrack !== 'undefined' ? navigator.doNotTrack : '',
        canvas.toDataURL()
    ].join('|');
    
    // 향상된 해시 생성
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
        const char = deviceInfo.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트 정수로 변환
    }
    
    // 추가 랜덤성 (첫 방문시에만)
    const randomSalt = Math.random().toString(36).substring(2, 8);
    hash = hash + randomSalt.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    const deviceId = Math.abs(hash).toString(36).toUpperCase();
    
    // 디바이스 ID를 localStorage에 영구 저장
    localStorage.setItem('deviceId', deviceId);
    console.log('새 디바이스 ID 생성 및 저장:', deviceId);
    
    return deviceId;
}

function autoRegisterParticipant() {
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    
    // 기존 참여자 목록 가져오기
    let participants = JSON.parse(localStorage.getItem('participants')) || [];
    
    // 중복 참여 체크 (디바이스 ID 기준)
    const existingParticipant = participants.find(p => p.deviceId === deviceId);
    
    if (existingParticipant) {
        // 이미 참여한 디바이스
        showAlreadyJoinedMessage(existingParticipant);
    } else {
        // 새로운 참여자 자동 등록
        const participant = {
            id: Date.now(),
            deviceId: deviceId,
            timestamp: new Date().toISOString(),
            eventName: eventName,
            anonymousId: 'USER_' + deviceId.substring(0, 8),
            isMobile: isMobileDevice(),
            accessSource: getAccessSource(),
            userAgent: navigator.userAgent,
            screenSize: screen.width + 'x' + screen.height
        };
        
        participants.push(participant);
        
        // 확실한 저장을 위해 여러 번 시도
        try {
            localStorage.setItem('participants', JSON.stringify(participants));
            console.log('참여자 등록 완료:', participant.anonymousId, '총', participants.length, '명');
            console.log('모바일 접속:', participant.isMobile, '접속 경로:', participant.accessSource);
            
            // 모바일 QR 접속 특별 로깅
            if (participant.isMobile && participant.accessSource === 'qr') {
                console.log('📱 QR 모바일 접속 감지:', participant.anonymousId);
            }
            
            // 저장 확인
            const savedData = localStorage.getItem('participants');
            const parsedData = JSON.parse(savedData);
            console.log('저장 확인:', parsedData.length, '명');
        } catch (error) {
            console.error('참여자 저장 실패:', error);
        }
        
        // 등록 완료 메시지 표시
        showWelcomeMessage(participant);
    }
}

function showWelcomeMessage(participant) {
    // 로딩 화면 숨기기
    document.getElementById('autoRegister').style.display = 'none';
    
    // 쿠폰 사용 여부 확인
    const hasUsedCoupon = checkIfCouponUsed(participant.deviceId);
    
    // 환영 메시지 표시
    const welcomeMessage = document.getElementById('welcomeMessage');
    document.getElementById('registrationTime').textContent = 
        new Date(participant.timestamp).toLocaleString('ko-KR');
    document.getElementById('anonymousId').textContent = participant.anonymousId;
    
    // 쿠폰 사용 여부에 따라 퀴즈 버튼 처리
    const quizButton = welcomeMessage.querySelector('.quiz-btn');
    if (hasUsedCoupon) {
        quizButton.disabled = true;
        quizButton.textContent = '🔒 퀴즈 완료 (쿠폰 사용됨)';
        quizButton.style.background = '#a0aec0';
        quizButton.style.cursor = 'not-allowed';
        
        // 완료 메시지 추가
        const completedMessage = document.createElement('p');
        completedMessage.style.color = '#718096';
        completedMessage.style.fontSize = '14px';
        completedMessage.style.marginTop = '10px';
        completedMessage.textContent = '이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.';
        welcomeMessage.appendChild(completedMessage);
    }
    
    welcomeMessage.style.display = 'block';
}

function checkIfCouponUsed(deviceId) {
    // 해당 디바이스로 발급된 쿠폰 중 사용된 것이 있는지 확인
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const deviceCoupons = coupons.filter(c => c.deviceId === deviceId);
    
    // 사용된 쿠폰이 하나라도 있으면 true
    return deviceCoupons.some(c => c.used === true);
}

function goToQuiz() {
    // 쿠폰 사용 여부 확인
    const deviceId = generateDeviceId();
    const hasUsedCoupon = checkIfCouponUsed(deviceId);
    
    if (hasUsedCoupon) {
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.\n추가 참여는 불가능합니다.');
        return;
    }
    
    const eventName = getEventNameFromUrl();
    window.location.href = 'quiz.html?event=' + encodeURIComponent(eventName);
}

function showAlreadyJoinedMessage(participant) {
    // 로딩 화면 숨기기
    document.getElementById('autoRegister').style.display = 'none';
    
    // 쿠폰 사용 여부 확인
    const hasUsedCoupon = checkIfCouponUsed(participant.deviceId);
    
    // 이미 참여 메시지 표시
    const alreadyJoinedMessage = document.getElementById('alreadyJoined');
    document.getElementById('firstJoinTime').textContent = 
        new Date(participant.timestamp).toLocaleString('ko-KR');
    
    // 쿠폰 사용 여부에 따라 퀴즈 버튼 처리
    const quizButton = alreadyJoinedMessage.querySelector('.quiz-btn');
    if (hasUsedCoupon) {
        quizButton.disabled = true;
        quizButton.textContent = '🔒 퀴즈 완료 (쿠폰 사용됨)';
        quizButton.style.background = '#a0aec0';
        quizButton.style.cursor = 'not-allowed';
        
        // 완료 메시지 추가
        const completedMessage = document.createElement('p');
        completedMessage.style.color = '#718096';
        completedMessage.style.fontSize = '14px';
        completedMessage.style.marginTop = '10px';
        completedMessage.textContent = '이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.';
        alreadyJoinedMessage.appendChild(completedMessage);
    }
    
    alreadyJoinedMessage.style.display = 'block';
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const eventName = getEventNameFromUrl();
    document.getElementById('eventTitle').textContent = eventName + ' 참여';
    document.title = eventName + ' 참여';
    
    // 즉시 자동 등록 (로딩 화면 건너뛰기)
    autoRegisterParticipant();
});