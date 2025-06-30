/**
 * 관리자 대시보드 JavaScript
 * 기능: QR 코드 생성, 참여자 통계 모니터링, 실시간 데이터 업데이트
 */

// 전역 변수
let participants = JSON.parse(localStorage.getItem('participants')) || [];
let eventName = localStorage.getItem('eventName') || '서울아산병원 소통 감수성 퀴즈';

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
    // 최신 데이터 강제 새로고침
    participants = JSON.parse(localStorage.getItem('participants')) || [];
    
    const totalParticipants = participants.length;
    const fiveMinutesAgo = Date.now() - (5 * 60 * 1000); // 5분으로 변경
    const recentParticipants = participants.filter(p => {
        return new Date(p.timestamp).getTime() > fiveMinutesAgo;
    }).length;
    
    document.getElementById('totalParticipants').textContent = totalParticipants;
    document.getElementById('recentParticipants').textContent = recentParticipants;
    
    // 콘솔 로그로 디버깅
    console.log('통계 업데이트:', {
        총참여자: totalParticipants,
        최근5분: recentParticipants,
        참여자목록: participants
    });
}

function refreshData() {
    // 강제로 localStorage에서 최신 데이터 가져오기
    try {
        const storedData = localStorage.getItem('participants');
        participants = storedData ? JSON.parse(storedData) : [];
        console.log('관리자: 참여자 데이터 새로고침', participants.length, '명');
    } catch (error) {
        console.error('참여자 데이터 로드 실패:', error);
        participants = [];
    }
    updateStats();
}

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('eventName').value = eventName;
    generateQR();
    refreshData();
    
    // 2초마다 데이터 새로고침 (더 빠른 반영)
    setInterval(refreshData, 2000);
});

// 스토리지 변경 감지 (다른 탭에서 참여자 등록 시)
window.addEventListener('storage', function(e) {
    if (e.key === 'participants') {
        refreshData();
    }
});