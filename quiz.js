/**
 * 퀴즈 진행 페이지 스크립트
 */

const quizQuestions = [
    { question: "동료의 업무 실수를 발견했을 때 가장 바람직한 행동은?", options: ["즉시 상사에게 보고한다", "동료에게 개인적으로 알려주고 함께 해결책을 찾는다", "모르는 척 넘어간다"], correct: 1 },
    { question: "의견 충돌이 있을 때, 가장 먼저 해야 할 일은?", options: ["내 주장을 강하게 설득한다", "상대방의 의견을 끝까지 경청한다", "제3자의 의견을 따른다"], correct: 1 },
    { question: "환자 또는 보호자의 불만 제기에 대한 올바른 응대는?", options: ["규정을 먼저 설명한다", "불만 내용에 대해 공감과 이해를 표한다", "담당 책임자에게 바로 넘긴다"], correct: 1 },
    { question: "팀워크 향상을 위해 가장 중요한 요소는?", options: ["명확한 역할 분담", "개인의 역량 강화", "상호 존중과 신뢰 기반의 소통"], correct: 2 },
    { question: "여러 부서와 협업할 때 가장 경계해야 할 태도는?", options: ["우리 부서의 이익만 앞세우는 태도", "전체적인 목표를 공유하는 태도", "적극적으로 의견을 제안하는 태도"], correct: 0 }
];

let currentQuestionIndex = 0;
let score = 0;
let eventName = '소통 감수성 퀴즈';

/**
 * URL에서 행사 이름을 가져오는 함수
 */
function getEventNameFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('event') || '소통 감수성 퀴즈';
}

/**
 * 퀴즈 시작 함수
 */
function startQuiz() {
    // 이미 쿠폰을 사용했는지 확인
    if (localStorage.getItem('couponUsed') === 'true') {
        alert('이미 퀴즈를 완료하고 쿠폰을 사용하셨습니다. 추가 참여는 불가능합니다.');
        return;
    }
    document.getElementById('quizStart').style.display = 'none';
    document.getElementById('quizProgress').style.display = 'block';
    currentQuestionIndex = 0;
    score = 0;
    displayQuestion();
}

/**
 * 질문을 화면에 표시하는 함수
 */
function displayQuestion() {
    const question = quizQuestions[currentQuestionIndex];
    document.getElementById('currentQuestion').textContent = currentQuestionIndex + 1;
    document.getElementById('progressFill').style.width = `${((currentQuestionIndex + 1) / quizQuestions.length) * 100}%`;
    document.getElementById('questionText').textContent = question.question;

    const answerOptions = document.getElementById('answerOptions');
    answerOptions.innerHTML = '';
    question.options.forEach((option, index) => {
        answerOptions.innerHTML += `
            <div class="answer-option">
                <input type="radio" id="option${index}" name="answer" value="${index}">
                <label for="option${index}">${option}</label>
            </div>
        `;
    });

    // 라디오 버튼 선택 시 다음 버튼 활성화
    document.querySelectorAll('input[name="answer"]').forEach(radio => {
        radio.addEventListener('change', () => {
            document.getElementById('nextBtn').disabled = false;
        });
    });

    document.getElementById('nextBtn').disabled = true;
}

/**
 * 다음 문제로 넘어가는 함수
 */
function nextQuestion() {
    const selectedAnswer = document.querySelector('input[name="answer"]:checked');
    if (!selectedAnswer) return;

    if (parseInt(selectedAnswer.value) === quizQuestions[currentQuestionIndex].correct) {
        score += 20; // 문제당 20점
    }

    currentQuestionIndex++;
    if (currentQuestionIndex < quizQuestions.length) {
        displayQuestion();
    } else {
        showResult();
    }
}

/**
 * 퀴즈 결과를 보여주는 함수
 */
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

/**
 * 퀴즈 재시도 함수
 */
function retryQuiz() {
    document.getElementById('quizResult').style.display = 'none';
    startQuiz();
}

/**
 * 쿠폰 발급 페이지로 이동하는 함수
 */
function getCoupon() {
    // 쿠폰 발급 받았다는 사실을 localStorage에 기록
    localStorage.setItem('couponIssued', 'true');
    window.location.href = `coupon.html?event=${encodeURIComponent(eventName)}&score=${score}`;
}

// --- 페이지 로드 시 실행 ---
document.addEventListener('DOMContentLoaded', () => {
    eventName = getEventNameFromUrl();
    document.getElementById('quizTitle').textContent = eventName;
});