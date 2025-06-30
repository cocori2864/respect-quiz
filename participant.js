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
    
    // 환영 메시지 표시
    const welcomeMessage = document.getElementById('welcomeMessage');
    document.getElementById('registrationTime').textContent = 
        new Date(participant.timestamp).toLocaleString('ko-KR');
    document.getElementById('anonymousId').textContent = participant.anonymousId;
    
    welcomeMessage.style.display = 'block';
}

function goToQuiz() {
    const eventName = getEventNameFromUrl();
    window.location.href = 'quiz.html?event=' + encodeURIComponent(eventName);
}

function showAlreadyJoinedMessage(participant) {
    // 로딩 화면 숨기기
    document.getElementById('autoRegister').style.display = 'none';
    
    // 이미 참여 메시지 표시
    const alreadyJoinedMessage = document.getElementById('alreadyJoined');
    document.getElementById('firstJoinTime').textContent = 
        new Date(participant.timestamp).toLocaleString('ko-KR');
    
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