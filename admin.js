/**
 * 관리자 대시보드 JavaScript
 * 기능: QR 코드 생성, 참여자 통계 모니터링, 실시간 데이터 업데이트
 */

// 전역 변수
let participants = JSON.parse(localStorage.getItem('participants')) || [];
let eventName = localStorage.getItem('eventName') || '서울아산병원 소통 감수성 퀴즈';

// Firebase 설정 (respect-quiz 프로젝트의 정보로 교체)
const firebaseConfig = {
    apiKey: "AIzaSyBM2gx4IIBUJnfnKMgCrT6gEU1rHsxSvpw",
    authDomain: "respect-quiz.firebaseapp.com",
    projectId: "respect-quiz",
    storageBucket: "respect-quiz.firebasestorage.app",
    messagingSenderId: "919599211664",
    appId: "1:919599211664:web:fcc5deb2dd35beeb5de415"
  };

// Firebase 초기화 (강화된 오류 처리)
let db = null;
let firebaseEnabled = false;

try {
    // Firebase 앱이 이미 초기화되었는지 확인
    if (firebase.apps.length === 0) {
        firebase.initializeApp(firebaseConfig);
    }
    
    db = firebase.firestore();
    
    // Firestore 설정 최적화
    db.enableNetwork().then(() => {
        firebaseEnabled = true;
        console.log("🔥 Firebase 초기화 및 네트워크 연결 성공");
    }).catch((error) => {
        console.warn("🔥 Firebase 네트워크 연결 실패:", error.message);
        firebaseEnabled = false;
    });
    
} catch (error) {
    console.warn("🔥 Firebase 초기화 실패:", error.message);
    firebaseEnabled = false;
}

function generateQR() {
    const eventNameInput = document.getElementById('eventName').value;
    if (eventNameInput) {
        eventName = eventNameInput;
        localStorage.setItem('eventName', eventName);
    }
    
    // 현재 페이지의 도메인과 경로를 기반으로 참여자 URL 생성
    const currentUrl = window.location.href;
    const baseUrl = currentUrl.substring(0, currentUrl.lastIndexOf('/') + 1);
    const participantUrl = baseUrl + 'participant.html?event=' + encodeURIComponent(eventName) + '&source=qr';
    
    // QR 코드 생성
    const qrCodeContainer = document.getElementById('qrcode');
    qrCodeContainer.innerHTML = '<p>QR 코드 생성 중...</p>';
    
    // 여러 QR 라이브러리 시도
    tryGenerateQR(qrCodeContainer, participantUrl);
    
    // URL 표시
    document.getElementById('participantUrl').innerHTML = 
        `<strong>참여자 접속 URL:</strong><br><a href="${participantUrl}" target="_blank" style="word-break: break-all;">${participantUrl}</a>`;
}

function tryGenerateQR(container, url) {
    // 방법 1: 기존 QRCode 라이브러리
    if (typeof QRCode !== 'undefined') {
        try {
            QRCode.toCanvas(container, url, {
                width: 256,
                height: 256,
                margin: 2,
                color: {
                    dark: '#333333',
                    light: '#FFFFFF'
                }
            }, function (error) {
                if (error) {
                    console.error('QRCode 라이브러리 오류:', error);
                    tryAlternativeQR(container, url);
                } else {
                    console.log('QR 코드 생성 성공');
                }
            });
            return;
        } catch (e) {
            console.error('QRCode 실행 오류:', e);
        }
    }
    
    // 방법 2: 대체 QR 생성
    tryAlternativeQR(container, url);
}

