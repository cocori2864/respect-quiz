# 나의 소통 감수성 지수는? - Quiz App

모바일 디바이스 고유 식별을 통한 익명 소통 감수성 측정 퀴즈 앱

## 주요 기능

- 📱 **모바일 디바이스 식별**: 디바이스 고유 ID를 통한 익명 식별
- 🧠 **소통 감수성 측정**: 5가지 질문으로 소통 능력 평가
- 🎯 **점수 시스템**: 총 100점 만점의 점수 체계
- 🎁 **쿠폰 발급**: 퀴즈 완료 시 상품 수령 쿠폰 자동 생성
- 🛡️ **관리자 모드**: 담당자 전용 쿠폰 사용 처리 기능
- 🔒 **보안 기능**: 디바이스당 1회 참여 제한, 쿠폰 오남용 방지

## 기술 스택

- **Frontend**: React Native, TypeScript
- **Backend**: Firebase (Firestore, Authentication)
- **디바이스 식별**: react-native-device-info
- **UI/UX**: Linear Gradient, Vector Icons

## 설치 및 실행

### 필수 요구사항
- Node.js (>= 16)
- React Native CLI
- Android Studio / Xcode
- Firebase 프로젝트 설정

### 설치
```bash
npm install
```

### Firebase 설정
1. Firebase 콘솔에서 'respect-quiz' 프로젝트 생성
2. `google-services.json` (Android) / `GoogleService-Info.plist` (iOS) 파일 교체
3. Firebase Authentication 및 Firestore 활성화

### 실행
```bash
# Android
npm run android

# iOS
npm run ios
```

## 앱 구조

### 화면 구성
1. **홈 화면**: 앱 소개 및 퀴즈 시작
2. **퀴즈 화면**: 5가지 소통 감수성 질문
3. **결과 화면**: 점수 표시 및 쿠폰 발급
4. **관리자 화면**: 쿠폰 사용 처리

### 데이터베이스 구조
```
quiz-results/
├── deviceId: string
├── score: number
├── totalQuestions: number
├── timestamp: Date
└── couponCode: string

coupons/
├── code: string
├── deviceId: string
├── isUsed: boolean
├── createdAt: Date
└── usedAt?: Date
```

## 보안 정책

- 디바이스 식별을 통한 중복 참여 방지
- 쿠폰 코드 8자리 랜덤 생성
- 쿠폰 사용 시 즉시 무효화
- 관리자 전용 쿠폰 처리 인터페이스

## 주의사항

⚠️ **쿠폰 사용 관련**
- 쿠폰은 행사 담당자에게만 제시
- 임의 사용 및 공유 금지
- 1회 사용 후 자동 무효화
- 유효하지 않은 쿠폰은 처리 불가

## 문의

- Firebase 프로젝트: respect-quiz
- 관리자: cocori2880@gmail.com