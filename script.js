// 부드러운 스크롤 및 네비게이션 활성화
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    // 네비게이션 링크 클릭 시 활성화 표시
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // 기본 동작은 유지 (스크롤)
            // 필요시 추가 기능 구현 가능
        });
    });

    // 스크롤 시 현재 섹션에 따라 네비게이션 하이라이트
    window.addEventListener('scroll', function() {
        const sections = document.querySelectorAll('.section');
        const scrollPos = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const bottom = top + section.offsetHeight;
            const id = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${id}"]`);

            if (scrollPos >= top && scrollPos < bottom) {
                navLinks.forEach(link => link.classList.remove('active'));
                if (navLink) {
                    navLink.classList.add('active');
                }
            }
        });
    });

    // 자기소개서 작성 기능
    initResumeForm();
    
    // 타임라인 기능
    initTimeline();
    
    // 면접 타이머 기능
    initInterviewTimer();
    
    // 챗봇 기능
    initChatbot();
});

// 전역 성공 메시지 표시 함수
function showSuccessMessage(message) {
    const messageDiv = document.createElement('div');
    messageDiv.textContent = message;
    messageDiv.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 자기소개서 작성 폼 초기화
function initResumeForm() {
    const contentTextarea = document.getElementById('content');
    const charCount = document.getElementById('charCount');
    const previewBtn = document.getElementById('previewBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const closePreview = document.getElementById('closePreview');
    const previewArea = document.getElementById('previewArea');
    const previewContent = document.getElementById('previewContent');
    const resumeForm = document.getElementById('resumeForm');

    // 글자 수 카운터
    if (contentTextarea && charCount) {
        contentTextarea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            charCount.parentElement.classList.toggle('warning', count > 2000);
        });
    }

    // 미리보기 버튼
    if (previewBtn) {
        previewBtn.addEventListener('click', function() {
            if (resumeForm.checkValidity()) {
                showPreview();
            } else {
                resumeForm.reportValidity();
            }
        });
    }

    // 미리보기 닫기
    if (closePreview) {
        closePreview.addEventListener('click', function() {
            previewArea.style.display = 'none';
        });
    }

    // PDF 다운로드 버튼
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            if (resumeForm.checkValidity()) {
                downloadPDF();
            } else {
                resumeForm.reportValidity();
            }
        });
    }

    // 미리보기 표시 함수
    function showPreview() {
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const content = document.getElementById('content').value;

        let previewHTML = `
            <h4>이름: ${escapeHtml(name)}</h4>
            <h4>지원 직무: ${escapeHtml(position)}</h4>
            <hr style="margin: 1.5rem 0; border: none; border-top: 1px solid #e0e0e0;">
            <div style="margin-top: 1rem;">
                ${formatContent(escapeHtml(content))}
            </div>
        `;

        previewContent.innerHTML = previewHTML;
        previewArea.style.display = 'block';
        previewArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // HTML 이스케이프 함수
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // 내용 포맷팅 (줄바꿈 처리)
    function formatContent(text) {
        return text.replace(/\n/g, '<br>');
    }

    // PDF 다운로드 함수
    async function downloadPDF() {
        const name = document.getElementById('name').value;
        const position = document.getElementById('position').value;
        const content = document.getElementById('content').value;

        try {
            // 미리보기 영역을 임시로 표시하여 캡처
            const wasPreviewVisible = previewArea.style.display !== 'none';
            if (!wasPreviewVisible) {
                showPreview();
                // 렌더링을 위해 잠시 대기
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            // html2canvas를 사용하여 미리보기 영역을 캡처
            const canvas = await html2canvas(previewContent, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                logging: false
            });

            // jsPDF 인스턴스 생성
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 너비 (mm)
            const pageHeight = 297; // A4 높이 (mm)
            const imgHeight = (canvas.height * imgWidth) / canvas.width;
            let heightLeft = imgHeight;
            let position = 0;

            // 이미지를 PDF에 추가
            const imgData = canvas.toDataURL('image/png');
            
            // 첫 페이지 추가
            pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;

            // 여러 페이지가 필요한 경우
            while (heightLeft >= 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
                heightLeft -= pageHeight;
            }

            // PDF 다운로드
            const fileName = `${name}_자기소개서_${new Date().getTime()}.pdf`;
            pdf.save(fileName);

            // 미리보기가 원래 보이지 않았었다면 다시 숨김
            if (!wasPreviewVisible) {
                previewArea.style.display = 'none';
            }

            // 성공 메시지 (선택사항)
            showSuccessMessage('PDF가 성공적으로 다운로드되었습니다!');
        } catch (error) {
            console.error('PDF 생성 중 오류 발생:', error);
            alert('PDF 생성 중 오류가 발생했습니다. 다시 시도해주세요.');
        }
    }
}

