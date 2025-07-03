/**
 * 관리자 대시보드 JavaScript
 * 기능: QR 코드 생성, 참여자 통계 모니터링
 */

// 전역 변수
let participants = [];
let eventName = '서울아산병원 소통 감수성 퀴즈';

function generateQR() {
    const eventNameInput = document.getElementById('eventName').value;
    if (eventNameInput) {
        eventName = eventNameInput;
        localStorage.setItem('eventName', eventName);
    }
    
    // 현재 페이지의 도메인과 경로를 기반으로 참여자 URL 생성
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
    const participantUrl = baseUrl + 'participant.html?event=' + encodeURIComponent(eventName) + '&source=qr';
    
    // QR 코드 생성
    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = ''; // 기존 QR 코드 삭제
    new QRCode(qrCodeContainer, {
        text: participantUrl,
        width: 256,
        height: 256,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.H
    });
    
    // URL 표시
    document.getElementById('participantUrl').innerHTML = 
        `<strong>참여자 접속 URL:</strong><br><a href="${participantUrl}" target="_blank" style="word-break: break-all;">${participantUrl}</a>`;
}

function updateStats() {
    try {
        const storedData = localStorage.getItem('participants');
        participants = storedData ? JSON.parse(storedData) : [];
        
        const uniqueParticipants = participants.filter((participant, index, self) => 
            index === self.findIndex(p => p.deviceId === participant.deviceId)
        );
        
        const totalParticipants = uniqueParticipants.length;
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentParticipants = uniqueParticipants.filter(p => {
            return new Date(p.timestamp).getTime() > fiveMinutesAgo;
        }).length;
        
        document.getElementById('totalParticipants').textContent = totalParticipants;
        document.getElementById('recentParticipants').textContent = recentParticipants;
        
    } catch (error) {
        console.error('❌ 통계 업데이트 실패:', error);
        document.getElementById('totalParticipants').textContent = '0';
        document.getElementById('recentParticipants').textContent = '0';
    }
}

function forceRefreshStats() {
    updateStats();
    // 시각적 피드백
    const button = document.querySelector('button[onclick="forceRefreshStats()"]');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ 새로고침됨';
        button.style.background = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '#e74c3c';
        }, 2000);
    }
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    eventName = localStorage.getItem('eventName') || '서울아산병원 소통 감수성 퀴즈';
    document.getElementById('eventName').value = eventName;
    generateQR();
    updateStats();
    
    // 5초마다 통계 업데이트
    setInterval(updateStats, 5000);
});

// 다른 탭에서 참여자 등록 시 스토리지 변경 감지
window.addEventListener('storage', function(e) {
    if (e.key === 'participants') {
        updateStats();
    }
});