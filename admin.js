/**
 * 관리자 대시보드 JavaScript
 * 기능: QR 코드 생성, Firebase 실시간 참여자 통계 모니터링
 */

// Firebase 설정
const firebaseConfig = {
    apiKey: "AIzaSyBM2gx4IIBUJnfnKMgCrT6gEU1rHsxSvpw",
    authDomain: "respect-quiz.firebaseapp.com",
    projectId: "respect-quiz",
    storageBucket: "respect-quiz.appspot.com",
    messagingSenderId: "919599211664",
    appId: "1:919599211664:web:fcc5deb2dd35beeb5de415"
};

// Firebase 초기화
try {
    firebase.initializeApp(firebaseConfig);
} catch (e) {
    console.error("Firebase 초기화 오류:", e.message);
}

const db = firebase.firestore();

function generateQR() {
    const eventName = document.getElementById('eventName').value || '서울아산병원 소통 감수성 퀴즈';
    localStorage.setItem('eventName', eventName); // 참여자 페이지에서 행사 이름을 알 수 있도록 저장
    
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
    const participantUrl = `${baseUrl}participant.html?event=${encodeURIComponent(eventName)}`;
    
    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = '';
    new QRCode(qrCodeContainer, {
        text: participantUrl,
        width: 256,
        height: 256
    });
    
    document.getElementById('participantUrl').innerHTML = `<strong>참여자 접속 URL:</strong><br><a href="${participantUrl}" target="_blank">${participantUrl}</a>`;
}

function listenToParticipants() {
    const firebaseStatus = document.getElementById('firebaseStatus');
    
    db.collection("participants").onSnapshot((querySnapshot) => {
        firebaseStatus.textContent = '🟢 Firebase 실시간 연결됨';
        firebaseStatus.style.color = 'green';
        
        const participants = [];
        querySnapshot.forEach((doc) => {
            participants.push(doc.data());
        });
        
        updateStats(participants);

    }, (error) => {
        firebaseStatus.textContent = '🔴 Firebase 연결 실패';
        firebaseStatus.style.color = 'red';
        console.error("Firebase 데이터 수신 오류: ", error);
    });
}

function updateStats(participants) {
    const totalParticipants = participants.length;
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    
    const recentParticipants = participants.filter(p => {
        return new Date(p.timestamp).getTime() > fiveMinutesAgo;
    }).length;

    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('recentParticipants').textContent = recentParticipants;
}

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const savedEventName = localStorage.getItem('eventName');
    if (savedEventName) {
        document.getElementById('eventName').value = savedEventName;
    }
    generateQR();
    listenToParticipants();
});