// 애니메이션 스타일 추가
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// 타임라인 데이터 관리
let timelineData = [];

// 타임라인 초기화
function initTimeline() {
    // 로컬 스토리지에서 데이터 로드
    loadTimelineData();
    
    // 이벤트 리스너 설정
    const addBtn = document.getElementById('addApplicationBtn');
    const exportBtn = document.getElementById('exportDataBtn');
    const importBtn = document.getElementById('importDataBtn');
    const importInput = document.getElementById('importFileInput');
    const modal = document.getElementById('applicationModal');
    const closeModal = document.getElementById('closeModal');
    const cancelBtn = document.getElementById('cancelBtn');
    const form = document.getElementById('applicationForm');
    
    if (addBtn) {
        addBtn.addEventListener('click', () => openModal());
    }
    
    if (exportBtn) {
        exportBtn.addEventListener('click', exportData);
    }
    
    if (importBtn) {
        importBtn.addEventListener('click', () => importInput.click());
    }
    
    if (importInput) {
        importInput.addEventListener('change', handleFileImport);
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeModalWindow);
    }
    
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModalWindow);
    }
    
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // 모달 외부 클릭 시 닫기
    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModalWindow();
            }
        });
    }
    
    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    const dateInput = document.getElementById('applicationDate');
    if (dateInput && !dateInput.value) {
        dateInput.value = today;
    }
    
    // 타임라인 렌더링
    renderTimeline();
}

// 로컬 스토리지에서 데이터 로드
function loadTimelineData() {
    const saved = localStorage.getItem('timelineData');
    if (saved) {
        try {
            timelineData = JSON.parse(saved);
        } catch (e) {
            console.error('데이터 로드 실패:', e);
            timelineData = [];
        }
    }
}

// 데이터 저장
function saveTimelineData() {
    localStorage.setItem('timelineData', JSON.stringify(timelineData));
}

// 타임라인 렌더링
function renderTimeline() {
    const container = document.getElementById('timelineContainer');
    const empty = document.getElementById('timelineEmpty');
    
    if (!container) return;
    
    // 데이터 정렬 (날짜 기준, 최신순)
    const sortedData = [...timelineData].sort((a, b) => {
        return new Date(b.applicationDate) - new Date(a.applicationDate);
    });
    
    if (sortedData.length === 0) {
        container.innerHTML = '';
        if (empty) {
            empty.style.display = 'block';
            container.appendChild(empty);
        }
        return;
    }
    
    if (empty) {
        empty.style.display = 'none';
    }
    
    // 타임라인 생성
    const timeline = document.createElement('div');
    timeline.className = 'timeline';
    
    sortedData.forEach((item, index) => {
        const timelineItem = createTimelineItem(item, index);
        timeline.appendChild(timelineItem);
    });
    
    container.innerHTML = '';
    container.appendChild(timeline);
}

// 타임라인 아이템 생성
function createTimelineItem(item, index) {
    const div = document.createElement('div');
    div.className = 'timeline-item';
    div.setAttribute('data-id', item.id);
    
    const statusClass = `status-${item.status.replace(/\s/g, '')}`;
    const formattedDate = formatDate(item.applicationDate);
    
    div.innerHTML = `
        <div class="timeline-card">
            <div class="timeline-card-header">
                <h3 class="timeline-card-title">${escapeHtml(item.companyName)}</h3>
                <div class="timeline-card-actions">
                    <button class="edit-btn" onclick="editApplication('${item.id}')">수정</button>
                    <button class="delete-btn" onclick="deleteApplication('${item.id}')">삭제</button>
                </div>
            </div>
            <div class="timeline-card-info">
                <div class="timeline-card-info-item">
                    <strong>직무:</strong> ${escapeHtml(item.position)}
                </div>
                <div class="timeline-card-info-item">
                    <strong>지원일:</strong> ${formattedDate}
                </div>
            </div>
            <div>
                <span class="timeline-status ${statusClass}">${escapeHtml(item.status)}</span>
            </div>
            ${item.notes ? `
                <div class="timeline-card-notes">
                    <strong>메모:</strong><br>
                    ${escapeHtml(item.notes).replace(/\n/g, '<br>')}
                </div>
            ` : ''}
        </div>
    `;
    
    return div;
}

