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
            mixedNumberMax: 3,       // 대분수 자연수 최대값
            interactionMode: 'drag'  // 도형 상호작용 모드
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
        
        // 상호작용 모드별 상태 변수들
        this.modeStates = {
            tapIncrements: {} // 연속 터치 모드
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.setupSettingsPreview();
        this.showScreen('settings-screen');
    }
    
    setupSettingsPreview() {
        // 설정 값들을 기본값으로 초기화하고 미리보기 설정
        const elements = {
            'difficulty': document.getElementById('difficulty'),
            'shape-random': document.getElementById('shape-random'),
            'time-limit': document.getElementById('time-limit'),
            'streak-mode': document.getElementById('streak-mode'),
            'answer-mode': document.getElementById('answer-mode'),
            'total-questions': document.getElementById('total-questions'),
            'skip-allowed': document.getElementById('skip-allowed'),
            'skip-count': document.getElementById('skip-count'),
            'hide-answers': document.getElementById('hide-answers'),
            'mixed-number-ratio': document.getElementById('mixed-number-ratio'),
            'mixed-number-max': document.getElementById('mixed-number-max'),
            'interaction-mode': document.getElementById('interaction-mode')
        };
        
        // 기본값 설정
        if (elements['difficulty']) elements['difficulty'].value = this.settings.difficulty;
        if (elements['shape-random']) elements['shape-random'].value = this.settings.shapeRandom.toString();
        if (elements['time-limit']) elements['time-limit'].value = this.settings.timeLimit;
        if (elements['streak-mode']) elements['streak-mode'].value = this.settings.streakMode.toString();
        if (elements['answer-mode']) elements['answer-mode'].value = this.settings.answerMode;
        if (elements['total-questions']) elements['total-questions'].value = this.settings.totalQuestions;
        if (elements['skip-allowed']) elements['skip-allowed'].value = this.settings.skipAllowed.toString();
        if (elements['skip-count']) elements['skip-count'].value = this.settings.skipCount;
        if (elements['hide-answers']) elements['hide-answers'].value = this.settings.hideAnswers.toString();
        if (elements['mixed-number-ratio']) elements['mixed-number-ratio'].value = this.settings.mixedNumberRatio;
        if (elements['mixed-number-max']) elements['mixed-number-max'].value = this.settings.mixedNumberMax;
        if (elements['interaction-mode']) elements['interaction-mode'].value = this.settings.interactionMode;
        
        // 설정 변경 시 미리보기 업데이트 이벤트 추가
        Object.keys(elements).forEach(key => {
            const element = elements[key];
            if (element) {
                element.addEventListener('change', () => {
                    this.updateSettingsPreview();
                });
            }
        });
        
        // 초기 미리보기 업데이트
        this.updateSettingsPreview();
    }
    
    updateSettingsPreview() {
        // 설정값에 따른 미리보기 정보 업데이트
        const interactionElement = document.getElementById('interaction-mode');
        
        // 상호작용 모드에 따른 설명 업데이트
        if (interactionElement) {
            const mode = interactionElement.value;
            const modeDescriptions = {
                'drag': '마우스 드래그로 도형을 자유롭게 채웁니다',
                'tap': '연속 터치로 조금씩 도형을 채웁니다',
                'draw': '마우스로 직접 그려서 도형을 채웁니다',
                'puzzle': '퍼즐 조각을 클릭하여 채웁니다',
                'pump': '물컵을 펌프로 채웁니다',
                'slice': '원형을 슬라이스하여 채웁니다',
                'animation': '클릭하면 자동 애니메이션으로 채워집니다',
                'multitouch': '여러 손가락으로 동시에 터치합니다',
                'pattern': '패턴 방식으로 격자를 채웁니다',
                'speed': '빠른 연속 클릭으로 채웁니다',
                'robot': '정밀하게 10%씩 단계적으로 채웁니다',
                'droplet': '물방울이 떨어져서 채워집니다'
            };
            
            const modeDescription = interactionElement.parentElement.querySelector('small');
            if (modeDescription) {
                modeDescription.textContent = modeDescriptions[mode] || '각 모드별로 다른 방식으로 도형을 채웁니다';
            }
        }
    }
    
    bindEvents() {
        // 설정 화면 이벤트
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('help-btn').addEventListener('click', () => this.showTutorial());
        document.getElementById('clear-storage-btn').addEventListener('click', () => this.confirmClearStorage());
        
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
        // 먼저 기존 이벤트 리스너들을 제거
        const shapeContainer = document.getElementById('shape-container');
        const newContainer = shapeContainer.cloneNode(true);
        shapeContainer.parentNode.replaceChild(newContainer, shapeContainer);
        
        // 새로운 컨테이너에 이벤트 바인딩
        const container = document.getElementById('shape-container');
        
        console.log('Binding events for mode:', this.settings.interactionMode);
        
        // 상호작용 모드에 따라 다른 이벤트 처리
        switch(this.settings.interactionMode) {
            case 'tap':
                this.bindTapMode(container);
                break;
            default: // drag mode
                this.bindDragMode(container);
                break;
        }
    }
    
    // 기본 드래그 모드
    bindDragMode(shapeContainer) {
        let isMouseDown = false;
        let currentShapeIndex = -1;
        
        shapeContainer.addEventListener('mousedown', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            isMouseDown = true;
            const indexStr = shapeElement.dataset.index;
            currentShapeIndex = parseInt(indexStr);
            
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
        
        // 터치 이벤트도 동일하게 처리
        shapeContainer.addEventListener('touchstart', (e) => {
            if (!this.gameState.isPlaying) return;
            e.preventDefault();
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const indexStr = shapeElement.dataset.index;
            currentShapeIndex = parseInt(indexStr);
            
            if (isNaN(currentShapeIndex) || currentShapeIndex < 0) {
                currentShapeIndex = -1;
                return;
            }
            
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
    
    // 연속 터치 모드 - 터치할 때마다 조금씩 채워짐
    bindTapMode(shapeContainer) {
        shapeContainer.addEventListener('click', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const shapeIndex = parseInt(shapeElement.dataset.index);
            if (isNaN(shapeIndex) || shapeIndex < 0) return;
            
            // 초기화
            if (!this.modeStates.tapIncrements[shapeIndex]) {
                this.modeStates.tapIncrements[shapeIndex] = 0;
            }
            
            // 매 터치마다 5%씩 증가
            this.modeStates.tapIncrements[shapeIndex] = Math.min(1, this.modeStates.tapIncrements[shapeIndex] + 0.05);
            this.userFillAmounts[shapeIndex] = this.modeStates.tapIncrements[shapeIndex];
            
            // 시각적 피드백
            this.updateShapeVisualFill(shapeIndex, this.modeStates.tapIncrements[shapeIndex]);
            this.updateFeedback();
            
            // 터치 애니메이션 효과
            this.showTapEffect(shapeElement, e.clientX, e.clientY);
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
        this.settings.interactionMode = document.getElementById('interaction-mode').value;
        
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
        
        // 상호작용 모드별 상태 초기화
        this.modeStates = {
            tapIncrements: {}
        };
        
        // 분수 생성
        this.currentFraction = this.generateFraction();
        
        // 도형 선택
        if (this.settings.shapeRandom) {
            const shapes = ['circle', 'rectangle', 'cup'];
            this.currentShape = shapes[Math.floor(Math.random() * shapes.length)];
        } else {
            // 기본 도형 설정
            this.currentShape = 'circle';
        }
        
        // UI 업데이트
        this.updateQuestionDisplay();
        this.createShape();
        this.resetShape();
        this.updateAddShapeButtonVisibility();
        this.updateFeedback(); // 피드백 영역 초기화
        
        // 새로운 상호작용 모드 이벤트 바인딩
        this.bindShapeEvents();
        
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
        document.getElementById('question-text').innerHTML = `${questionText}을 채워보세요!`;
        document.getElementById('question-progress').textContent = 
            `${this.gameState.currentQuestion} / ${this.settings.totalQuestions}`;
    }
    
    formatFraction(fraction) {
        if (fraction.wholeNumber > 0) {
            // 대분수: 자연수 + 진분수
            return `<span class="mixed-number">
                        <span class="whole-number">${fraction.wholeNumber}</span>
                        <span class="proper-fraction">
                            <span class="numerator">${fraction.numerator}</span>
                            <span class="fraction-bar"></span>
                            <span class="denominator">${fraction.denominator}</span>
                        </span>
                    </span>`;
        } else {
            // 순수 분수
            return `<span class="fraction">
                        <span class="numerator">${fraction.numerator}</span>
                        <span class="fraction-bar"></span>
                        <span class="denominator">${fraction.denominator}</span>
                    </span>`;
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
        shapeDiv.id = `shape-${index}`;  // ID 추가
        shapeDiv.dataset.index = index;
        
        // 상호작용 모드에 따른 CSS 클래스 추가
        const modeClass = this.settings.interactionMode + '-mode';
        shapeDiv.classList.add(modeClass);
        
        // 모드별 툴팁 추가
        const tooltip = this.createModeTooltip(this.settings.interactionMode);
        shapeDiv.appendChild(tooltip);
        
        switch (shapeData.type) {
            case 'circle':
                shapeDiv.innerHTML += `
                    <svg viewBox="0 0 200 200" class="shape-svg">
                        <circle cx="100" cy="100" r="90" fill="none" stroke="#ddd" stroke-width="2"/>
                        <path id="filled-path-${index}" fill="#4CAF50" opacity="0.7" d=""/>
                        <path id="answer-path-${index}" fill="#FF9800" opacity="0.8" d="" style="display:none"/>
                    </svg>
                `;
                break;
            case 'rectangle':
                shapeDiv.innerHTML += `
                    <div style="width: 200px; height: 200px; border: 2px solid #ddd; position: relative; background: #f9f9f9;">
                        <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 100%; width: 0%; position: absolute; left: 0; top: 0;"></div>
                        <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 100%; width: 0%; position: absolute; left: 0; top: 0; display: none;"></div>
                    </div>
                `;
                break;
            case 'cup':
                shapeDiv.innerHTML += `
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
    
    // 시각적 채우기 업데이트 (모든 모드에서 공통 사용)
    updateShapeVisualFill(shapeIndex, percentage) {
        const shapeData = this.shapesData[shapeIndex];
        if (!shapeData) return;
        
        if (shapeData.type === 'circle') {
            this.updateCircleFill(shapeIndex, percentage);
        } else if (shapeData.type === 'cup') {
            this.updateCupFill(shapeIndex, percentage);
        } else {
            this.updateHorizontalFill(shapeIndex, percentage);
        }
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
    
    // 모드 힌트 표시
    showModeHint(shapeElement, message) {
        const hint = document.createElement('div');
        hint.className = 'mode-hint';
        hint.textContent = message;
        shapeElement.appendChild(hint);
        
        setTimeout(() => {
            hint.remove();
        }, 2000);
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
                // 전체 도형: 사용자가 정한 목표값으로 계산
                total += this.userFillAmounts[index] * (shapeData.target || 1);
            } else {
                // 분수 부분: 사용자가 채운 비율 그대로 더함 (0~1)
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
        console.log('resetShape called');
        console.log('userFillAmounts before reset:', this.userFillAmounts);
        console.log('shapesData:', this.shapesData);
        
        // 기본 채우기 상태 초기화
        if (this.userFillAmounts.length > 0) {
            this.userFillAmounts.fill(0);
        }
        
        // 각 도형의 시각적 상태 초기화
        this.shapesData.forEach((shapeData, index) => {
            // 여러 방법으로 도형 요소 찾기
            let shapeElement = document.getElementById(`shape-${index}`);
            if (!shapeElement) {
                // ID로 찾지 못하면 dataset.index로 찾기
                shapeElement = document.querySelector(`[data-index="${index}"]`);
            }
            
            if (!shapeElement) {
                console.warn(`Shape element not found for index ${index}`);
                return;
            }
            
            console.log(`Resetting shape ${index} of type ${shapeData.type}`);
            
            // 기본 도형 채우기 초기화
            if (shapeData.type === 'circle') {
                const filledPath = document.getElementById(`filled-path-${index}`);
                if (filledPath) {
                    filledPath.setAttribute('d', '');
                    console.log(`Reset circle ${index}`);
                }
            } else if (shapeData.type === 'cup') {
                const filledElement = document.getElementById(`filled-rect-${index}`);
                if (filledElement) {
                    filledElement.style.height = '0%';
                    console.log(`Reset cup ${index}`);
                }
            } else {
                // 직사각형
                const filledElement = document.getElementById(`filled-rect-${index}`);
                if (filledElement) {
                    filledElement.style.width = '0%';
                    console.log(`Reset rectangle ${index}`);
                }
            }
            
            // 상호작용 모드별 추가 상태 초기화
            this.resetModeSpecificStates(shapeElement, index);
        });
        
        // 피드백 업데이트
        this.updateFeedback();
        console.log('userFillAmounts after reset:', this.userFillAmounts);
    }
    
    resetModeSpecificStates(shapeElement, index) {
        // 모드별 상태 변수들 초기화
        if (this.modeStates.tapIncrements[index] !== undefined) {
            this.modeStates.tapIncrements[index] = 0;
        }
        
        // 연속 터치 모드 - 터치 효과 제거
        const tapEffects = shapeElement.querySelectorAll('[style*="tapEffect"]');
        tapEffects.forEach(effect => effect.remove());
        
        console.log(`Reset completed for shape ${index} in mode: ${this.settings.interactionMode}`);
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
            question: this.gameState.currentQuestion,
            target: this.formatFraction(this.currentFraction),
            userAnswer: this.formatFraction(this.convertToFraction(this.calculateTotalUserValue())),
            score: scoreData.totalScore,
            accuracyScore: scoreData.accuracyScore,
            timeBonus: scoreData.timeScore,
            streakBonus: scoreData.streakScore,
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
        console.log('calculateScore called');
        
        // 기본값 설정
        let totalScore = 50;
        let accuracyScore = 40;
        let timeBonus = 10;
        let streakBonus = 0;
        
        try {
            console.log('currentFraction:', this.currentFraction);
            console.log('userFillAmounts:', this.userFillAmounts);
            
            if (this.currentFraction && this.currentFraction.numerator !== undefined && this.currentFraction.denominator !== undefined) {
                const targetValue = (this.currentFraction.wholeNumber || 0) + this.currentFraction.numerator / this.currentFraction.denominator;
                const userValue = this.calculateTotalUserValue();
                
                console.log('targetValue:', targetValue);
                console.log('userValue:', userValue);
                
                if (!isNaN(targetValue) && !isNaN(userValue)) {
                    const error = Math.abs(targetValue - userValue) / Math.max(targetValue, 1);
                    const accuracy = Math.max(0, 1 - error);
                    
                    // 기본 점수 (정확도 기반, 0-80점)
                    accuracyScore = Math.round(accuracy * 80);
                    
                    // 시간 보너스 (0-15점)
                    if (this.gameState.timeLeft !== undefined && this.settings.timeLimit !== undefined) {
                        timeBonus = Math.round((this.gameState.timeLeft / this.settings.timeLimit) * 15);
                    }
                    
                    // 연속 정답 보너스 (최대 5점)
                    if (this.settings.streakMode && accuracy > 0.8) {
                        this.gameState.streak = (this.gameState.streak || 0) + 1;
                        streakBonus = Math.min(this.gameState.streak, 5);
                    } else {
                        this.gameState.streak = 0;
                    }
                    
                    totalScore = Math.min(100, Math.max(0, accuracyScore + timeBonus + streakBonus));
                }
            }
        } catch (error) {
            console.error('Error in calculateScore:', error);
        }
        
        console.log('final scores:', { totalScore, accuracyScore, timeBonus, streakBonus });
        
        const resultObj = {
            totalScore: totalScore,
            accuracyScore: accuracyScore,
            timeScore: timeBonus,
            streakScore: streakBonus
        };
        
        console.log('returning scoreData:', resultObj);
        
        return resultObj;
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
        
        explanationDiv.querySelector('p').innerHTML = text;
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
        
        // 통계 계산 개선
        const allResults = this.gameState.results;
        const validResults = allResults.filter(r => !r.skipped);
        const skippedCount = allResults.filter(r => r.skipped).length;
        
        // 정답 수: 80점 이상을 정답으로 간주 (더 엄격한 기준)
        const correctCount = validResults.filter(r => r.score >= 80).length;
        
        // 평균 정확도: 실제 시도한 문제 기준으로 계산
        const avgAccuracy = validResults.length > 0 ? 
            Math.round((correctCount / validResults.length) * 100) : 0;
        
        // 평균 점수: 실제 시도한 문제들의 평균
        const avgScore = validResults.length > 0 ? 
            Math.round(validResults.reduce((sum, r) => sum + r.score, 0) / validResults.length) : 0;
        
        // 대분수 통계 계산
        const mixedNumberCount = allResults.filter(r => 
            r.target && r.target.includes('과')
        ).length;
        
        // 결과 표시
        document.getElementById('total-problems').textContent = this.settings.totalQuestions;
        document.getElementById('correct-count').textContent = `${correctCount} (건너뜀: ${skippedCount})`;
        document.getElementById('avg-accuracy').textContent = `${avgAccuracy}%`;
        document.getElementById('total-score').textContent = `${avgScore}점`;
        
        // 콘솔에 상세 통계 출력
        console.log(`=== 게임 결과 통계 ===`);
        console.log(`총 문제: ${this.settings.totalQuestions}개`);
        console.log(`시도한 문제: ${validResults.length}개`);
        console.log(`건너뛴 문제: ${skippedCount}개`);
        console.log(`정답 문제: ${correctCount}개 (80점 이상)`);
        console.log(`평균 점수: ${avgScore}점`);
        console.log(`정확도: ${avgAccuracy}%`);
        console.log(`대분수 문제: ${mixedNumberCount}개`);
        
        // 상세 결과 표시
        this.showDetailedResults();
        
        // 로컬 저장
        this.saveResults();
    }
    
    showDetailedResults() {
        const detailsContainer = document.getElementById('problem-details');
        detailsContainer.innerHTML = '';
        
        this.gameState.results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`, result); // 디버깅 로그 추가
            
            const item = document.createElement('div');
            item.className = 'problem-detail-item';
            
            let scoreClass = 'score-poor';
            if (result.score >= 80) scoreClass = 'score-excellent';
            else if (result.score >= 60) scoreClass = 'score-good';
            
            const scoreDetail = result.skipped ? '건너뜀' : 
                `${result.score || 0}점 (정확도: ${result.accuracyScore || 0}점, 시간: +${result.timeBonus || 0}점)`;
            
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
            summary: {
                totalProblems: this.settings.totalQuestions,
                attempted: this.gameState.results.filter(r => !r.skipped).length,
                skipped: this.gameState.results.filter(r => r.skipped).length,
                correct: this.gameState.results.filter(r => !r.skipped && r.score >= 80).length,
                avgScore: this.gameState.results.filter(r => !r.skipped).length > 0 ? 
                    Math.round(this.gameState.results.filter(r => !r.skipped).reduce((sum, r) => sum + r.score, 0) / 
                    this.gameState.results.filter(r => !r.skipped).length) : 0
            }
        };
        
        // 로컬 스토리지 관리 개선
        const savedResults = JSON.parse(localStorage.getItem('fractionGameResults') || '[]');
        savedResults.push(results);
        
        // 최대 50개의 결과만 보관 (용량 관리)
        if (savedResults.length > 50) {
            savedResults.splice(0, savedResults.length - 50);
        }
        
        localStorage.setItem('fractionGameResults', JSON.stringify(savedResults));
        console.log(`결과 저장 완료. 총 저장된 게임: ${savedResults.length}개`);
    }
    
    clearLocalStorage() {
        localStorage.removeItem('fractionGameResults');
        console.log('로컬 저장소 초기화 완료');
    }
    
    restartGame() {
        // 현재 게임 상태만 초기화 (로컬 저장소는 유지)
        console.log('게임 재시작 - 현재 상태 초기화');
        this.startGame();
    }
    
    newSettings() {
        // 설정 화면으로 이동 (로컬 저장소 유지)
        console.log('설정 변경으로 이동');
        this.showScreen('settings-screen');
    }
    
    confirmClearStorage() {
        const savedResults = JSON.parse(localStorage.getItem('fractionGameResults') || '[]');
        const count = savedResults.length;
        
        if (count === 0) {
            alert('저장된 기록이 없습니다.');
            return;
        }
        
        const confirmed = confirm(`저장된 ${count}개의 게임 기록을 모두 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.`);
        
        if (confirmed) {
            this.clearLocalStorage();
            alert('모든 저장 기록이 삭제되었습니다.');
        }
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
        shapeDiv.dataset.index = index;
        
        // 상호작용 모드에 따른 CSS 클래스 추가
        const modeClass = this.settings.interactionMode + '-mode';
        shapeDiv.classList.add(modeClass);
        
        // 모드별 툴팁 추가
        const tooltip = this.createModeTooltip(this.settings.interactionMode);
        shapeDiv.appendChild(tooltip);
        
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
            score: scoreData.totalScore,
            accuracyScore: scoreData.accuracyScore,
            timeBonus: scoreData.timeScore,
            streakBonus: scoreData.streakScore,
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
    
    createModeTooltip(mode) {
        const tooltip = document.createElement('div');
        tooltip.className = 'mode-tooltip';
        
        const tooltipTexts = {
            'drag': '드래그하여 채우기',
            'tap': '연속 터치로 조금씩 채우기',
            'draw': '마우스로 직접 그려서 채우기',
            'puzzle': '클릭하여 퍼즐 조각 채웁니다',
            'pump': '클릭하여 펌프로 채웁니다',
            'slice': '드래그하여 슬라이스 채웁니다',
            'animation': '클릭하면 자동으로 애니메이션',
            'multitouch': '여러 손가락으로 동시 터치',
            'pattern': '클릭하여 패턴으로 채웁니다',
            'speed': '빠르게 연속 클릭하여 채웁니다',
            'robot': '클릭하여 정밀하게 10%씩 채웁니다',
            'droplet': '클릭하여 물방울로 채웁니다'
        };
        
        tooltip.textContent = tooltipTexts[mode] || '클릭하여 채우기';
        return tooltip;
    }
    
    setupModalEvents() {
        // 점수 모달 관련 이벤트 설정
        const modal = document.getElementById('score-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideScoreModal();
                this.nextQuestion();
            });
        }
        
        // 모달 배경 클릭시 닫기
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideScoreModal();
                    this.nextQuestion();
                }
            });
        }
    }
    
    updateAddShapeButtonVisibility() {
        const addShapeBtn = document.getElementById('add-shape-btn');
        const shapeControls = document.querySelector('.shape-controls');
        
        if (!addShapeBtn || !shapeControls) return;
        
        // 대분수 문제일 때만 "도형 추가" 버튼 표시
        if (this.currentFraction.wholeNumber > 0) {
            shapeControls.style.display = 'flex';
            addShapeBtn.style.display = 'inline-block';
        } else {
            shapeControls.style.display = 'none';
            addShapeBtn.style.display = 'none';
        }
    }
    
    showScoreModal(scoreData) {
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
            targetAnswerElement.innerHTML = this.formatFraction(this.currentFraction);
        }
        
        // 모달 표시
        modal.classList.add('show');
        
        // 자동으로 3초 후 닫기
        if (this.modalTimer) {
            clearTimeout(this.modalTimer);
        }
        
        this.modalTimer = setTimeout(() => {
            this.hideScoreModal();
            this.nextQuestion();
        }, 3000);
    }
    
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
}

// 게임 초기화
document.addEventListener('DOMContentLoaded', () => {
    const game = new FractionGame();
});
