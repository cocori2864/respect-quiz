# 🌐 온라인 배포 가이드

현재는 로컬 환경(HTML 파일을 브라우저에서 직접 열기)이므로, 온라인으로 전환하기 위한 배포 가이드입니다.

## 🚀 빠른 배포 방법 (권장)

### 1. GitHub Pages (무료, 가장 쉬움)

#### 1단계: GitHub 저장소 생성
1. [GitHub](https://github.com) 로그인
2. **New repository** 클릭
3. Repository name: `respect-quiz` (또는 원하는 이름)
4. **Public** 선택
5. **Create repository** 클릭

#### 2단계: 파일 업로드
1. **uploading an existing file** 클릭
2. 모든 파일 드래그 앤 드롭:
   ```
   admin.html
   participant.html
   quiz.html
   coupon.html
   verify-coupon.html
   mobile-test.html
   admin.js
   participant.js
   quiz.js
   coupon.js
   verify-coupon.js
   mobile-test.js
   styles.css
   read.md
   ```
3. **Commit changes** 클릭

#### 3단계: GitHub Pages 활성화
1. 저장소 **Settings** 탭 클릭
2. 왼쪽 메뉴에서 **Pages** 클릭
3. Source: **Deploy from a branch** 선택
4. Branch: **main** 선택
5. **Save** 클릭

#### 4단계: 접속 URL 확인
- 약 5분 후 접속 가능
- URL: `https://[사용자명].github.io/[저장소명]/admin.html`
- 예시: `https://myname.github.io/respect-quiz/admin.html`

---

### 2. Netlify (무료, 드래그 앤 드롭)

#### 1단계: Netlify 접속
1. [Netlify](https://www.netlify.com) 접속
2. **Sign up** (GitHub 계정으로 로그인 권장)

#### 2단계: 파일 압축
1. 모든 파일을 하나의 폴더에 넣기
2. 폴더를 ZIP으로 압축

#### 3단계: 배포
1. Netlify 대시보드에서 **Sites** 탭
2. **Deploy manually** 섹션에 ZIP 파일 드래그
3. 자동으로 배포 시작

#### 4단계: URL 확인
- 즉시 접속 가능
- URL: `https://[랜덤문자열].netlify.app/admin.html`
- Site settings에서 도메인 이름 변경 가능

---

### 3. Vercel (무료, GitHub 연동)

#### 1단계: GitHub 저장소 준비 (위의 GitHub Pages 1-2단계)

#### 2단계: Vercel 연동
1. [Vercel](https://vercel.com) 접속
2. **Sign up** (GitHub 계정으로)
3. **Import Git Repository** 클릭
4. 방금 만든 저장소 선택
5. **Deploy** 클릭

#### 3단계: 접속
- URL: `https://[프로젝트명].vercel.app/admin.html`

---

## 🔧 배포 후 설정

### QR 코드 URL 수정
배포 완료 후 `admin.js` 파일에서 다음 부분 수정:

```javascript
// 현재 (로컬용)
const currentUrl = window.location.href;
const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
const participantUrl = baseUrl + 'participant.html?event=' + encodeURIComponent(eventName);

// 수정 불필요 - 자동으로 온라인 URL 생성됨
```

**현재 코드는 이미 온라인 환경에서 자동으로 올바른 URL을 생성합니다!**

---

## 📱 사용 방법

### 배포 완료 후:
1. **관리자**: `https://도메인주소/admin.html` 접속
2. **QR 코드 생성**: 온라인 환경에서 자동 생성
3. **참여자**: QR 스캔하면 `https://도메인주소/participant.html` 자동 접속
4. **모든 기능**: 온라인에서 정상 작동

---

## 🎯 권장 배포 방법

### 초보자용: **Netlify**
- 가장 쉬움 (드래그 앤 드롭)
- 즉시 사용 가능
- 커스텀 도메인 지원

### 개발자용: **GitHub Pages**
- Git 버전 관리
- 무료 SSL 인증서
- 코드 업데이트 쉬움

### 프로용: **Vercel**
- 가장 빠른 속도
- 자동 HTTPS
- GitHub 자동 동기화

---

## 🔒 보안 및 주의사항

### HTTPS 필수
- 모든 추천 플랫폼은 자동 HTTPS 제공
- QR 코드 스캔 시 안전한 연결

### 도메인 관리
- 짧고 기억하기 쉬운 URL 사용
- 행사명과 연관된 도메인 권장

### 데이터 백업
- 정기적으로 localStorage 데이터 백업
- 행사 종료 후 참여자 데이터 다운로드

---

**💡 추천**: Netlify로 시작해보세요! 5분이면 온라인 배포 완료됩니다.