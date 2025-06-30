/**
 * 소통 감수성 퀴즈 JavaScript
 * 기능: 서울아산병원 직원 존중 관련 퀴즈, 점수 계산, 쿠폰 발급
 */
const quizQuestions = [
    {
        question: "동료가 업무상 실수를 했을 때, 가장 적절한 소통 방법은?",
        options: [
            "실수를 지적하며 앞으로 조심하라고 말한다", 
            "실수의 원인을 함께 파악하고 개선 방안을 제안한다", 
            "실수를 못 본 척하고 넘어간다", 
            "다른 동료들에게 그 실수에 대해 이야기한다"
        ],
        correct: 1
    },
    {
        question: "회의 중 의견이 다른 동료와 토론할 때 올바른 태도는?",
        options: [
            "내 의견이 맞다고 강하게 주장한다", 
            "상대방의 의견을 먼저 충분히 듣고 이해한 후 내 의견을 전달한다", 
            "의견 차이가 생기면 말을 하지 않는다", 
            "상급자의 의견에 무조건 동조한다"
        ],
        correct: 1
    },
    {
        question: "환자나 보호자가 불만을 제기할 때 가장 우선해야 할 것은?",
        options: [
            "병원 규정을 설명하며 이해시킨다", 
            "상대방의 감정을 공감하고 경청한 후 해결책을 찾는다", 
            "다른 직원에게 처리를 맡긴다", 
            "빨리 상황을 마무리하려고 한다"
        ],
        correct: 1
    },
    {
        question: "팀워크 향상을 위해 가장 중요한 소통 자세는?",
        options: [
            "내 업무만 완벽하게 처리하면 된다", 
            "동료들의 상황을 이해하고 필요시 도움을 주고받는다", 
            "상급자와만 소통하면 충분하다", 
            "개인적인 관계는 업무와 분리해야 한다"
        ],
        correct: 1
    },
    {
        question: "다양한 부서 간 협업 시 갈등 상황에서 올바른 대처 방법은?",
        options: [
            "우리 부서의 입장만 고집한다", 
            "상호 이해와 존중을 바탕으로 WIN-WIN 해결책을 모색한다", 
            "갈등을 피하고 최대한 관여하지 않는다", 
            "상급자에게만 의존하여 해결한다"
        ],
        correct: 1
    }
];

let currentQuestionIndex = 0;
let userAnswers = [];
let score = 0;

function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || '행사';
}

function startQuiz() {
    // 쿠폰 사용 여부 확인
    const deviceId = generateDeviceId();
    const hasUsedCoupon = checkIfCouponUsed(deviceId);
    
    if (hasUsedCoupon) {
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.\\n추가 참여는 불가능합니다.');
        // 참여자 페이지로 돌아가기
        const eventName = getEventNameFromUrl();
        window.location.href = 'participant.html?event=' + encodeURIComponent(eventName);
        return;
    }
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizProgress').style.display = 'block';
    
    // 퀴즈 초기화
    currentQuestionIndex = 0;
    userAnswers = [];
    score = 0;
    
    displayQuestion();
}

function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    // 진행 상황 업데이트
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = quizQuestions.length;
    
    const progress = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
    
    // 질문 표시
    document.getElementById('questionText').textContent = question.question;
    
    // 답안 선택지 생성
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'answer-option';
        optionDiv.innerHTML = `
            <input type="radio" id="option${index}" name="answer" value="${index}" onchange="selectAnswer()">
            <label for="option${index}">${option}</label>
        `;
        answerOptions.appendChild(optionDiv);
    });
    
    // 다음 버튼 비활성화
    document.getElementById('nextBtn').disabled = true;
}

function selectAnswer() {
    document.getElementById('nextBtn').disabled = false;
}

function nextQuestion() {
    // 선택된 답안 저장
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        const answerIndex = parseInt(selectedAnswer.value);
        userAnswers.push(answerIndex);
        
        // 정답 체크
        if (answerIndex === quizQuestions[currentQuestionIndex].correct) {
            score += 20; // 문제당 20점
        }
    }
    
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

function showResult() {
    document.getElementById('quizProgress').style.display = 'none';
    document.getElementById('quizResult').style.display = 'block';
    
    document.getElementById('finalScore').textContent = score;
    
    if (score >= 60) {
        document.getElementById('passResult').style.display = 'block';
        document.getElementById('failResult').style.display = 'none';
    } else {
        document.getElementById('passResult').style.display = 'none';
        document.getElementById('failResult').style.display = 'block';
    }
}

function retryQuiz() {
    document.getElementById('quizResult').style.display = 'none';
    document.getElementById('quizStart').style.display = 'block';
}

