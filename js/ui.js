// UI 관리 클래스
class UIManager {
    constructor() {
        this.modalTimer = null;
    }

    // 화면 전환 함수
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(el => {
            el.style.display = 'none';
            el.classList.remove('active');
        });
        const target = document.getElementById(screenId);
        if (target) {
            target.style.display = 'flex';
            target.classList.add('active');
        }
    }

    // 문제 표시 업데이트
    updateQuestionDisplay(currentFraction, currentQuestion, totalQuestions) {
        const questionText = FractionFormatter.formatFraction(currentFraction);
        document.getElementById('question-text').innerHTML = `${questionText}을 채워보세요!`;
        document.getElementById('question-progress').textContent = 
            `${currentQuestion} / ${totalQuestions}`;
    }

    // 피드백 영역 업데이트
    updateFeedback(gameState, settings) {
        // 진행 상황 업데이트
        const progressDisplay = document.getElementById('progress-display');
        if (progressDisplay) {
            progressDisplay.textContent = `문제 ${gameState.currentQuestion}/${settings.totalQuestions}`;
        }
        
        // 시간 표시 업데이트
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${gameState.timeLeft}초`;
            
            // 시간이 10초 이하일 때 경고 스타일
            if (gameState.timeLeft <= 10) {
                timeDisplay.classList.add('warning');
            } else {
                timeDisplay.classList.remove('warning');
            }
        }
        
        // 격려 메시지 랜덤 변경 (가끔씩)
        if (Math.random() < 0.1) { // 10% 확률로 메시지 변경
            const encouragements = [
                "감각으로 분수의 크기를 느껴보세요!",
                "정확히 맞추려고 하지 말고 어림해보세요!",
                "분수를 시각적으로 이해해보세요!",
                "천천히 생각하며 채워보세요!",
                "직감을 믿고 도형을 채워보세요!"
            ];
            const encouragementText = document.getElementById('encouragement-text');
            if (encouragementText) {
                encouragementText.textContent = encouragements[Math.floor(Math.random() * encouragements.length)];
            }
        }
    }

    // 타이머 표시 업데이트
    updateTimerDisplay(timeLeft) {
        document.getElementById('timer').textContent = `⏱ ${timeLeft}초`;
        
        if (timeLeft <= 5) {
            document.getElementById('timer').classList.add('timer-warning');
        }
    }

    // 건너뛰기 버튼 업데이트
    updateSkipButton(skipAllowed, skipUsed, skipCount) {
        const skipBtn = document.getElementById('skip-btn');
        const skipCountDisplay = document.getElementById('skip-count-display');
        const remaining = skipCount - skipUsed;
        
        skipCountDisplay.textContent = remaining;
        
        if (!skipAllowed || remaining <= 0) {
            skipBtn.disabled = true;
            skipBtn.style.opacity = '0.5';
        }
    }

    // 도형 추가 버튼 표시/숨김
    updateAddShapeButtonVisibility(currentFraction) {
        const addShapeBtn = document.getElementById('add-shape-btn');
        const shapeControls = document.querySelector('.shape-controls');
        
        if (!addShapeBtn || !shapeControls) return;
        
        // 대분수 문제일 때만 "도형 추가" 버튼 표시
        if (currentFraction.wholeNumber > 0) {
            shapeControls.style.display = 'flex';
            addShapeBtn.style.display = 'inline-block';
        } else {
            shapeControls.style.display = 'none';
            addShapeBtn.style.display = 'none';
        }
    }

    // 설명 표시
    showExplanation(currentFraction) {
        const explanationDiv = document.getElementById('explanation');
        const fraction = currentFraction;
        
        let text = '';
        if (fraction.wholeNumber > 0) {
            text = `${FractionFormatter.formatFraction(fraction)}은 ${fraction.wholeNumber}과, 1을 ${fraction.denominator}로 나눈 것 중 ${fraction.numerator}입니다.`;
        } else {
            text = `${FractionFormatter.formatFraction(fraction)}은 1을 ${fraction.denominator}로 나눈 것 중 ${fraction.numerator}입니다.`;
        }
        
        explanationDiv.querySelector('p').innerHTML = text;
        explanationDiv.style.display = 'block';
    }

    // 설명 숨김
    hideExplanation() {
        document.getElementById('explanation').style.display = 'none';
    }

    // 점수 모달 표시
    showScoreModal(scoreData, currentFraction) {
        const modal = document.getElementById('score-modal');
        if (!modal) {
            console.warn('Score modal not found');
            return;
        }
        
        // 점수 데이터 표시
        const totalScoreElement = document.getElementById('modal-total-score');
        const accuracyElement = document.getElementById('modal-accuracy-score');
        const timeElement = document.getElementById('modal-time-bonus');
        const streakElement = document.getElementById('modal-streak-bonus');
        const streakItem = document.getElementById('streak-bonus-item');
        const targetAnswerElement = document.getElementById('modal-target-answer');
        
        if (totalScoreElement) totalScoreElement.textContent = `${scoreData.totalScore}점`;
        if (accuracyElement) accuracyElement.textContent = `${scoreData.accuracyScore}점`;
        if (timeElement) timeElement.textContent = `+${scoreData.timeScore}점`;
        if (streakElement) streakElement.textContent = `+${scoreData.streakScore}점`;
        
        // 연속 보너스가 있을 때만 표시
        if (streakItem) {
            if (scoreData.streakScore > 0) {
                streakItem.style.display = 'flex';
            } else {
                streakItem.style.display = 'none';
            }
        }
        
        if (targetAnswerElement) {
            targetAnswerElement.innerHTML = FractionFormatter.formatFraction(currentFraction);
        }
        
        // 모달 표시
        modal.classList.add('show');
        
        return modal;
    }

    // 점수 모달 숨김
    hideScoreModal() {
        const modal = document.getElementById('score-modal');
        if (modal) {
            modal.classList.remove('show');
        }
        
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
            this.modalTimer = null;
        }
    }

    // 모달 자동 닫기 타이머 설정
    setModalAutoClose(callback, delay = 3000) {
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
        }
        
        this.modalTimer = setTimeout(() => {
            this.hideScoreModal();
            callback();
        }, delay);
    }

    // 버튼 상태 초기화
    resetButtonStates() {
        const nextBtn = document.getElementById('next-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        if (nextBtn) {
            nextBtn.disabled = false;
            nextBtn.textContent = '다음';
            nextBtn.style.opacity = '1';
        }
        
        if (skipBtn) {
            skipBtn.disabled = false;
            skipBtn.style.opacity = '1';
        }
    }

    // 처리 중 상태 설정
    setProcessingState(isProcessing) {
        const nextBtn = document.getElementById('next-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        if (nextBtn) {
            nextBtn.disabled = isProcessing;
            nextBtn.textContent = isProcessing ? '처리중...' : '다음';
            nextBtn.style.opacity = isProcessing ? '0.6' : '1';
        }
        
        if (skipBtn) {
            skipBtn.disabled = isProcessing;
            skipBtn.style.opacity = isProcessing ? '0.6' : '1';
        }
    }

    // 타이머 경고 제거
    removeTimerWarning() {
        document.getElementById('timer').classList.remove('timer-warning');
    }

    // 저장소 삭제 확인 대화상자
    confirmClearStorage() {
        const savedResults = LocalStorageManager.getStoredResults();
        const count = savedResults.length;
        
        if (count === 0) {
            alert('저장된 기록이 없습니다.');
            return false;
        }
        
        const confirmed = confirm(`저장된 ${count}개의 게임 기록을 모두 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        
        if (confirmed) {
            LocalStorageManager.clearStorage();
            alert('모든 저장 기록이 삭제되었습니다.');
            return true;
        }
        
        return false;
    }

    // 터치 효과 애니메이션
    showTapEffect(shapeElement, clientX, clientY) {
        const rect = shapeElement.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        
        const effect = document.createElement('div');
        effect.style.position = 'absolute';
        effect.style.left = `${x - 10}px`;
        effect.style.top = `${y - 10}px`;
        effect.style.width = '20px';
        effect.style.height = '20px';
        effect.style.borderRadius = '50%';
        effect.style.background = 'radial-gradient(circle, #4CAF50, #2E7D32)';
        effect.style.pointerEvents = 'none';
        effect.style.animation = 'tapEffect 0.6s ease-out forwards';
        effect.style.zIndex = '100';
        
        shapeElement.style.position = 'relative';
        shapeElement.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 600);
    }

    // 모드 툴팁 생성
    createModeTooltip(mode) {
        const tooltip = document.createElement('div');
        tooltip.className = 'mode-tooltip';
        
        const tooltipTexts = {
            'drag': '드래그하여 채우기',
            'tap': '연속 터치로 조금씩 채우기'
        };
        
        tooltip.textContent = tooltipTexts[mode] || '클릭하여 채우기';
        return tooltip;
    }
}
