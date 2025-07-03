/**
 * 참여자 등록 JavaScript
 * 기능: 디바이스 고유ID 생성, Firebase에 익명 참여 등록, 중복 참여 방지
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

function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || localStorage.getItem('eventName') || '서울아산병원 소통 감수성 퀴즈';
}

function generateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        const navigatorInfo = window.navigator;
        const screenInfo = window.screen;
        let fingerprint = navigatorInfo.userAgent + '|' + navigatorInfo.language + '|' + screenInfo.colorDepth + '|' + screenInfo.width + 'x' + screenInfo.height + '|' + new Date().getTimezoneOffset();
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

async function autoRegisterParticipant() {
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();

    // Firebase에서 먼저 중복 참여 확인
    const participantRef = db.collection('participants').doc(deviceId);
    const doc = await participantRef.get();

    if (doc.exists) {
        // 이미 Firebase에 등록된 경우
        console.log('기존 참여자 감지 (Firebase):', deviceId);
        goToQuiz();
    } else {
        // 새로운 참여자
        const participant = {
            deviceId: deviceId,
            timestamp: new Date().toISOString(),
            eventName: eventName,
            anonymousId: 'USER_' + deviceId.substring(4, 12),
            userAgent: navigator.userAgent
        };
        
        // Firebase에 저장
        try {
            await participantRef.set(participant);
            console.log("✅ Firebase에 참여자 등록 완료:", participant.anonymousId);
            // 로컬에도 참여 완료 기록 (백업 및 중복 방지 강화)
            localStorage.setItem('isRegistered', 'true');
            goToQuiz();
        } catch (error) {
            console.error("❌ Firebase 저장 실패:", error);
            // 실패 시 사용자에게 알림 (선택 사항)
            document.getElementById('autoRegister').innerHTML = '<h2>참여 등록 실패</h2><p>오류가 발생했습니다. 관리자에게 문의하세요.</p>';
        }
    }
}

function goToQuiz() {
    const eventName = getEventNameFromUrl();
    // 잠시 후 퀴즈 페이지로 이동 (저장 시간을 고려)
    setTimeout(() => {
        window.location.href = `quiz.html?event=${encodeURIComponent(eventName)}`;
    }, 1000);
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    const eventName = getEventNameFromUrl();
    document.getElementById('eventTitle').textContent = `${eventName} 참여`;
    document.title = `${eventName} 참여`;
    
    // 로컬에 이미 참여 기록이 있으면 바로 퀴즈로 이동 (네트워크 요청 최소화)
    if (localStorage.getItem('isRegistered') === 'true') {
        console.log('기존 참여자 감지 (localStorage)');
        goToQuiz();
    } else {
        autoRegisterParticipant();
    }
});