function tryAlternativeQR(container, url) {
    // 방법 2: QR Server API 사용
    try {
        const qrSize = 256;
        const qrServerUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${qrSize}x${qrSize}&data=${encodeURIComponent(url)}`;
        
        const img = new Image();
        img.onload = function() {
            container.innerHTML = `
                <div style="text-align: center;">
                    <img src="${qrServerUrl}" 
                         alt="QR Code" 
                         style="border: 5px solid #f7fafc; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); max-width: 100%;">
                </div>
            `;
            console.log('QR Server API QR 생성 성공');
        };
        
        img.onerror = function() {
            console.log('QR Server API 실패, Google Charts 시도');
            tryGoogleQR(container, url);
        };
        
        img.src = qrServerUrl;
        
    } catch (e) {
        console.error('QR Server API 오류:', e);
        tryGoogleQR(container, url);
    }
}

function tryGoogleQR(container, url) {
    // 방법 3: Google Charts API 사용
    try {
        const qrSize = 256;
        const googleQrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${qrSize}x${qrSize}&chl=${encodeURIComponent(url)}`;
        
        const img = new Image();
        img.onload = function() {
            container.innerHTML = `
                <div style="text-align: center;">
                    <img src="${googleQrUrl}" 
                         alt="QR Code" 
                         style="border: 5px solid #f7fafc; border-radius: 10px; box-shadow: 0 8px 20px rgba(0,0,0,0.1); max-width: 100%;">
                </div>
            `;
            console.log('Google Charts QR 생성 성공');
        };
        
        img.onerror = function() {
            console.log('Google Charts API도 실패, 수동 모드로 전환');
            showManualQR(container, url);
        };
        
        img.src = googleQrUrl;
        
    } catch (e) {
        console.error('Google Charts QR 오류:', e);
        showManualQR(container, url);
    }
}

