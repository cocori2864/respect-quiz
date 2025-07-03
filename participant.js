/**
 * 퀴즈 참여자 등록 페이지 스크립트 (Firebase 기반)
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
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
} catch (e) {
    console.error("Firebase 초기화 중 오류 발생:", e);
}

/**
 * URL에서 행사 이름을 가져오는 함수
 * @returns {string} 행사 이름
 */
function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || '소통 감수성 퀴즈';
}

/**
 * 브라우저 정보를 조합하여 고유한 기기 ID를 생성하는 함수
 * @returns {string} 기기 ID
 */
function generateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        const navigatorInfo = window.navigator;
        const screenInfo = window.screen;
        const fingerprint = `${navigatorInfo.userAgent}|${navigatorInfo.language}|${screenInfo.colorDepth}|${screenInfo.width}x${screenInfo.height}|${new Date().getTimezoneOffset()}`;
        
        // 간단한 해시 함수
        let hash = 0;
        for (let i = 0; i < fingerprint.length; i++) {
            const char = fingerprint.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // 32비트 정수로 변환
        }
        deviceId = `dev-${Math.abs(hash).toString(16)}`;
        localStorage.setItem('deviceId', deviceId);
    }
    return deviceId;
}

/**
 * 참여자를 등록하고 퀴즈 페이지로 이동하는 메인 함수
 */
async function registerAndProceed() {
    if (!db) {
        document.getElementById('errorMessage').textContent = "오류: 데이터베이스에 연결할 수 없습니다.";
        return;
    }

    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    const participantRef = db.collection('participants').doc(deviceId);

    try {
        const doc = await participantRef.get();

        if (doc.exists) {
            // 이미 등록된 사용자
            console.log('기존 참여자입니다. 바로 퀴즈로 이동합니다.');
        } else {
            // 새로운 사용자 등록
            const newParticipant = {
                deviceId: deviceId,
                eventName: eventName,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent
            };
            await participantRef.set(newParticipant);
            console.log('새로운 참여자로 등록되었습니다.');
        }

        // 성공적으로 처리 후 퀴즈 페이지로 이동
        goToQuiz(eventName);

    } catch (error) {
        console.error("참여자 등록 중 오류 발생:", error);
        document.getElementById('errorMessage').textContent = "참여 등록 중 오류가 발생했습니다. 인터넷 연결을 확인하고 새로고침해주세요.";
    }
}

/**
 * 퀴즈 페이지로 이동하는 함수
 * @param {string} eventName - 현재 행사 이름
 */
function goToQuiz(eventName) {
    // 0.5초 후 이동하여 저장할 시간을 확보
    setTimeout(() => {
        window.location.href = `quiz.html?event=${encodeURIComponent(eventName)}`;
    }, 500);
}

// --- 페이지 로드 시 실행 ---
document.addEventListener('DOMContentLoaded', () => {
    const eventName = getEventNameFromUrl();
    document.getElementById('eventTitle').textContent = `"${eventName}" 참여`;
    registerAndProceed();
});