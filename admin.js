/**
 * 퀴즈 관리자 페이지 스크립트 (Firebase 기반)
 */

// [중요] 이 부분은 나중에 본인의 Firebase 프로젝트 설정으로 교체해주세요.
const firebaseConfig = {
    apiKey: "AIzaSyBM2gx4IIBUJnfnKMgCrT6gEU1rHsxSvpw",
    authDomain: "respect-quiz.firebaseapp.com",
    projectId: "respect-quiz",
    storageBucket: "respect-quiz.appspot.com",
    messagingSenderId: "919599211664",
    appId: "1:919599211664:web:fcc5deb2dd35beeb5de415"
};

// --- Firebase 초기화 ---
let db;
try {
    const app = firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    console.log("Firebase가 성공적으로 초기화되었습니다.");
} catch (e) {
    console.error("Firebase 초기화 중 오류 발생:", e);
    alert("Firebase 초기화에 실패했습니다. 콘솔을 확인해주세요.");
}

/**
 * QR 코드를 생성하는 함수
 */
function generateQR() {
    const eventName = document.getElementById('eventName').value;
    if (!eventName) {
        alert("행사 이름을 입력해주세요.");
        return;
    }
    
    // QR코드는 참여자 페이지로 연결됩니다.
    const baseUrl = window.location.href.substring(0, window.location.href.lastIndexOf('/'));
    const participantUrl = `${baseUrl}/participant.html?event=${encodeURIComponent(eventName)}`;
    
    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = ''; // 이전 QR 코드 삭제
    
    new QRCode(qrCodeContainer, {
        text: participantUrl,
        width: 200,
        height: 200,
    });
    
    document.getElementById('participantUrl').innerHTML = `
        <strong>참여자 접속 주소:</strong><br>
        <a href="${participantUrl}" target="_blank">${participantUrl}</a>
    `;
    
    console.log(`QR 코드가 생성되었습니다: ${participantUrl}`);
}

/**
 * Firebase에서 참여자 데이터를 실시간으로 수신하고 통계를 업데이트하는 함수
 */
function listenToParticipants() {
    if (!db) return;

    const firebaseStatus = document.getElementById('firebaseStatus');

    db.collection("participants").onSnapshot(
        (querySnapshot) => {
            firebaseStatus.textContent = '🟢 Firebase 실시간 연결됨';
            firebaseStatus.style.color = '#28a745';

            const participants = [];
            querySnapshot.forEach((doc) => {
                participants.push(doc.data());
            });

            updateStats(participants);
        },
        (error) => {
            firebaseStatus.textContent = '🔴 Firebase 연결 실패';
            firebaseStatus.style.color = '#dc3545';
            console.error("Firebase 데이터 수신 오류:", error);
            alert("Firebase 데이터 수신에 실패했습니다. 콘솔을 확인하고 보안 규칙을 점검해주세요.");
        }
    );
}

/**
 * 통계 UI를 업데이트하는 함수
 * @param {Array} participants - 참여자 데이터 배열
 */
function updateStats(participants) {
    const totalCount = participants.length;
    
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
    const recentCount = participants.filter(p => new Date(p.timestamp).getTime() > fiveMinutesAgo).length;

    document.getElementById('totalParticipants').textContent = totalCount;
    document.getElementById('recentParticipants').textContent = recentCount;
}

// 페이지가 로드되면 바로 실행
document.addEventListener('DOMContentLoaded', () => {
    // 기본 QR 코드 생성
    generateQR();
    // Firebase 리스너 시작
    listenToParticipants();
});