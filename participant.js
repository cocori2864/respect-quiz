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
    return /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(navigator.userAgent);
}

function generateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        const navigatorInfo = window.navigator;
        const screenInfo = window.screen;
        let-fingerprint = navigatorInfo.userAgent +
            '|' + navigatorInfo.language +
            '|' + screenInfo.colorDepth +
            '|' + screenInfo.width + 'x' + screenInfo.height +
            '|' + new Date().getTimezoneOffset();

        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        deviceId = 'dev-' + Math.abs(hash).toString(16);
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

function autoRegisterParticipant() {
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    
    let participants = JSON.parse(localStorage.getItem('participants')) || [];
    const existingParticipant = participants.find(p => p.deviceId === deviceId);
    
    if (existingParticipant) {
        console.log('기존 참여자 감지:', existingParticipant.anonymousId);
        document.getElementById('autoRegister').style.display = 'none';
        document.getElementById('alreadyJoined').style.display = 'block';
    } else {
        const participant = {
            deviceId: deviceId,
            timestamp: new Date().toISOString(),
            eventName: eventName,
            anonymousId: 'USER_' + deviceId.substring(4, 12),
            isMobile: isMobileDevice(),
            accessSource: getAccessSource()
        };
        
        participants.push(participant);
        localStorage.setItem('participants', JSON.stringify(participants));
        console.log("✅ localStorage에 참여자 등록 완료:", participant.anonymousId);
        
        document.getElementById('autoRegister').style.display = 'none';
        document.getElementById('welcomeMessage').style.display = 'block';
    }
}

function goToQuiz() {
    const eventName = getEventNameFromUrl();
    window.location.href = 'quiz.html?event=' + encodeURIComponent(eventName);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const eventName = getEventNameFromUrl();
    document.getElementById('eventTitle').textContent = eventName + ' 참여';
    document.title = eventName + ' 참여';
    
    autoRegisterParticipant();
});