function checkIfCouponUsed(deviceId) {
    // 해당 디바이스로 발급된 쿠폰 중 사용된 것이 있는지 확인
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const deviceCoupons = coupons.filter(c => c.deviceId === deviceId);
    
    // 사용된 쿠폰이 하나라도 있으면 true
    return deviceCoupons.some(c => c.used === true);
}

function getCoupon() {
    // 디바이스 ID 생성 (participant.js와 동일한 방식)
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    
    // 쿠폰 사용 여부 재확인 (혹시 모를 동시성 문제 방지)
    const hasUsedCoupon = checkIfCouponUsed(deviceId);
    if (hasUsedCoupon) {
        alert('이미 쿠폰을 사용하셨습니다.\\n추가 쿠폰 발급은 불가능합니다.');
        window.location.href = 'participant.html?event=' + encodeURIComponent(eventName);
        return;
    }
    
    // 쿠폰 정보 생성
    const coupon = {
        id: Date.now(),
        deviceId: deviceId,
        score: score,
        timestamp: new Date().toISOString(),
        eventName: eventName,
        couponCode: 'COUPON_' + deviceId.substring(0, 8) + '_' + Date.now().toString().substring(-4),
        used: false
    };
    
    // 쿠폰 저장
    let coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    coupons.push(coupon);
    localStorage.setItem('coupons', JSON.stringify(coupons));
    
    // 쿠폰 페이지로 이동
    window.location.href = `coupon.html?code=${coupon.couponCode}&event=${encodeURIComponent(eventName)}`;
}

function generateDeviceId() {
    // 기존 저장된 디바이스 ID가 있는지 확인 (participant.js와 동일)
    const storedId = localStorage.getItem('deviceId');
    if (storedId) {
        console.log('퀴즈: 기존 디바이스 ID 사용:', storedId);
        return storedId;
    }
    
    // 브라우저 고유 정보로 디바이스 ID 생성 (participant.js와 동일)
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
        hash = hash & hash;
    }
    
    // 추가 랜덤성 (첫 방문시에만)
    const randomSalt = Math.random().toString(36).substring(2, 8);
    hash = hash + randomSalt.split('').reduce((a, b) => a + b.charCodeAt(0), 0);
    
    const deviceId = Math.abs(hash).toString(36).toUpperCase();
    
    // 디바이스 ID를 localStorage에 영구 저장
    localStorage.setItem('deviceId', deviceId);
    console.log('퀴즈: 새 디바이스 ID 생성 및 저장:', deviceId);
    
    return deviceId;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const eventName = getEventNameFromUrl();
    document.getElementById('quizTitle').textContent = eventName + ' 퀴즈';
    document.title = eventName + ' 퀴즈';
    
    // 페이지 로드 시 쿠폰 사용 여부 확인
    const deviceId = generateDeviceId();
    const hasUsedCoupon = checkIfCouponUsed(deviceId);
    
    if (hasUsedCoupon) {
        // 쿠폰 사용 후 접근 시 알림 후 참여자 페이지로 리다이렉트
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.\\n추가 참여는 불가능합니다.');
        window.location.href = 'participant.html?event=' + encodeURIComponent(eventName);
        return;
    }
    
    // 뒤로가기 방지 설정
    preventBackAfterCouponUse();
});

// 쿠폰 사용 후 뒤로가기 방지
function preventBackAfterCouponUse() {
    const deviceId = generateDeviceId();
    
    // 주기적으로 쿠폰 사용 상태 확인
    const checkInterval = setInterval(function() {
        const hasUsedCoupon = checkIfCouponUsed(deviceId);
        
        if (hasUsedCoupon) {
            // 쿠폰 사용이 감지되면 뒤로가기 방지 활성화
            setupBackPrevention();
            clearInterval(checkInterval);
        }
    }, 1000);
}

// 뒤로가기 방지 설정
function setupBackPrevention() {
    // 히스토리 조작
    if (window.history && window.history.pushState) {
        window.history.pushState('quizCompleted', null, window.location.href);
        
        window.addEventListener('popstate', function(event) {
            window.history.pushState('quizCompleted', null, window.location.href);
            alert('퀴즈 참여가 완료되어 이전 페이지로 돌아갈 수 없습니다.');
            return false;
        });
    }
    
    // 페이지 떠나기 방지
    window.addEventListener('beforeunload', function(event) {
        const message = '퀴즈 참여가 완료되어 페이지를 떠날 수 없습니다.';
        event.preventDefault();
        event.returnValue = message;
        return message;
    });
}