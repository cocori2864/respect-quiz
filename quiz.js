// 퀴즈 JavaScript
const quizQuestions = [
    {
        question: "대한민국의 수도는 어디인가요?",
        options: ["서울", "부산", "대구", "인천"],
        correct: 0
    },
    {
        question: "1년은 몇 개월인가요?",
        options: ["10개월", "11개월", "12개월", "13개월"],
        correct: 2
    },
    {
        question: "태양계에서 가장 큰 행성은?",
        options: ["지구", "화성", "목성", "토성"],
        correct: 2
    },
    {
        question: "무지개의 색깔은 몇 가지인가요?",
        options: ["5가지", "6가지", "7가지", "8가지"],
        correct: 2
    },
    {
        question: "컴퓨터에서 CPU의 역할은?",
        options: ["저장", "연산 처리", "화면 출력", "소리 출력"],
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

function getCoupon() {
    // 디바이스 ID 생성 (participant.js와 동일한 방식)
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    
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
    // participant.js와 동일한 방식
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
    
    let hash = 0;
    for (let i = 0; i < deviceInfo.length; i++) {
        const char = deviceInfo.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    
    return Math.abs(hash).toString(36).toUpperCase();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    const eventName = getEventNameFromUrl();
    document.getElementById('quizTitle').textContent = eventName + ' 퀴즈';
    document.title = eventName + ' 퀴즈';
});