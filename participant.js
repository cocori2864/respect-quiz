// 익명 참여자 페이지 JavaScript
function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || localStorage.getItem('eventName') || '행사';
}

function generateDeviceId() {
    // 브라우저 고유 정보로 디바이스 ID 생성
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const deviceInfo = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        new Date().getTimezoneOffset(),
        canvas.toDataURL()
    ].join('|');
    
    // 간단한 해시 생성
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
        const char = deviceInfo.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // 32비트 정수로 변환
    }
    
    return Math.abs(hash).toString(36).toUpperCase();
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
            anonymousId: 'USER_' + deviceId.substring(0, 8)
        };
        
        participants.push(participant);
        localStorage.setItem('participants', JSON.stringify(participants));
        
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
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.\\n추가 참여는 불가능합니다.');
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
    
    // 2초 후 자동 등록 (로딩 효과)
    setTimeout(() => {
        autoRegisterParticipant();
    }, 2000);
});