// 날짜 포맷팅
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 모달 열기
function openModal(itemId = null) {
    const modal = document.getElementById('applicationModal');
    const form = document.getElementById('applicationForm');
    const title = document.getElementById('modalTitle');
    
    if (!modal || !form) return;
    
    if (itemId) {
        // 수정 모드
        const item = timelineData.find(i => i.id === itemId);
        if (item) {
            document.getElementById('companyName').value = item.companyName;
            document.getElementById('modalPosition').value = item.position;
            document.getElementById('applicationDate').value = item.applicationDate;
            document.getElementById('status').value = item.status;
            document.getElementById('notes').value = item.notes || '';
            form.setAttribute('data-edit-id', itemId);
            if (title) title.textContent = '지원 수정하기';
        }
    } else {
        // 추가 모드
        form.reset();
        form.removeAttribute('data-edit-id');
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('applicationDate').value = today;
        if (title) title.textContent = '지원 추가하기';
    }
    
    modal.classList.add('show');
}

// 모달 닫기
function closeModalWindow() {
    const modal = document.getElementById('applicationModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// 폼 제출 처리
function handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const editId = form.getAttribute('data-edit-id');
    
    const formData = {
        companyName: document.getElementById('companyName').value.trim(),
        position: document.getElementById('modalPosition').value.trim(),
        applicationDate: document.getElementById('applicationDate').value,
        status: document.getElementById('status').value,
        notes: document.getElementById('notes').value.trim()
    };
    
    if (editId) {
        // 수정
        const index = timelineData.findIndex(item => item.id === editId);
        if (index !== -1) {
            timelineData[index] = { ...timelineData[index], ...formData };
            saveTimelineData();
            renderTimeline();
            closeModalWindow();
            showSuccessMessage('지원 정보가 수정되었습니다!');
        }
    } else {
        // 추가
        const newItem = {
            id: generateId(),
            ...formData,
            createdAt: new Date().toISOString()
        };
        timelineData.push(newItem);
        saveTimelineData();
        renderTimeline();
        closeModalWindow();
        showSuccessMessage('새 지원이 추가되었습니다!');
    }
}

// ID 생성
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 지원 수정
function editApplication(id) {
    openModal(id);
}

// 지원 삭제
function deleteApplication(id) {
    if (confirm('정말로 이 지원을 삭제하시겠습니까?')) {
        timelineData = timelineData.filter(item => item.id !== id);
        saveTimelineData();
        renderTimeline();
        showSuccessMessage('지원이 삭제되었습니다.');
    }
}

// 데이터 내보내기
function exportData() {
    const dataStr = JSON.stringify(timelineData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `취업준비타임라인_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showSuccessMessage('데이터가 내보내졌습니다!');
}

// 파일 가져오기 처리
function handleFileImport(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
                if (confirm('가져온 데이터로 기존 데이터를 덮어쓰시겠습니까?')) {
                    timelineData = imported;
                    saveTimelineData();
                    renderTimeline();
                    showSuccessMessage('데이터가 가져와졌습니다!');
                } else if (confirm('기존 데이터에 추가하시겠습니까?')) {
                    timelineData = [...timelineData, ...imported];
                    saveTimelineData();
                    renderTimeline();
                    showSuccessMessage('데이터가 추가되었습니다!');
                }
            } else {
                alert('올바른 JSON 형식이 아닙니다.');
            }
        } catch (error) {
            alert('파일을 읽는 중 오류가 발생했습니다: ' + error.message);
        }
    };
    reader.readAsText(file);
    
    // 파일 입력 초기화
    e.target.value = '';
}

// 성공 메시지 표시 (기존 함수 재사용)
function showTimelineSuccessMessage(message) {
    showSuccessMessage(message);
}

// 면접 타이머 변수
let timerInterval = null;
let timerSeconds = 180; // 기본 3분
let totalSeconds = 180;
let isRunning = false;
let isPaused = false;

// 면접 타이머 초기화
function initInterviewTimer() {
    const timerOptions = document.querySelectorAll('.timer-option');
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const resetBtn = document.getElementById('resetTimerBtn');
    
    // 타이머 옵션 선택
    timerOptions.forEach(option => {
        option.addEventListener('click', function() {
            if (isRunning) return; // 실행 중에는 변경 불가
            
            timerOptions.forEach(opt => opt.classList.remove('active'));
            this.classList.add('active');
            
            const minutes = parseInt(this.getAttribute('data-minutes'));
            timerSeconds = minutes * 60;
            totalSeconds = minutes * 60;
            updateTimerDisplay();
            resetTimerProgress();
        });
    });
    
    // 시작 버튼
    if (startBtn) {
        startBtn.addEventListener('click', startTimer);
    }
    
    // 일시정지 버튼
    if (pauseBtn) {
        pauseBtn.addEventListener('click', pauseTimer);
    }
    
    // 리셋 버튼
    if (resetBtn) {
        resetBtn.addEventListener('click', resetTimer);
    }
    
    // 초기 표시 업데이트
    updateTimerDisplay();
}

// 타이머 시작
function startTimer() {
    if (isRunning) return;
    
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const timerCircle = document.querySelector('.timer-circle');
    const timerLabel = document.getElementById('timerLabel');
    
    isRunning = true;
    isPaused = false;
    
    if (startBtn) startBtn.style.display = 'none';
    if (pauseBtn) pauseBtn.style.display = 'flex';
    if (timerCircle) timerCircle.classList.add('timer-running');
    if (timerLabel) timerLabel.textContent = '진행 중';
    
    timerInterval = setInterval(() => {
        timerSeconds--;
        updateTimerDisplay();
        updateTimerProgress();
        
        // 경고 상태 (마지막 30초)
        if (timerSeconds <= 30 && timerSeconds > 0) {
            const progress = document.getElementById('timerProgress');
            if (progress) {
                progress.classList.add('warning');
                if (timerSeconds <= 10) {
                    progress.classList.remove('warning');
                    progress.classList.add('danger');
                }
            }
        }
        
        // 시간 종료
        if (timerSeconds <= 0) {
            stopTimer();
            playAlarm();
            showTimerCompleteMessage();
        }
    }, 1000);
}

// 타이머 일시정지
function pauseTimer() {
    if (!isRunning) return;
    
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const timerLabel = document.getElementById('timerLabel');
    
    isRunning = false;
    isPaused = true;
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    if (startBtn) startBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (timerLabel) timerLabel.textContent = '일시정지';
}

// 타이머 리셋
function resetTimer() {
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const timerCircle = document.querySelector('.timer-circle');
    const timerLabel = document.getElementById('timerLabel');
    const progress = document.getElementById('timerProgress');
    
    // 타이머 중지
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isRunning = false;
    isPaused = false;
    
    // 선택된 옵션에서 시간 가져오기
    const activeOption = document.querySelector('.timer-option.active');
    if (activeOption) {
        const minutes = parseInt(activeOption.getAttribute('data-minutes'));
        timerSeconds = minutes * 60;
        totalSeconds = minutes * 60;
    } else {
        timerSeconds = 180;
        totalSeconds = 180;
    }
    
    // UI 업데이트
    if (startBtn) startBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (timerCircle) timerCircle.classList.remove('timer-running');
    if (timerLabel) timerLabel.textContent = '준비';
    if (progress) {
        progress.classList.remove('warning', 'danger');
    }
    
    updateTimerDisplay();
    resetTimerProgress();
}

// 타이머 중지
function stopTimer() {
    const startBtn = document.getElementById('startTimerBtn');
    const pauseBtn = document.getElementById('pauseTimerBtn');
    const timerCircle = document.querySelector('.timer-circle');
    const timerLabel = document.getElementById('timerLabel');
    const progress = document.getElementById('timerProgress');
    
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    
    isRunning = false;
    isPaused = false;
    
    if (startBtn) startBtn.style.display = 'flex';
    if (pauseBtn) pauseBtn.style.display = 'none';
    if (timerCircle) timerCircle.classList.remove('timer-running');
    if (timerLabel) timerLabel.textContent = '완료';
    if (progress) {
        progress.classList.remove('warning', 'danger');
    }
}

// 타이머 표시 업데이트
function updateTimerDisplay() {
    const timerTime = document.getElementById('timerTime');
    if (!timerTime) return;
    
    const minutes = Math.floor(timerSeconds / 60);
    const seconds = timerSeconds % 60;
    timerTime.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// 타이머 진행률 업데이트
function updateTimerProgress() {
    const progress = document.getElementById('timerProgress');
    if (!progress) return;
    
    const circumference = 2 * Math.PI * 90; // 반지름 90
    const remaining = timerSeconds / totalSeconds;
    const offset = circumference * (1 - remaining);
    
    progress.style.strokeDashoffset = offset;
}

// 타이머 진행률 리셋
function resetTimerProgress() {
    const progress = document.getElementById('timerProgress');
    if (!progress) return;
    
    progress.style.strokeDashoffset = 0;
}

// 알림음 재생
function playAlarm() {
    // Web Audio API를 사용한 알림음 생성
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
        
        // 0.5초 후 다시 재생
        setTimeout(() => {
            const oscillator2 = audioContext.createOscillator();
            const gainNode2 = audioContext.createGain();
            
            oscillator2.connect(gainNode2);
            gainNode2.connect(audioContext.destination);
            
            oscillator2.frequency.value = 800;
            oscillator2.type = 'sine';
            
            gainNode2.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
            
            oscillator2.start(audioContext.currentTime);
            oscillator2.stop(audioContext.currentTime + 0.5);
        }, 500);
    } catch (error) {
        console.error('알림음 재생 실패:', error);
        // 대체 방법: 브라우저 알림
        if (Notification.permission === 'granted') {
            new Notification('타이머 완료!', {
                body: '면접 연습 시간이 종료되었습니다.',
                icon: '🔔'
            });
        }
    }
}

// 타이머 완료 메시지
function showTimerCompleteMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.innerHTML = `
        <div style="text-align: center;">
            <div style="font-size: 3rem; margin-bottom: 1rem;">⏰</div>
            <div style="font-size: 1.5rem; font-weight: 600; margin-bottom: 0.5rem;">시간 종료!</div>
            <div style="font-size: 1rem; color: #666;">면접 연습 시간이 완료되었습니다.</div>
        </div>
    `;
    messageDiv.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 2.5rem 3rem;
        border-radius: 16px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        animation: scaleIn 0.3s ease;
        max-width: 90%;
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.style.animation = 'scaleOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(messageDiv)) {
                document.body.removeChild(messageDiv);
            }
        }, 300);
    }, 3000);
}

// 애니메이션 스타일 추가 (타이머 완료 메시지용)
const timerStyle = document.createElement('style');
timerStyle.textContent = `
    @keyframes scaleIn {
        from {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
        to {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
    }
    
    @keyframes scaleOut {
        from {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
        }
        to {
            transform: translate(-50%, -50%) scale(0.8);
            opacity: 0;
        }
    }
`;
document.head.appendChild(timerStyle);

// 챗봇 질문-답변 데이터베이스
const chatbotQA = [
    {
        keywords: ['자기소개서', '자소서', '작성', '어떻게', '방법', '팁'],
        answer: '자기소개서 작성 시 다음 사항을 고려해보세요:\n\n1. 지원 회사의 가치관과 비전을 먼저 파악하세요\n2. 구체적인 경험과 성과를 숫자로 표현하세요\n3. 지원 직무와 연관된 경험을 강조하세요\n4. 진솔하고 솔직하게 작성하되, 긍정적인 톤을 유지하세요\n5. 여러 번 검토하고 수정하는 과정이 중요합니다.'
    },
    {
        keywords: ['면접', '면접 준비', '면접 질문', '면접 팁', '면접 대비'],
        answer: '면접 준비를 위해 다음을 추천드립니다:\n\n1. 지원 회사와 직무에 대한 충분한 조사\n2. 예상 질문에 대한 답변 준비 (STAR 기법 활용)\n3. 자신의 강점과 약점을 명확히 정리\n4. 지원 동기와 입사 후 포부 구체화\n5. 모의 면접을 통해 연습하기\n6. 적절한 복장과 시간 준수\n7. 긍정적인 자세와 자신감 유지'
    },
    {
        keywords: ['포트폴리오', '포트폴리오 작성', '포트폴리오 준비'],
        answer: '포트폴리오 작성 시 주의사항:\n\n1. 직무와 관련된 프로젝트를 우선적으로 포함\n2. 각 프로젝트의 목적, 역할, 결과를 명확히 설명\n3. 시각적 자료(스크린샷, 다이어그램) 활용\n4. GitHub 링크나 데모 사이트 제공\n5. 지속적으로 업데이트하고 개선\n6. 간결하고 읽기 쉽게 구성'
    },
    {
        keywords: ['이력서', '이력서 작성', '이력서 양식', '이력서 팁'],
        answer: '효과적인 이력서 작성 방법:\n\n1. 한 페이지 분량으로 간결하게 작성\n2. 역순으로 경력 나열 (최신순)\n3. 구체적인 성과와 숫자로 표현\n4. 지원 직무와 관련된 경험 강조\n5. 오타와 문법 오류 철저히 점검\n6. PDF 형식으로 저장하여 제출\n7. 회사별로 맞춤형으로 수정'
    },
    {
        keywords: ['지원 동기', '지원 이유', '왜 지원', '지원하게 된 이유'],
        answer: '지원 동기를 작성할 때:\n\n1. 회사의 비전과 가치관에 대한 공감\n2. 지원 직무에 대한 관심과 열정\n3. 자신의 역량과 회사가 원하는 인재상의 일치\n4. 구체적인 경험과 성과로 뒷받침\n5. 입사 후 기여할 수 있는 부분 명시\n6. 진솔하고 진정성 있는 표현'
    },
    {
        keywords: ['강점', '장점', '나의 강점', '강점 어필'],
        answer: '강점을 어필하는 방법:\n\n1. 구체적인 경험과 사례를 들어 설명\n2. 지원 직무와 연관된 강점 강조\n3. 숫자나 결과로 증명 가능한 강점\n4. 팀워크, 리더십, 문제 해결 능력 등\n5. 약점을 강점으로 전환하는 스토리텔링\n6. 면접관이 기억할 수 있는 구체적인 예시'
    },
    {
        keywords: ['약점', '단점', '나의 약점', '약점 질문'],
        answer: '약점 질문에 답할 때:\n\n1. 진짜 약점이 아닌 개선 중인 점을 선택\n2. 약점을 인정하고 개선 노력을 설명\n3. 구체적인 개선 방법과 결과 제시\n4. 약점을 극복한 경험 공유\n5. 긍정적인 태도로 전환하는 스토리\n6. 지원 직무에 큰 영향을 주지 않는 약점 선택'
    },
    {
        keywords: ['연봉', '급여', '연봉 협상', '연봉 질문'],
        answer: '연봉 협상 시 고려사항:\n\n1. 시장 평균 연봉 조사\n2. 자신의 경력과 역량 평가\n3. 회사의 연봉 체계 파악\n4. 적절한 시점에 협상 (최종 면접 후)\n5. 연봉 외 복리후생도 함께 고려\n6. 성장 가능성과 기회도 중요하게 생각\n7. 무리한 요구보다는 합리적인 범위에서'
    },
    {
        keywords: ['거절', '불합격', '떨어졌', '탈락', '실패'],
        answer: '불합격을 경험했을 때:\n\n1. 실망하지 말고 다음 기회를 준비하세요\n2. 피드백을 요청하여 개선점 파악\n3. 면접이나 서류에서 부족했던 점 보완\n4. 다른 회사 지원을 계속 진행\n5. 포트폴리오나 스킬을 지속적으로 개선\n6. 네트워킹과 정보 수집을 통해 기회 확대\n7. 긍정적인 마인드 유지가 중요합니다'
    },
    {
        keywords: ['스킬', '기술', '능력', '역량', '어떤 스킬'],
        answer: '취업에 필요한 스킬:\n\n1. 직무별 필수 기술 스택 습득\n2. 협업 도구 사용 능력 (Git, Jira 등)\n3. 커뮤니케이션 능력\n4. 문제 해결 능력\n5. 학습 능력과 적응력\n6. 프로젝트 관리 능력\n7. 온라인 강의나 프로젝트를 통해 실전 경험 쌓기'
    },
    {
        keywords: ['인턴십', '인턴', '인턴 지원', '인턴십 준비'],
        answer: '인턴십 준비 방법:\n\n1. 관심 있는 회사의 인턴십 프로그램 조사\n2. 포트폴리오와 이력서 준비\n3. 인턴십을 통한 실무 경험 쌓기\n4. 네트워킹과 인맥 형성\n5. 정규직 전환 기회 활용\n6. 배운 내용을 기록하고 정리\n7. 적극적인 자세로 업무에 임하기'
    },
    {
        keywords: ['네트워킹', '인맥', '커뮤니티', '사람 만나기'],
        answer: '네트워킹 방법:\n\n1. 온라인 커뮤니티 참여 (GitHub, LinkedIn)\n2. 오프라인 세미나나 밋업 참석\n3. 멘토 찾기 및 조언 구하기\n4. 동료 개발자들과 정보 공유\n5. 회사 정보 세션 참여\n6. SNS를 통한 업계 인사들과 소통\n7. 지속적인 관계 유지가 중요합니다'
    },
    {
        keywords: ['안녕', '하이', '헬로', '인사', '시작'],
        answer: '안녕하세요! 취업 준비에 대해 궁금한 점이 있으시면 언제든지 물어보세요. 자기소개서, 면접, 포트폴리오, 이력서 등 다양한 주제에 대해 도움을 드릴 수 있습니다!'
    },
    {
        keywords: ['감사', '고마', '고맙', 'thanks', 'thank'],
        answer: '천만에요! 취업 준비는 시간이 걸리는 과정이지만, 꾸준한 노력과 준비를 통해 좋은 결과를 얻을 수 있습니다. 화이팅하세요! 💪'
    },
    {
        keywords: ['도움', '어떻게', '방법', '팁', '조언'],
        answer: '취업 준비를 위한 종합적인 조언:\n\n1. 목표를 명확히 설정하고 단계별로 계획 수립\n2. 지속적인 학습과 스킬 개발\n3. 포트폴리오와 이력서를 꾸준히 업데이트\n4. 다양한 회사에 지원하여 경험 쌓기\n5. 면접 연습과 피드백 수집\n6. 긍정적인 마인드와 인내심 유지\n7. 네트워킹을 통한 정보 수집'
    }
];

// 챗봇 초기화
function initChatbot() {
    const input = document.getElementById('chatbotInput');
    const sendBtn = document.getElementById('chatbotSendBtn');
    const messagesContainer = document.getElementById('chatbotMessages');
    
    if (!input || !sendBtn || !messagesContainer) return;
    
    // 전송 버튼 클릭
    sendBtn.addEventListener('click', sendMessage);
    
    // Enter 키 입력
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    
    // 메시지 전송 함수
    function sendMessage() {
        const message = input.value.trim();
        if (!message) return;
        
        // 사용자 메시지 표시
        addMessage(message, 'user');
        input.value = '';
        
        // 챗봇 응답 생성 (약간의 딜레이로 자연스럽게)
        setTimeout(() => {
            const response = findBestResponse(message);
            addMessage(response, 'bot');
        }, 500);
    }
    
    // 메시지 추가 함수
    function addMessage(text, type) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}-message`;
        
        const avatar = type === 'user' ? '👤' : '🤖';
        const time = getCurrentTime();
        
        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-text">${escapeHtml(text).replace(/\n/g, '<br>')}</div>
                <div class="message-time">${time}</div>
            </div>
        `;
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // 최적의 응답 찾기
    function findBestResponse(userMessage) {
        const lowerMessage = userMessage.toLowerCase();
        let bestMatch = null;
        let maxScore = 0;
        
        // 각 QA 항목과 유사도 계산
        chatbotQA.forEach(qa => {
            let score = 0;
            qa.keywords.forEach(keyword => {
                if (lowerMessage.includes(keyword.toLowerCase())) {
                    score += keyword.length; // 키워드 길이만큼 점수 추가
                }
            });
            
            if (score > maxScore) {
                maxScore = score;
                bestMatch = qa;
            }
        });
        
        // 매칭되는 답변이 있으면 반환
        if (bestMatch && maxScore > 0) {
            return bestMatch.answer;
        }
        
        // 매칭되는 답변이 없으면 기본 응답
        return '죄송합니다. 질문을 정확히 이해하지 못했습니다. 다른 방식으로 질문해주시거나, 다음과 같은 주제에 대해 물어보실 수 있습니다:\n\n• 자기소개서 작성\n• 면접 준비\n• 포트폴리오\n• 이력서 작성\n• 지원 동기\n• 강점 어필\n\n더 구체적으로 질문해주시면 더 정확한 답변을 드릴 수 있습니다!';
    }
    
    // 현재 시간 포맷
    function getCurrentTime() {
        const now = new Date();
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    }
    
    // HTML 이스케이프
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

