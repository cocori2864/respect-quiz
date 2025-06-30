# 🏥 서울아산병원 소통 감수성 퀴즈

익명 참여 기반의 의료진 소통 감수성 측정 및 교육 도구

## 🎯 주요 기능

- **익명 참여**: 디바이스 고유ID 기반 익명 참여
- **실시간 모니터링**: 관리자용 참여 현황 대시보드
- **모바일 최적화**: 터치 친화적 반응형 디자인
- **보안 강화**: 중복 참여 및 부정 사용 방지
- **QR 코드**: 간편한 모바일 접속

## 📱 사용 방법

### 관리자
1. `admin.html` 접속
2. 행사명 입력 후 QR 코드 생성
3. 참여 현황 실시간 모니터링

### 참여자
1. QR 코드 스캔 또는 URL 직접 접속
2. 자동 익명 등록 (2초)
3. 소통 감수성 퀴즈 참여 (5문제)
4. 60점 이상 시 쿠폰 자동 발급

## 🗂️ 파일 구조

```
respect/
├── index.html          # 메인 랜딩 페이지
├── admin.html          # 관리자 대시보드
├── participant.html    # 참여자 등록 페이지
├── quiz.html          # 퀴즈 진행 페이지
├── coupon.html        # 쿠폰 표시/사용 페이지
├── help.html          # 사용자 도움말
├── admin.js           # 관리자 기능 로직
├── participant.js     # 참여자 등록 로직
├── quiz.js           # 퀴즈 진행 로직
├── coupon.js         # 쿠폰 관리 로직
├── styles.css        # 통합 스타일시트
└── read.md           # 프로젝트 상세 설명
```

## 🚀 배포 방법

### GitHub Pages (권장)
1. GitHub 저장소 생성
2. 모든 파일 업로드
3. Settings → Pages → Source: main branch
4. 약 5분 후 `https://username.github.io/repository/` 접속


## 🎨 기술 스택

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Storage**: localStorage (클라이언트 사이드)
- **Design**: 서울아산병원 브랜드 컬러
- **Font**: Noto Sans KR

## 🔒 보안 기능

- 디바이스 고유 식별을 통한 중복 참여 방지
- 쿠폰 사용 후 재참여 차단 (히스토리 조작 방지)
- 익명성 보장 (개인정보 수집 없음)

## 📊 퀴즈 내용

서울아산병원 직원 간 존중과 소통에 관한 5개 문제:
1. 동료 실수 대응 방법
2. 회의 중 토론 자세
3. 환자 불만 대응
4. 팀워크 향상 방법
5. 부서간 협업 갈등 해결

## 🛠️ 개발 정보

- **개발자**: Claude AI Assistant
- **문의**: cocori2864@gmail.com
- **저장소**: respect-quiz
- **라이선스**: MIT

---

💡 **Tip**: 로컬에서 테스트 시 `python -m http.server` 또는 Live Server 사용 권장