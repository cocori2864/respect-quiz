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
let score = 0;

function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || '행사';
}

function generateDeviceId() {
    let deviceId = localStorage.getItem('deviceId');
    if (!deviceId) {
        const navigatorInfo = window.navigator;
        const screenInfo = window.screen;
        let fingerprint = navigatorInfo.userAgent +
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

function checkIfCouponUsed() {
    const deviceId = generateDeviceId();
    const coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    return coupons.some(c => c.deviceId === deviceId && c.used);
}

function startQuiz() {
    if (checkIfCouponUsed()) {
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다.');
        return;
    }
    
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizProgress').style.display = 'block';
    
    currentQuestionIndex = 0;
    score = 0;
    
    displayQuestion();
}

function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('totalQuestions').textContent = quizQuestions.length;
    document.getElementById('progressFill').style.width = ((currentQuestionIndex + 1) / quizQuestions.length) * 100 + '%';
    document.getElementById('questionText').textContent = question.question;
    
    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';
    
    question.options.forEach((option, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'answer-option';
        optionDiv.innerHTML = `<label><input type="radio" name="answer" value="${index}"> ${option}</label>`;
        optionDiv.addEventListener('click', () => {
            document.getElementById('nextBtn').disabled = false;
        });
        answerOptions.appendChild(optionDiv);
    });
    
    document.getElementById('nextBtn').disabled = true;
}

function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (selectedAnswer) {
        if (parseInt(selectedAnswer.value) === quizQuestions[currentQuestionIndex].correct) {
            score += 20;
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
    startQuiz();
}

function getCoupon() {
    const deviceId = generateDeviceId();
    const eventName = getEventNameFromUrl();
    
    let coupons = JSON.parse(localStorage.getItem('coupons')) || [];
    const existingCoupon = coupons.find(c => c.deviceId === deviceId);

    if (existingCoupon) {
        window.location.href = `coupon.html?code=${existingCoupon.couponCode}&event=${encodeURIComponent(eventName)}`;
        return;
    }

    const couponCode = 'COUPON-' + deviceId.substring(4, 12) + '-' + Date.now().toString().slice(-4);
    const coupon = {
        couponCode: couponCode,
        deviceId: deviceId,
        score: score,
        timestamp: new Date().toISOString(),
        eventName: eventName,
        used: false
    };
    
    coupons.push(coupon);
    localStorage.setItem('coupons', JSON.stringify(coupons));
    
    window.location.href = `coupon.html?code=${couponCode}&event=${encodeURIComponent(eventName)}`;
}

document.addEventListener('DOMContentLoaded', function() {
    const eventName = getEventNameFromUrl();
    document.getElementById('quizTitle').textContent = eventName + ' 퀴즈';
    document.title = eventName + ' 퀴즈';
});