function showManualQR(container, url) {
    // 수동 모드: URL 직접 입력
    container.innerHTML = `
        <div style="border: 3px solid #667eea; padding: 30px; text-align: center; border-radius: 15px; background: #f7fafc;">
            <h3 style="color: #667eea; margin-bottom: 20px;">📱 수동 접속 방법</h3>
            
            <div style="background: white; padding: 25px; border-radius: 12px; margin: 15px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <p style="font-size: 18px; font-weight: bold; color: #2d3748; margin-bottom: 15px;">
                    🔗 참여자가 휴대폰에서 접속할 주소:
                </p>
                <div style="background: #edf2f7; padding: 20px; border-radius: 10px; font-family: monospace; word-break: break-all; font-size: 16px; color: #4a5568; border: 2px dashed #cbd5e0;">
                    ${url}
                </div>
                <button onclick="copyToClipboard('${url}')" 
                        style="background: #48bb78; color: white; border: none; padding: 12px 24px; border-radius: 8px; margin-top: 15px; cursor: pointer; font-size: 16px;">
                    📋 주소 복사하기
                </button>
            </div>
            
            <div style="background: #fff5f5; border: 2px solid #feb2b2; padding: 20px; border-radius: 10px; margin: 15px 0;">
                <p style="color: #e53e3e; font-weight: bold; margin-bottom: 10px;">⚠️ QR 코드 생성 실패</p>
                <p style="color: #718096; font-size: 14px;">
                    온라인 환경에서 일시적 오류입니다. 재시도하거나 위 주소를 직접 사용하세요
                </p>
            </div>
            
            <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                <button onclick="tryGenerateQR(document.getElementById('qrcode'), '${url}')" 
                        style="background: #667eea; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                    🔄 QR 코드 재시도
                </button>
                <button onclick="openUrlInNewTab('${url}')" 
                        style="background: #38a169; color: white; border: none; padding: 12px 20px; border-radius: 8px; cursor: pointer; font-size: 14px;">
                    🔗 새 탭에서 열기
                </button>
            </div>
        </div>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(function() {
        alert('✅ 주소가 클립보드에 복사되었습니다!\n\n참여자에게 공유하세요.');
    }).catch(function() {
        // 클립보드 API가 지원되지 않는 경우
        prompt('아래 주소를 복사해서 참여자에게 공유하세요:', text);
    });
}

function openUrlInNewTab(url) {
    window.open(url, '_blank');
}

function updateStats() {
    // 최신 데이터 강제 새로고침 - 여러 방법으로 시도
    try {
        // 방법 1: 직접 localStorage 읽기
        const storedData = localStorage.getItem('participants');
        participants = storedData ? JSON.parse(storedData) : [];
        
        // 방법 2: 중복 제거 (디바이스 ID 기준)
        const uniqueParticipants = participants.filter((participant, index, self) => 
            index === self.findIndex(p => p.deviceId === participant.deviceId)
        );
        
        const totalParticipants = uniqueParticipants.length;
        const fiveMinutesAgo = Date.now() - (5 * 60 * 1000);
        const recentParticipants = uniqueParticipants.filter(p => {
            return new Date(p.timestamp).getTime() > fiveMinutesAgo;
        }).length;
        
        // 모바일 접속자 수 계산
        const mobileParticipants = uniqueParticipants.filter(p => p.isMobile).length;
        const qrParticipants = uniqueParticipants.filter(p => p.accessSource === 'qr').length;
        
        document.getElementById('totalParticipants').textContent = totalParticipants;
        document.getElementById('recentParticipants').textContent = recentParticipants;
        
        // 상세 로깅으로 디버깅
        console.log('📊 통계 업데이트:', {
            원본데이터: participants.length,
            중복제거후: totalParticipants,
            최근5분: recentParticipants,
            모바일접속: mobileParticipants,
            QR접속: qrParticipants,
            localStorage크기: storedData ? storedData.length : 0
        });
        
        // 참여자 목록의 최근 5명 출력
        if (uniqueParticipants.length > 0) {
            const latest5 = uniqueParticipants.slice(-5).map(p => ({
                익명ID: p.anonymousId,
                시간: new Date(p.timestamp).toLocaleString(),
                모바일: p.isMobile ? '📱' : '💻',
                접속경로: p.accessSource || 'direct'
            }));
            console.log('📋 최근 참여자 5명:', latest5);
        }
        
    } catch (error) {
        console.error('❌ 통계 업데이트 실패:', error);
        participants = [];
        document.getElementById('totalParticipants').textContent = '0';
        document.getElementById('recentParticipants').textContent = '0';
    }
}

function refreshData() {
    // 강제로 localStorage에서 최신 데이터 가져오기
    try {
        // localStorage 직접 접근으로 캐시 우회
        localStorage.removeItem('temp_refresh');
        localStorage.setItem('temp_refresh', Date.now().toString());
        localStorage.removeItem('temp_refresh');
        
        const storedData = localStorage.getItem('participants');
        participants = storedData ? JSON.parse(storedData) : [];
        
        console.log('🔄 데이터 새로고침:', {
            시간: new Date().toLocaleTimeString(),
            참여자수: participants.length,
            데이터크기: storedData ? storedData.length : 0
        });
        console.log('관리자: 참여자 데이터 새로고침', participants.length, '명');
    } catch (error) {
        console.error('참여자 데이터 로드 실패:', error);
        participants = [];
    }
    updateStats();
}

function listenToParticipants() {
    try {
        if (firebaseEnabled && db) {
            console.log('🔥 Firebase 실시간 리스너 시작');
            db.collection("participants").onSnapshot((querySnapshot) => {
                const firebaseParticipants = [];
                querySnapshot.forEach((doc) => {
                    firebaseParticipants.push({
                        id: doc.id,
                        ...doc.data()
                    });
                });
                
                console.log('🔥 Firebase에서 받은 참여자:', firebaseParticipants.length, '명');
                
                // Firebase 데이터를 localStorage와 병합
                const localParticipants = JSON.parse(localStorage.getItem('participants')) || [];
                const mergedParticipants = mergeParticipants(localParticipants, firebaseParticipants);
                
                // 병합된 데이터로 통계 업데이트
                participants = mergedParticipants;
                localStorage.setItem('participants', JSON.stringify(participants));
                updateStats();
                
                // Firebase 연결 상태 표시
                document.getElementById('firebaseStatus').textContent = '🟢 Firebase 연결됨';
                document.getElementById('firebaseStatus').style.color = 'green';
            }, (error) => {
                console.warn('🔥 Firebase 리스너 오류:', error);
                firebaseEnabled = false;
                document.getElementById('firebaseStatus').textContent = '🔴 Firebase 연결 실패';
                document.getElementById('firebaseStatus').style.color = 'red';
            });
        } else {
            console.warn('🔥 Firebase 비활성화됨');
            document.getElementById('firebaseStatus').textContent = '⚪ localStorage만 사용';
            document.getElementById('firebaseStatus').style.color = 'gray';
        }
    } catch (error) {
        console.error('🔥 Firebase 리스너 설정 실패:', error);
        firebaseEnabled = false;
        document.getElementById('firebaseStatus').textContent = '🔴 Firebase 오류';
        document.getElementById('firebaseStatus').style.color = 'red';
    }
}

function mergeParticipants(localParticipants, firebaseParticipants) {
    const merged = [...localParticipants];
    
    firebaseParticipants.forEach(fbParticipant => {
        const existingIndex = merged.findIndex(p => p.deviceId === fbParticipant.deviceId);
        if (existingIndex === -1) {
            // Firebase에만 있는 참여자 추가
            merged.push(fbParticipant);
        } else {
            // 기존 참여자 정보 업데이트 (Firebase 우선)
            merged[existingIndex] = { ...merged[existingIndex], ...fbParticipant };
        }
    });
    
    return merged;
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('eventName').value = eventName;
    generateQR();
    refreshData();
    listenToParticipants();
    
    // 2초마다 데이터 새로고침 (더 빠른 반영)
    setInterval(refreshData, 2000);
});

// 스토리지 변경 감지 (다른 탭에서 참여자 등록 시)
window.addEventListener('storage', function(e) {
    if (e.key === 'participants' || 
        e.key === 'participantUpdate' || 
        e.key === 'lastParticipantAdded' ||
        e.key === 'finalSync' ||
        e.key === 'syncComplete') {
        console.log('🔔 Storage 이벤트 감지:', e.key);
        
        // lastParticipantAdded 키의 경우 즉시 새로고침
        if (e.key === 'lastParticipantAdded') {
            console.log('⚡ 신규 참여자 즉시 감지');
            refreshData();
        } else {
            setTimeout(refreshData, 100);
        }
    }
});

// 다른 창에서 온 메시지 수신
window.addEventListener('message', function(e) {
    if (e.data && e.data.type === 'participantAdded') {
        console.log('📨 참여자 추가 메시지 수신:', e.data);
        setTimeout(refreshData, 100);
    }
});

// localStorage 변경을 더 적극적으로 감지
let lastParticipantCount = 0;
let lastParticipantHash = '';
let lastCheckTime = '';

setInterval(function() {
    try {
        const currentData = localStorage.getItem('participants');
        const currentParticipants = currentData ? JSON.parse(currentData) : [];
        const currentHash = currentData ? btoa(currentData).substring(0, 16) : '';
        
        // 참여자 수 변경 감지
        if (currentParticipants.length !== lastParticipantCount) {
            console.log('🔄 참여자 수 변경 감지:', lastParticipantCount, '→', currentParticipants.length);
            lastParticipantCount = currentParticipants.length;
            refreshData();
        }
        
        // 데이터 내용 변경 감지 (참여자 수는 같지만 내용이 바뀐 경우)
        if (currentHash !== lastParticipantHash) {
            console.log('📊 참여자 데이터 변경 감지');
            lastParticipantHash = currentHash;
            refreshData();
        }
        
        // lastParticipantAdded 키 변경 감지
        const lastAdded = localStorage.getItem('lastParticipantAdded');
        if (lastAdded && lastAdded !== lastCheckTime) {
            console.log('⚡ 새 참여자 직접 감지');
            lastCheckTime = lastAdded;
            refreshData();
        }
        
    } catch (e) {
        console.error('참여자 수 체크 오류:', e);
    }
}, 1000); // 1초마다 체크

// 강제 새로고침 함수
function forceRefreshStats() {
    console.log('🔄 강제 새로고침 실행');
    
    // localStorage 캐시 강제 삭제
    const participantData = localStorage.getItem('participants');
    localStorage.removeItem('participants');
    if (participantData) {
        localStorage.setItem('participants', participantData);
    }
    
    // 즉시 새로고침
    refreshData();
    
    // 시각적 피드백
    const button = document.querySelector('button[onclick="forceRefreshStats()"]');
    if (button) {
        const originalText = button.innerHTML;
        button.innerHTML = '✅ 새로고침됨';
        button.style.background = '#27ae60';
        setTimeout(() => {
            button.innerHTML = originalText;
            button.style.background = '#e74c3c';
        }, 2000);
    }
    
    // 상세 정보 출력
    try {
        const data = localStorage.getItem('participants');
        const participants = data ? JSON.parse(data) : [];
        console.log('📊 강제 새로고침 결과:', {
            localStorage크기: data ? data.length : 0,
            참여자수: participants.length,
            최근3명: participants.slice(-3).map(p => ({
                익명ID: p.anonymousId,
                시간: new Date(p.timestamp).toLocaleString(),
                모바일: p.isMobile ? '📱' : '💻',
                경로: p.accessSource
            }))
        });
    } catch (e) {
        console.error('강제 새로고침 상세 정보 출력 실패:', e);
    }
}