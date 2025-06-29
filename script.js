// 게임 상태 관리
class FractionGame {
    constructor() {
        this.settings = {
            difficulty: 'medium',
            shapeRandom: true,
            timeLimit: 30,
            streakMode: false,
            answerMode: 'manual',
            totalQuestions: 10,
            skipAllowed: true,
            skipCount: 3,
            hideAnswers: false,
            mixedNumberRatio: 30,    // 대분수 출현 비율 (%)
            mixedNumberMax: 3        // 대분수 자연수 최대값
        };
        
        this.gameState = {
            currentQuestion: 0,
            score: 0,
            streak: 0,
            timeLeft: 30,
            isPlaying: false,
            isProcessing: false,
            skipUsed: 0,
            userAnswers: [],
            results: []
        };
        
        this.currentFraction = { numerator: 0, denominator: 1, wholeNumber: 0 };
        this.userFillAmounts = []; // 각 도형별 채운 양
        this.shapesData = []; // 각 도형의 데이터
        this.timer = null; // 게임 타이머
        this.modalTimer = null; // 점수 모달 타이머
        this.timer = null;
        this.currentShape = 'circle';
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupSettingsPreview();
        this.showScreen('settings-screen');
    }
    
    bindEvents() {
        // 설정 화면 이벤트
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('help-btn').addEventListener('click', () => this.showTutorial());
        
        // 튜토리얼 화면 이벤트
        document.getElementById('tutorial-close').addEventListener('click', () => this.closeTutorial());
        
        // 게임 화면 이벤트
        document.getElementById('reset-btn').addEventListener('click', () => this.resetShape());
        document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        document.getElementById('next-btn').addEventListener('click', () => this.manualNextQuestion());
        document.getElementById('add-shape-btn').addEventListener('click', () => this.addShape());
        
        // 결과 화면 이벤트
        document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        document.getElementById('new-settings-btn').addEventListener('click', () => this.newSettings());
        
        // 도형 인터랙션 이벤트
        this.bindShapeEvents();
        
        // 모달 이벤트 설정
        this.setupModalEvents();
    }
    
    bindShapeEvents() {
        // 이벤트는 동적으로 생성되는 도형에 위임방식으로 바인딩
        const shapeContainer = document.getElementById('shape-container');
        let isMouseDown = false;
        let currentShapeIndex = -1;
        
        shapeContainer.addEventListener('mousedown', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            isMouseDown = true;
            const indexStr = shapeElement.dataset.index;
            currentShapeIndex = parseInt(indexStr);
            
            // 유효성 검사
            if (isNaN(currentShapeIndex) || currentShapeIndex < 0) {
                console.warn(`Invalid shape index: ${indexStr}`);
                currentShapeIndex = -1;
                isMouseDown = false;
                return;
            }
            
            const rect = shapeElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.updateShapeFill(currentShapeIndex, x, y, rect);
        });
        
        shapeContainer.addEventListener('mousemove', (e) => {
            if (!isMouseDown || !this.gameState.isPlaying || currentShapeIndex === -1) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const elementIndex = parseInt(shapeElement.dataset.index);
            if (isNaN(elementIndex) || elementIndex !== currentShapeIndex) return;
            
            const rect = shapeElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.updateShapeFill(currentShapeIndex, x, y, rect);
        });
        
        shapeContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
            currentShapeIndex = -1;
        });
        
        // 터치 이벤트
        shapeContainer.addEventListener('touchstart', (e) => {
            if (!this.gameState.isPlaying) return;
            e.preventDefault();
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const indexStr = shapeElement.dataset.index;
            currentShapeIndex = parseInt(indexStr);
            
            // 유효성 검사
            if (isNaN(currentShapeIndex) || currentShapeIndex < 0) {
                console.warn(`Invalid shape index in touch: ${indexStr}`);
                currentShapeIndex = -1;
                return;
            }
            
            const rect = shapeElement.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.updateShapeFill(currentShapeIndex, x, y, rect);
        });
        
        shapeContainer.addEventListener('touchmove', (e) => {
            if (!this.gameState.isPlaying || currentShapeIndex === -1) return;
            e.preventDefault();
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const elementIndex = parseInt(shapeElement.dataset.index);
            if (isNaN(elementIndex) || elementIndex !== currentShapeIndex) return;
            
            const rect = shapeElement.getBoundingClientRect();
            const touch = e.touches[0];
            const x = touch.clientX - rect.left;
            const y = touch.clientY - rect.top;
            
            this.updateShapeFill(currentShapeIndex, x, y, rect);
        });
        
        shapeContainer.addEventListener('touchend', () => {
            currentShapeIndex = -1;
        });
    }
    
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
    
    showTutorial() {
        this.showScreen('tutorial-screen');
    }
    
    closeTutorial() {
        this.showScreen('settings-screen');
    }
    
    loadSettings() {
        this.settings.difficulty = document.getElementById('difficulty').value;
        this.settings.shapeRandom = document.getElementById('shape-random').value === 'true';
        this.settings.timeLimit = parseInt(document.getElementById('time-limit').value);
        this.settings.streakMode = document.getElementById('streak-mode').value === 'true';
        this.settings.answerMode = document.getElementById('answer-mode').value;
        this.settings.totalQuestions = parseInt(document.getElementById('total-questions').value);
        this.settings.skipAllowed = document.getElementById('skip-allowed').value === 'true';
        this.settings.skipCount = parseInt(document.getElementById('skip-count').value);
        this.settings.hideAnswers = document.getElementById('hide-answers').value === 'true';
        
        // 대분수 설정값 읽기 및 유효성 검사
        this.settings.mixedNumberRatio = Math.max(0, Math.min(100, parseInt(document.getElementById('mixed-number-ratio').value) || 30));
        this.settings.mixedNumberMax = Math.max(1, Math.min(10, parseInt(document.getElementById('mixed-number-max').value) || 3));
        
        // 설정값 검증 및 조정
        this.validateSettings();
    }
    
    validateSettings() {
        // 대분수 비율이 0%인 경우 경고 표시
        if (this.settings.mixedNumberRatio === 0) {
            console.log('대분수가 출현하지 않도록 설정되었습니다.');
        }
        
        // 대분수 비율이 100%인 경우 안내
        if (this.settings.mixedNumberRatio === 100) {
            console.log('모든 문제가 대분수로 출제됩니다.');
        }
        
        // 대분수 최대값이 클 경우 경고
        if (this.settings.mixedNumberMax > 5) {
            console.log(`대분수 자연수가 최대 ${this.settings.mixedNumberMax}까지 나올 수 있어 난이도가 높을 수 있습니다.`);
        }
    }
    
    startGame() {
        this.loadSettings();
        this.resetGameState();
        this.showScreen('game-screen');
        this.generateQuestion();
        this.startTimer();
    }
    
    resetGameState() {
        this.gameState = {
            currentQuestion: 0,
            score: 0,
            streak: 0,
            timeLeft: this.settings.timeLimit,
            isPlaying: true,
            isProcessing: false,
            skipUsed: 0,
            userAnswers: [],
            results: []
        };
        
        this.userFillAmounts = [];
        this.shapesData = [];
        this.updateSkipButton();
    }
    
    generateQuestion() {
        this.gameState.currentQuestion++;
        
        // 분수 생성
        this.currentFraction = this.generateFraction();
        
        // 도형 선택
        if (this.settings.shapeRandom) {
            const shapes = ['circle', 'rectangle', 'cup'];
            this.currentShape = shapes[Math.floor(Math.random() * shapes.length)];
        }
        
        // UI 업데이트
        this.updateQuestionDisplay();
        this.createShape();
        this.resetShape();
        this.updateAddShapeButtonVisibility();
        this.updateFeedback(); // 피드백 영역 초기화
        
        // 타이머 리셋
        this.gameState.timeLeft = this.settings.timeLimit;
        this.startTimer();
    }
    
    generateFraction() {
        let minDenominator, maxDenominator;
        
        switch (this.settings.difficulty) {
            case 'easy':
                minDenominator = 2;
                maxDenominator = 4;
                break;
            case 'medium':
                minDenominator = 5;
                maxDenominator = 8;
                break;
            case 'hard':
                minDenominator = 9;
                maxDenominator = 12;
                break;
            case 'expert':
                minDenominator = 13;
                maxDenominator = 20;
                break;
        }
        
        let numerator, denominator, wholeNumber;
        let attempts = 0;
        
        do {
            denominator = Math.floor(Math.random() * (maxDenominator - minDenominator + 1)) + minDenominator;
            
            // 설정된 비율에 따라 대분수 생성 여부 결정
            const shouldBeMixed = Math.random() * 100 < this.settings.mixedNumberRatio;
            wholeNumber = shouldBeMixed ? Math.floor(Math.random() * this.settings.mixedNumberMax) + 1 : 0;
            
            numerator = Math.floor(Math.random() * (denominator - 1)) + 1; // 1부터 denominator-1까지
            
            attempts++;
            if (attempts > 100) break; // 무한 루프 방지
            
        } while (this.gcd(numerator, denominator) === denominator); // 기약분수가 1이 되는 경우 제외 (n/n 형태)
        
        return { numerator, denominator, wholeNumber };
    }
    
    // 최대공약수 계산
    gcd(a, b) {
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }
    
    // 분수 단순화
    simplifyFraction(numerator, denominator) {
        const gcdValue = this.gcd(numerator, denominator);
        return {
            numerator: numerator / gcdValue,
            denominator: denominator / gcdValue
        };
    }
    
    updateQuestionDisplay() {
        const questionText = this.formatFraction(this.currentFraction);
        document.getElementById('question-text').textContent = `${questionText}을 채워보세요!`;
        document.getElementById('question-progress').textContent = 
            `${this.gameState.currentQuestion} / ${this.settings.totalQuestions}`;
        document.getElementById('target-fraction').textContent = questionText;
    }
    
    formatFraction(fraction) {
        if (fraction.wholeNumber > 0) {
            return `${fraction.wholeNumber}과 ${fraction.numerator}/${fraction.denominator}`;
        } else {
            return `${fraction.numerator}/${fraction.denominator}`;
        }
    }
    
    createShape() {
        const shapeContainer = document.getElementById('shape-container');
        shapeContainer.innerHTML = '';
        
        this.shapesData = [];
        this.userFillAmounts = [];
        
        // 처음에는 하나의 빈 도형만 제공 (학습 효과 향상)
        this.shapesData.push({
            type: this.currentShape,
            target: 0, // 사용자가 정해야 함
            isWhole: false,
            index: 0
        });
        this.userFillAmounts.push(0);
        
        this.createShapeElements();
    }
    
    createShapeElements() {
        const shapeContainer = document.getElementById('shape-container');
        
        // 기존 도형들 제거하고 새로 생성
        shapeContainer.innerHTML = '';
        
        // 도형들을 행으로 배치 (최대 3개씩)
        let currentRow = null;
        
        this.shapesData.forEach((shapeData, index) => {
            if (index % 3 === 0) {
                currentRow = document.createElement('div');
                currentRow.className = 'shapes-row';
                shapeContainer.appendChild(currentRow);
            }
            
            const shapeWrapper = document.createElement('div');
            shapeWrapper.style.display = 'flex';
            shapeWrapper.style.flexDirection = 'column';
            shapeWrapper.style.alignItems = 'center';
            
            // 라벨 추가
            const label = document.createElement('div');
            label.className = 'shape-label';
            label.textContent = `도형 ${index + 1}`;
            shapeWrapper.appendChild(label);
            
            const shapeElement = this.createSingleShape(shapeData, index);
            shapeWrapper.appendChild(shapeElement);
            
            currentRow.appendChild(shapeWrapper);
        });
    }
    
    createSingleShape(shapeData, index) {
        const shapeDiv = document.createElement('div');
        shapeDiv.className = `shape ${shapeData.type}-shape`;
        shapeDiv.dataset.index = index;
        
        switch (shapeData.type) {
            case 'circle':
                shapeDiv.innerHTML = `
                    <svg viewBox="0 0 200 200" class="shape-svg">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#ddd" stroke-width="2"/>
                        <path id="filled-path-${index}" fill="#4CAF50" opacity="0.7" d=""/>
                        <path id="answer-path-${index}" fill="#FF9800" opacity="0.8" d="" style="display:none"/>
                    </svg>
                `;
                break;
            case 'rectangle':
                shapeDiv.innerHTML = `
                    <div style="width: 200px; height: 200px; border: 2px solid #ddd; position: relative; background: #f9f9f9;">
                        <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 100%; width: 0%; position: absolute; left: 0; top: 0;"></div>
                        <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 100%; width: 0%; position: absolute; left: 0; top: 0; display: none;"></div>
                    </div>
                `;
                break;
            case 'cup':
                shapeDiv.innerHTML = `
                    <div style="width: 200px; height: 200px; border: 2px solid #2196F3; border-top: none; border-radius: 0 0 20px 20px; position: relative; background: linear-gradient(to top, #e3f2fd 0%, #ffffff 100%);">
                        <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 0%; width: 100%; position: absolute; bottom: 0;"></div>
                        <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 0%; width: 100%; position: absolute; bottom: 0; display: none;"></div>
                    </div>
                `;
                break;
        }
        
        return shapeDiv;
    }
    
    // 개별 도형 생성 함수들
    createCircleShape(shapeDiv, index) {
        shapeDiv.className = `shape circle-shape`;
        shapeDiv.id = `shape-${index}`;
        shapeDiv.dataset.index = index; // data-index 속성 추가
        shapeDiv.innerHTML = `
            <svg viewBox="0 0 200 200" class="shape-svg">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#ddd" stroke-width="2"/>
                <path id="filled-path-${index}" fill="#4CAF50" opacity="0.7" d=""/>
                <path id="answer-path-${index}" fill="#FF9800" opacity="0.8" d="" style="display:none"/>
            </svg>
        `;
    }
    
    createRectangleShape(shapeDiv, index) {
        shapeDiv.className = `shape rectangle-shape`;
        shapeDiv.id = `shape-${index}`;
        shapeDiv.dataset.index = index; // data-index 속성 추가
        shapeDiv.innerHTML = `
            <div style="width: 200px; height: 200px; border: 2px solid #ddd; position: relative; background: #f9f9f9;">
                <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 100%; width: 0%; position: absolute; left: 0; top: 0;"></div>
                <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 100%; width: 0%; position: absolute; left: 0; top: 0; display: none;"></div>
            </div>
        `;
    }
    
    createCupShape(shapeDiv, index) {
        shapeDiv.className = `shape cup-shape`;
        shapeDiv.id = `shape-${index}`;
        shapeDiv.dataset.index = index; // data-index 속성 추가
        shapeDiv.innerHTML = `
            <div style="width: 200px; height: 200px; border: 2px solid #2196F3; border-top: none; border-radius: 0 0 20px 20px; position: relative; background: linear-gradient(to top, #e3f2fd 0%, #ffffff 100%);">
                <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 0%; width: 100%; position: absolute; bottom: 0;"></div>
                <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 0%; width: 100%; position: absolute; bottom: 0; display: none;"></div>
            </div>
        `;
    }
    
    updateShapeFill(shapeIndex, x, y, shapeRect) {
        // 유효성 검사 추가
        if (shapeIndex < 0 || shapeIndex >= this.shapesData.length) {
            console.warn(`Invalid shapeIndex: ${shapeIndex}. shapesData length: ${this.shapesData.length}`);
            return;
        }
        
        const shapeData = this.shapesData[shapeIndex];
        if (!shapeData) {
            console.warn(`No shapeData found for index: ${shapeIndex}`);
            return;
        }
        
        if (shapeData.type === 'circle') {
            // 원형은 부채꼴 모양으로 채우기 (마우스 위치와 중심점 사이의 각도 계산)
            const centerX = shapeRect.width / 2;
            const centerY = shapeRect.height / 2;
            
            // 중심점으로부터의 벡터
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            
            // 12시 방향을 0도로 하는 각도 계산
            let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
            // 0~1 범위로 정규화 (360도 넘어가면 1로 제한)
            this.userFillAmounts[shapeIndex] = Math.min(angle / 360, 1);
            this.updateCircleFill(shapeIndex, this.userFillAmounts[shapeIndex]);
            
        } else if (shapeData.type === 'cup') {
            // 물컵은 세로 채우기
            const fillHeight = Math.max(0, Math.min(shapeRect.height - y, shapeRect.height));
            this.userFillAmounts[shapeIndex] = fillHeight / shapeRect.height;
            this.updateCupFill(shapeIndex, this.userFillAmounts[shapeIndex]);
        } else {
            // 직사각형은 가로 드래그
            const fillWidth = Math.max(0, Math.min(x, shapeRect.width));
            this.userFillAmounts[shapeIndex] = fillWidth / shapeRect.width;
            this.updateHorizontalFill(shapeIndex, this.userFillAmounts[shapeIndex]);
        }
        
        this.updateFeedback();
    }
    
    updateCircleFill(shapeIndex, percentage) {
        const filledPath = document.getElementById(`filled-path-${shapeIndex}`);
        if (!filledPath || percentage <= 0) {
            if (filledPath) filledPath.setAttribute('d', '');
            return;
        }
        
        const angle = percentage * 360;
        const radius = 90;
        const centerX = 100;
        const centerY = 100;
        
        // 시작점 (12시 방향)
        const startX = centerX;
        const startY = centerY - radius;
        
        if (angle >= 360) {
            // 완전한 원
            filledPath.setAttribute('d', `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`);
        } else {
            // 부채꼴
            const endAngle = (angle - 90) * (Math.PI / 180);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            filledPath.setAttribute('d', 
                `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
            );
        }
    }
    
    updateHorizontalFill(shapeIndex, percentage) {
        const filledElement = document.getElementById(`filled-rect-${shapeIndex}`);
        if (!filledElement) return;
        
        const shapeData = this.shapesData[shapeIndex];
        
        if (shapeData.type === 'rectangle') {
            // HTML div 요소의 width 스타일 업데이트
            filledElement.style.width = `${percentage * 100}%`;
        }
    }
    
    updateCupFill(shapeIndex, percentage) {
        const filledElement = document.getElementById(`filled-rect-${shapeIndex}`);
        if (filledElement) {
            filledElement.style.height = `${percentage * 100}%`;
        }
    }
    
    updateFeedback() {
        // 진행 상황 업데이트
        const progressDisplay = document.getElementById('progress-display');
        if (progressDisplay) {
            progressDisplay.textContent = `문제 ${this.gameState.currentQuestion}/${this.settings.totalQuestions}`;
        }
        
        // 시간 표시 업데이트
        const timeDisplay = document.getElementById('time-display');
        if (timeDisplay) {
            timeDisplay.textContent = `${this.gameState.timeLeft}초`;
            
            // 시간이 10초 이하일 때 경고 스타일
            if (this.gameState.timeLeft <= 10) {
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
    
    calculateTotalUserValue() {
        let total = 0;
        this.shapesData.forEach((shapeData, index) => {
            if (shapeData.isWhole) {
                // 전체 도형: 사용자가 채운 비율 그대로 더함 (0~1)
                total += this.userFillAmounts[index];
            } else {
                // 분수 부분 도형: 사용자가 채운 비율을 그대로 더함 (0~1)
                total += this.userFillAmounts[index];
            }
        });
        return total;
    }
    
    convertToFraction(decimal) {
        if (decimal <= 0) {
            return { wholeNumber: 0, numerator: 0, denominator: 1 };
        }
        
        const wholeNumber = Math.floor(decimal);
        const fractionalPart = decimal - wholeNumber;
        
        if (fractionalPart === 0) {
            return { wholeNumber: wholeNumber, numerator: 0, denominator: 1 };
        }
        
        // 일반적인 분수들을 우선적으로 체크 (정확도 향상)
        const commonFractions = [
            {num: 1, den: 2, val: 0.5},      // 1/2
            {num: 1, den: 3, val: 0.333},    // 1/3
            {num: 2, den: 3, val: 0.667},    // 2/3
            {num: 1, den: 4, val: 0.25},     // 1/4
            {num: 3, den: 4, val: 0.75},     // 3/4
            {num: 1, den: 5, val: 0.2},      // 1/5
            {num: 2, den: 5, val: 0.4},      // 2/5
            {num: 3, den: 5, val: 0.6},      // 3/5
            {num: 4, den: 5, val: 0.8},      // 4/5
            {num: 1, den: 6, val: 0.167},    // 1/6
            {num: 5, den: 6, val: 0.833},    // 5/6
            {num: 1, den: 8, val: 0.125},    // 1/8
            {num: 3, den: 8, val: 0.375},    // 3/8
            {num: 5, den: 8, val: 0.625},    // 5/8
            {num: 7, den: 8, val: 0.875}     // 7/8
        ];
        
        // 가장 가까운 일반 분수 찾기
        let bestMatch = null;
        let minError = Infinity;
        
        for (let frac of commonFractions) {
            const error = Math.abs(fractionalPart - frac.val);
            if (error < minError && error < 0.05) { // 5% 오차 이내
                minError = error;
                bestMatch = frac;
            }
        }
        
        if (bestMatch) {
            return {
                wholeNumber: wholeNumber,
                numerator: bestMatch.num,
                denominator: bestMatch.den
            };
        }
        
        // 일반 분수가 없으면 기존 방식 사용
        let bestNumerator = 1;
        let bestDenominator = 1;
        minError = Math.abs(fractionalPart - 1);
        
        for (let denominator = 2; denominator <= 12; denominator++) {
            const numerator = Math.round(fractionalPart * denominator);
            if (numerator > 0 && numerator < denominator) {
                const error = Math.abs(fractionalPart - numerator / denominator);
                if (error < minError) {
                    minError = error;
                    bestNumerator = numerator;
                    bestDenominator = denominator;
                }
            }
        }
        
        // 기약분수로 만들기
        const simplified = this.simplifyFraction(bestNumerator, bestDenominator);
        
        return {
            wholeNumber: wholeNumber,
            numerator: simplified.numerator,
            denominator: simplified.denominator
        };
    }
    
    resetShape() {
        if (this.userFillAmounts.length > 0) {
            this.userFillAmounts.fill(0);
        }
        
        this.shapesData.forEach((shapeData, index) => {
            if (shapeData.type === 'circle') {
                const filledPath = document.getElementById(`filled-path-${index}`);
                if (filledPath) filledPath.setAttribute('d', '');
            } else if (shapeData.type === 'cup') {
                const filledElement = document.getElementById(`filled-rect-${index}`);
                if (filledElement) filledElement.style.height = '0%';
            } else {
                this.updateHorizontalFill(index, 0);
            }
        });
        
        // user-fraction 요소가 제거되었으므로 해당 코드 제거
        // document.getElementById('user-fraction').textContent = '-';
    }
    
    skipQuestion() {
        // 연속 클릭 방지
        if (this.gameState.isProcessing) {
            return;
        }
        
        if (!this.settings.skipAllowed || this.gameState.skipUsed >= this.settings.skipCount) {
            return;
        }
        
        // 처리 중 상태로 설정
        this.gameState.isProcessing = true;
        const skipBtn = document.getElementById('skip-btn');
        skipBtn.disabled = true;
        skipBtn.style.opacity = '0.6';
        
        this.gameState.skipUsed++;
        this.updateSkipButton();
        
        // 결과 기록 (건너뛴 문제)
        this.gameState.results.push({
            question: this.gameState.currentQuestion,
            target: this.formatFraction(this.currentFraction),
            userAnswer: '건너뜀',
            score: 0,
            skipped: true
        });
        
        // 건너뛴 문제만큼 총 문제 수 증가
        this.settings.totalQuestions++;
        
        this.moveToNextQuestion();
    }
    
    updateSkipButton() {
        const skipBtn = document.getElementById('skip-btn');
        const skipCountDisplay = document.getElementById('skip-count-display');
        const remaining = this.settings.skipCount - this.gameState.skipUsed;
        
        skipCountDisplay.textContent = remaining;
        
        if (!this.settings.skipAllowed || remaining <= 0) {
            skipBtn.disabled = true;
            skipBtn.style.opacity = '0.5';
        }
    }
    
    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.gameState.timeLeft--;
            this.updateTimerDisplay();
            
            if (this.gameState.timeLeft <= 5) {
                document.getElementById('timer').classList.add('timer-warning');
            }
            
            if (this.gameState.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }
    
    updateTimerDisplay() {
        document.getElementById('timer').textContent = `⏱ ${this.gameState.timeLeft}초`;
        this.updateFeedback(); // 피드백 영역의 시간 표시도 업데이트
    }
    
    timeUp() {
        clearInterval(this.timer);
        this.gameState.isPlaying = false;
        
        // 정답 표시
        this.showAnswer();
        
        // 점수 계산
        const scoreData = this.calculateScore();
        
        // 결과 기록
        this.gameState.results.push({
            question: this.currentQuestion,
            target: this.formatFraction(this.currentFraction),
            userAnswer: this.formatFraction(this.convertToFraction(this.calculateTotalUserValue())),
            score: scoreData.total,
            accuracyScore: scoreData.accuracy,
            timeBonus: scoreData.timeBonus,
            streakBonus: scoreData.streakBonus,
            skipped: false
        });
        
        // 점수 팝업 표시 (피드백 영역에는 표시하지 않음)
        this.showScoreModal(scoreData);
        
        // 설명 표시
        if (!this.settings.hideAnswers) {
            this.showExplanation();
        }
        
        // 자동 전환은 팝업에서 처리됨
    }
    
    showAnswer() {
        // 실제 정답 값 계산
        const targetValue = this.currentFraction.wholeNumber + this.currentFraction.numerator / this.currentFraction.denominator;
        
        // 현재 도형들의 총 개수
        const totalShapes = this.shapesData.length;
        
        // 각 도형당 보여줄 정답 비율 계산
        let remainingValue = targetValue;
        
        this.shapesData.forEach((shapeData, index) => {
            let answerRatio = 0;
            
            if (remainingValue >= 1) {
                answerRatio = 1; // 완전히 채움
                remainingValue -= 1;
            } else if (remainingValue > 0) {
                answerRatio = remainingValue; // 남은 만큼만 채움
                remainingValue = 0;
            }
            
            if (shapeData.type === 'circle') {
                const answerPath = document.getElementById(`answer-path-${index}`);
                if (answerPath) {
                    answerPath.style.display = 'block';
                    this.updateCircleAnswer(index, answerRatio);
                }
            } else {
                const answerElement = document.getElementById(`answer-rect-${index}`);
                if (!answerElement) return;
                
                answerElement.style.display = 'block';
                
                if (shapeData.type === 'cup') {
                    // 물컵은 세로 채우기
                    answerElement.style.height = `${Math.min(answerRatio * 100, 100)}%`;
                } else {
                    // 직사각형은 가로 채우기
                    answerElement.style.width = `${Math.min(answerRatio * 100, 100)}%`;
                }
            }
        });
    }
    
    updateCircleAnswer(shapeIndex, percentage) {
        const answerPath = document.getElementById(`answer-path-${shapeIndex}`);
        if (!answerPath || percentage <= 0) {
            if (answerPath) answerPath.setAttribute('d', '');
            return;
        }
        
        const angle = Math.min(percentage * 360, 360);
        const radius = 90;
        const centerX = 100;
        const centerY = 100;
        
        // 시작점 (12시 방향)
        const startX = centerX;
        const startY = centerY - radius;
        
        if (angle >= 360) {
            // 완전한 원
            answerPath.setAttribute('d', `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`);
        } else {
            // 부채꼴
            const endAngle = (angle - 90) * (Math.PI / 180);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            answerPath.setAttribute('d', 
                `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
            );
        }
    }
    
    calculateScore() {
        const targetValue = this.currentFraction.wholeNumber + this.currentFraction.numerator / this.currentFraction.denominator;
        const userValue = this.calculateTotalUserValue();
        
        const error = Math.abs(targetValue - userValue) / Math.max(targetValue, 1);
        const accuracy = Math.max(0, 1 - error);
        
        // 기본 점수 (정확도 기반, 0-80점)
        const accuracyScore = Math.round(accuracy * 80);
        
        // 시간 보너스 (0-15점)
        const timeBonus = Math.round((this.gameState.timeLeft / this.settings.timeLimit) * 15);
        
        // 연속 정답 보너스 (최대 5점)
        let streakBonus = 0;
        if (this.settings.streakMode && accuracy > 0.8) {
            this.gameState.streak++;
            streakBonus = Math.min(this.gameState.streak, 5);
        } else {
            this.gameState.streak = 0;
        }
        
        const totalScore = Math.min(100, Math.max(0, accuracyScore + timeBonus + streakBonus));
        
        return {
            total: totalScore,
            accuracy: accuracyScore,
            timeBonus: timeBonus,
            streakBonus: streakBonus
        };
    }
    
    showExplanation() {
        const explanationDiv = document.getElementById('explanation');
        const fraction = this.currentFraction;
        
        let text = '';
        if (fraction.wholeNumber > 0) {
            text = `${this.formatFraction(fraction)}은 ${fraction.wholeNumber}과, 1을 ${fraction.denominator}로 나눈 것 중 ${fraction.numerator}입니다.`;
        } else {
            text = `${this.formatFraction(fraction)}은 1을 ${fraction.denominator}로 나눈 것 중 ${fraction.numerator}입니다.`;
        }
        
        explanationDiv.querySelector('p').textContent = text;
        explanationDiv.style.display = 'block';
    }
    
    nextQuestion() {
        console.log('nextQuestion called');
        document.getElementById('timer').classList.remove('timer-warning');
        document.getElementById('explanation').style.display = 'none';
        
        // 정답 표시 숨기기
        this.shapesData.forEach((shapeData, index) => {
            if (shapeData.type === 'circle') {
                const answerPath = document.getElementById(`answer-path-${index}`);
                if (answerPath) answerPath.style.display = 'none';
            } else {
                const answerElement = document.getElementById(`answer-rect-${index}`);
                if (answerElement) answerElement.style.display = 'none';
            }
        });
        
        this.moveToNextQuestion();
    }
    
    moveToNextQuestion() {
        console.log('moveToNextQuestion called');
        console.log('currentQuestion:', this.gameState.currentQuestion);
        console.log('totalQuestions:', this.settings.totalQuestions);
        
        // 버튼 상태 초기화
        const nextBtn = document.getElementById('next-btn');
        const skipBtn = document.getElementById('skip-btn');
        
        nextBtn.disabled = false;
        nextBtn.textContent = '다음';
        nextBtn.style.opacity = '1';
        
        skipBtn.disabled = false;
        skipBtn.style.opacity = '1';
        
        this.gameState.isProcessing = false;
        
        if (this.gameState.currentQuestion >= this.settings.totalQuestions) {
            console.log('Game ending - calling endGame');
            this.endGame();
        } else {
            console.log('Generating next question');
            this.gameState.isPlaying = true;
            this.generateQuestion();
        }
    }
    
    endGame() {
        clearInterval(this.timer);
        this.showResults();
    }
    
    showResults() {
        this.showScreen('result-screen');
        
        // 통계 계산
        const validResults = this.gameState.results.filter(r => !r.skipped);
        const totalScore = validResults.length > 0 ? 
            Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length) : 0;
        const correctCount = this.gameState.results.filter(r => !r.skipped && r.score >= 60).length;
        const avgAccuracy = Math.round((correctCount / this.settings.totalQuestions) * 100);
        
        // 대분수 통계 계산
        const mixedNumberCount = this.gameState.results.filter(r => 
            r.target && r.target.includes('과')
        ).length;
        const mixedNumberPercentage = Math.round((mixedNumberCount / this.settings.totalQuestions) * 100);
        
        // 결과 표시
        document.getElementById('total-problems').textContent = this.settings.totalQuestions;
        document.getElementById('correct-count').textContent = correctCount;
        document.getElementById('avg-accuracy').textContent = `${avgAccuracy}%`;
        document.getElementById('total-score').textContent = `${totalScore}점`;
        
        // 대분수 통계 표시 (결과 화면에 추가 정보로)
        console.log(`대분수 문제: ${mixedNumberCount}개 (${mixedNumberPercentage}%)`);
        console.log(`설정 대분수 비율: ${this.settings.mixedNumberRatio}%`);
        
        // 상세 결과 표시
        this.showDetailedResults();
        
        // 로컬 저장
        this.saveResults();
    }
    
    showDetailedResults() {
        const detailsContainer = document.getElementById('problem-details');
        detailsContainer.innerHTML = '';
        
        this.gameState.results.forEach((result, index) => {
            const item = document.createElement('div');
            item.className = 'problem-detail-item';
            
            let scoreClass = 'score-poor';
            if (result.score >= 80) scoreClass = 'score-excellent';
            else if (result.score >= 60) scoreClass = 'score-good';
            
            const scoreDetail = result.skipped ? '건너뜀' : 
                `${result.score}점 (정확도: ${result.accuracyScore || 0}점, 시간: +${result.timeBonus || 0}점)`;
            
            item.innerHTML = `
                <div class="problem-number">${index + 1}번</div>
                <div class="problem-fraction">${result.target}</div>
                <div class="user-answer">${result.userAnswer}</div>
                <div class="problem-score ${scoreClass}">${scoreDetail}</div>
            `;
            
            detailsContainer.appendChild(item);
        });
    }
    
    saveResults() {
        const results = {
            date: new Date().toISOString(),
            settings: this.settings,
            results: this.gameState.results,
            totalScore: this.gameState.score,
            correctCount: this.gameState.results.filter(r => !r.skipped && r.score >= 60).length
        };
        
        // 로컬 스토리지에 저장
        const savedResults = JSON.parse(localStorage.getItem('fractionGameResults') || '[]');
        savedResults.push(results);
        localStorage.setItem('fractionGameResults', JSON.stringify(savedResults));
    }
    
    restartGame() {
        this.startGame();
    }
    
    newSettings() {
        this.showScreen('settings-screen');
    }
    
    addShape() {
        if (!this.gameState.isPlaying) return;
        
        // 최대 5개까지 도형 추가 가능
        if (this.shapesData.length >= 5) {
            return;
        }
        
        const newIndex = this.shapesData.length;
        
        // 새 도형 데이터 추가
        this.shapesData.push({
            type: this.currentShape,
            target: 0,
            isWhole: false,
            index: newIndex
        });
        this.userFillAmounts.push(0);
        
        // 새 도형만 추가 (기존 도형들은 유지)
        this.addNewShapeElement(newIndex);
    }
    
    addNewShapeElement(index) {
        const shapeContainer = document.getElementById('shape-container');
        const shapeData = this.shapesData[index];
        
        // 현재 행 찾기 또는 새 행 생성
        let currentRow = shapeContainer.querySelector('.shapes-row:last-child');
        const shapesInLastRow = currentRow ? currentRow.children.length : 3;
        
        if (!currentRow || shapesInLastRow >= 3) {
            currentRow = document.createElement('div');
            currentRow.className = 'shapes-row';
            shapeContainer.appendChild(currentRow);
        }
        
        const shapeWrapper = document.createElement('div');
        shapeWrapper.style.display = 'flex';
        shapeWrapper.style.flexDirection = 'column';
        shapeWrapper.style.alignItems = 'center';
        
        const shapeLabel = document.createElement('div');
        shapeLabel.className = 'shape-label';
        shapeLabel.textContent = `도형 ${index + 1}`;
        
        const shapeDiv = document.createElement('div');
        shapeDiv.className = 'shape';
        shapeDiv.id = `shape-${index}`;
        
        if (shapeData.type === 'circle') {
            this.createCircleShape(shapeDiv, index);
        } else if (shapeData.type === 'rectangle') {
            this.createRectangleShape(shapeDiv, index);
        } else if (shapeData.type === 'cup') {
            this.createCupShape(shapeDiv, index);
        }
        
        shapeWrapper.appendChild(shapeLabel);
        shapeWrapper.appendChild(shapeDiv);
        currentRow.appendChild(shapeWrapper);
    }
    
    manualNextQuestion() {
        // 연속 클릭 방지: 이미 처리 중이거나 버튼이 비활성화된 경우 무시
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn.disabled || this.gameState.isProcessing) {
            return;
        }
        
        // 처리 중 상태로 설정
        this.gameState.isProcessing = true;
        nextBtn.disabled = true;
        nextBtn.textContent = '처리중...';
        nextBtn.style.opacity = '0.6';
        
        if (!this.gameState.isPlaying) {
            // 이미 시간이 다 되어 점수가 계산된 경우
            this.nextQuestion();
            return;
        }
        
        // 수동으로 다음 버튼을 누른 경우 점수 계산
        clearInterval(this.timer);
        this.gameState.isPlaying = false;
        
        // 정답 표시
        this.showAnswer();
        
        // 점수 계산
        const scoreData = this.calculateScore();
        
        // 결과 기록
        this.gameState.results.push({
            question: this.gameState.currentQuestion,
            target: this.formatFraction(this.currentFraction),
            userAnswer: this.formatFraction(this.convertToFraction(this.calculateTotalUserValue())),
            score: scoreData.total,
            accuracyScore: scoreData.accuracy,
            timeBonus: scoreData.timeBonus,
            streakBonus: scoreData.streakBonus,
            skipped: false
        });
        
        // 점수 팝업 표시 (피드백 영역에는 표시하지 않음)
        this.showScoreModal(scoreData);
        
        // 설명 표시
        if (!this.settings.hideAnswers) {
            this.showExplanation();
        }
        
        // 팝업에서 자동으로 3초 후 다음 문제로 이동
    }
    
    updateAddShapeButtonVisibility() {
        const addShapeBtn = document.getElementById('add-shape-btn');
        const shapeControls = document.querySelector('.shape-controls');
        
        // 대분수 문제인지 확인 (wholeNumber > 0)
        if (this.currentFraction && this.currentFraction.wholeNumber > 0) {
            if (shapeControls) shapeControls.style.display = 'flex';
            if (addShapeBtn) addShapeBtn.style.display = 'block';
        } else {
            if (shapeControls) shapeControls.style.display = 'none';
            if (addShapeBtn) addShapeBtn.style.display = 'none';
        }
    }
    
    showScoreModal(scoreData) {
        const modal = document.getElementById('score-modal');
        const totalScoreElement = document.getElementById('modal-total-score');
        const accuracyScoreElement = document.getElementById('modal-accuracy-score');
        const timeBonusElement = document.getElementById('modal-time-bonus');
        const streakBonusElement = document.getElementById('modal-streak-bonus');
        const streakBonusItem = document.getElementById('streak-bonus-item');
        const targetAnswerElement = document.getElementById('modal-target-answer');
        
        // 점수 데이터 표시
        totalScoreElement.textContent = `${scoreData.total}점`;
        accuracyScoreElement.textContent = `${scoreData.accuracy}점`;
        timeBonusElement.textContent = `+${scoreData.timeBonus}점`;
        
        // 연속 보너스가 있는 경우만 표시
        if (scoreData.streakBonus > 0) {
            streakBonusElement.textContent = `+${scoreData.streakBonus}점`;
            streakBonusItem.style.display = 'flex';
        } else {
            streakBonusItem.style.display = 'none';
        }
        
        // 정답 표시
        targetAnswerElement.textContent = this.formatFraction(this.currentFraction);
        
        // 모달 표시
        modal.classList.add('show');
        
        // 모달이 표시되면 처리 상태 리셋 (사용자가 모달에서 선택할 수 있도록)
        this.gameState.isProcessing = false;
        
        // 이전 타이머가 있으면 클리어
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
        }
        
        // 3초 후 자동으로 닫고 다음 문제로 이동
        this.modalTimer = setTimeout(() => {
            this.hideScoreModalAndNext();
        }, 3000);
    }
    
    hideScoreModal() {
        const modal = document.getElementById('score-modal');
        modal.classList.remove('show');
        
        // 타이머 클리어
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
            this.modalTimer = null;
        }
    }
    
    hideScoreModalAndNext() {
        console.log('hideScoreModalAndNext called');
        console.log('isProcessing:', this.gameState.isProcessing);
        
        // 점수 모달에서는 isProcessing 체크를 하지 않음 (모달이 표시된 상태에서는 항상 진행 가능)
        console.log('Hiding modal and moving to next question');
        this.hideScoreModal();
        
        // 약간의 지연 후 다음 문제로 (모달 닫힘 애니메이션 고려)
        setTimeout(() => {
            console.log('Calling nextQuestion after timeout');
            this.nextQuestion();
        }, 100);
    }
    
    setupModalEvents() {
        const modal = document.getElementById('score-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        
        console.log('Setting up modal events, closeBtn:', closeBtn);
        
        // 확인 버튼 클릭 시 모달 닫고 다음 문제로
        closeBtn.addEventListener('click', (e) => {
            console.log('Close button clicked!');
            e.preventDefault();
            e.stopPropagation();
            this.hideScoreModalAndNext();
        });
        
        // 모달 배경 클릭 시 닫기 (선택사항)
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                console.log('Modal background clicked!');
                this.hideScoreModalAndNext();
            }
        });
    }
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new FractionGame();
});
