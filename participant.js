/**
 * 참여자 등록 JavaScript
 * 기능: 디바이스 고유ID 생성, 익명 참여 등록, 중복 참여 방지
 */
// Firebase 설정 (respect-quiz 프로젝트의 정보로 교체)
const firebaseConfig = {
    apiKey: "AIzaSyBM2gx4IIBUJnfnKMgCrT6gEU1rHsxSvpw",
    authDomain: "respect-quiz.firebaseapp.com",
    projectId: "respect-quiz",
    storageBucket: "respect-quiz.firebasestorage.app",
    messagingSenderId: "919599211664",
    appId: "1:919599211664:web:fcc5deb2dd35beeb5de415"
  };

// Firebase 초기화 (임시 비활성화)
let db = null;
let firebaseEnabled = false;

// Firebase 400 오류로 인해 임시 비활성화
console.log("🔥 Firebase 임시 비활성화 - localStorage 전용 모드");

// 나중에 Firebase 활성화하려면 아래 주석 해제
/*
try {
    firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
    firebaseEnabled = true;
    console.log("🔥 Firebase 초기화 성공");
} catch (error) {
    console.warn("🔥 Firebase 초기화 실패:", error);
    firebaseEnabled = false;
}
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
    // 더 정확한 모바일 감지
    const mobileUA = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|webOS|Windows Phone/i.test(navigator.userAgent);
    const touchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const smallScreen = window.screen && (window.screen.width <= 768 || window.screen.height <= 768);
    
    const isMobile = mobileUA || (touchDevice && smallScreen);
    
    // 상세 로깅
    console.log('📱 모바일 감지 상세:', {
        userAgent: navigator.userAgent,
        mobileUA: mobileUA,
        touchDevice: touchDevice,
        screenSize: window.screen ? `${window.screen.width}x${window.screen.height}` : 'unknown',
        smallScreen: smallScreen,
        finalResult: isMobile
    });
    
    return isMobile;
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
    
    // localStorage에서 중복 참여 체크
    const participants = JSON.parse(localStorage.getItem('participants')) || [];
    const existingParticipant = participants.find(p => p.deviceId === deviceId);
    
    if (existingParticipant) {
        // 이미 참여한 디바이스 - 바로 퀴즈로 이동
        console.log('기존 참여자 감지:', existingParticipant.anonymousId);
        goToQuizDirectly();
    } else {
        // 새로운 참여자 localStorage에 등록
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
        localStorage.setItem('participants', JSON.stringify(participants));
        console.log("✅ localStorage에 참여자 등록 완료:", participant.anonymousId);
        
        // Firebase에도 저장 시도 (완전히 비동기로, 실패해도 진행)
        if (firebaseEnabled && db) {
            setTimeout(() => {
                try {
                    console.log("🔥 Firebase에 참여자 데이터 전송 시도...");
                    db.collection("participants").add(participant)
                        .then((docRef) => {
                            console.log("✅ Firebase에 참여자 저장 완료:", docRef.id);
                        })
                        .catch((error) => {
                            console.warn("⚠️ Firebase 저장 실패 (localStorage는 성공):", error.message);
                            // Firebase 오류 시 완전히 비활성화
                            firebaseEnabled = false;
                        });
                } catch (e) {
                    console.warn("⚠️ Firebase 오류:", e.message);
                    firebaseEnabled = false;
                }
            }, 100); // 0.1초 지연 후 Firebase 전송
        } else {
            console.log("📱 localStorage만 사용 (Firebase 비활성화)");
        }
        
        goToQuizDirectly();
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

function goToQuizDirectly() {
    // 로딩 화면 숨기기
    document.getElementById('autoRegister').style.display = 'none';
    
    // 쿠폰 사용 여부 확인
    const deviceId = generateDeviceId();
    const hasUsedCoupon = checkIfCouponUsed(deviceId);
    
    if (hasUsedCoupon) {
        // 쿠폰 사용자는 완료 메시지 표시
        document.body.innerHTML = `
            <div class="container">
                <div style="text-align: center; padding: 40px 20px;">
                    <h1>🎉 퀴즈 완료!</h1>
                    <p style="font-size: 18px; margin: 20px 0;">이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.</p>
                    <p style="color: #666;">추가 참여는 불가능합니다.</p>
                </div>
            </div>
        `;
        return;
    }
    
    console.log('🚀 바로 퀴즈로 이동');
    const eventName = getEventNameFromUrl();
    
    // 충분한 지연 후 퀴즈로 이동 (localStorage 저장 및 이벤트 전송 완료 대기)
    setTimeout(() => {
        // 이동 전 최종 확인
        const finalCheck = localStorage.getItem('participants');
        if (finalCheck) {
            const parsed = JSON.parse(finalCheck);
            console.log('📊 이동 전 최종 참여자 수:', parsed.length);
        }
        
        window.location.href = 'quiz.html?event=' + encodeURIComponent(eventName);
    }, 1500); // 1.5초로 증가
    
    // 추가 보장: 페이지를 즉시 떠나지 못하도록 하는 동안 추가 이벤트 발생
    setTimeout(() => {
        try {
            localStorage.setItem('finalSync', Date.now().toString());
            localStorage.removeItem('finalSync');
            console.log('💾 최종 동기화 시그널 전송');
        } catch (e) {
            console.log('최종 동기화 실패:', e.message);
        }
    }, 800);
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