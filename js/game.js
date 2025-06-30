// 메인 게임 클래스
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
            mixedNumberRatio: 30,
            mixedNumberMax: 3,
            interactionMode: 'drag'
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
        this.timer = null;
        
        // ?�호?�용 모드�??�태 변?�들
        this.modeStates = {
            tapIncrements: {}
        };
        
        // 모듈 ?�스?�스 ?�성
        this.uiManager = new UIManager();
        this.shapeManager = new ShapeManager();
        
        this.init();
    }

    init() {
        console.log('FractionGame 초기화 시작');
        this.bindEvents();
        this.setupSettingsPreview();
        this.uiManager.showScreen('start-screen');
        console.log('FractionGame 초기화 완료');
    }

    setupSettingsPreview() {
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
        
        // 기본�??�정
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
    }

    bindEvents() {
        // ?�작?�면 버튼 ?�벤??
        const startSimpleBtn = document.getElementById('start-simple-btn');
        const openSettingsBtn = document.getElementById('open-settings-btn');
        
        if (startSimpleBtn) {
            startSimpleBtn.addEventListener('click', () => {
                const diff = document.getElementById('start-difficulty').value;
                const time = parseInt(document.getElementById('start-time-limit').value, 10);
                this.settings.difficulty = diff;
                this.settings.timeLimit = time;
                this.startGame();
            });
        }
        
        if (openSettingsBtn) {
            openSettingsBtn.addEventListener('click', () => {
                const diff = document.getElementById('start-difficulty').value;
                const time = parseInt(document.getElementById('start-time-limit').value, 10);
                if (document.getElementById('difficulty')) document.getElementById('difficulty').value = diff;
                if (document.getElementById('time-limit')) document.getElementById('time-limit').value = time;
                this.uiManager.showScreen('settings-screen');
            });
        }

        // ?�정 ?�면 ?�벤??
        const startBtn = document.getElementById('start-btn');
        if (startBtn) {
            startBtn.addEventListener('click', () => {
                this.updateSettingsFromForm();
                this.startGame();
            });
        }
        
        // 기�? ?�벤?�들
        if (document.getElementById('help-btn')) {
            document.getElementById('help-btn').addEventListener('click', () => this.showTutorial());
        }
        if (document.getElementById('clear-storage-btn')) {
            document.getElementById('clear-storage-btn').addEventListener('click', () => this.uiManager.confirmClearStorage());
        }
        if (document.getElementById('tutorial-close')) {
            document.getElementById('tutorial-close').addEventListener('click', () => this.closeTutorial());
        }
        if (document.getElementById('reset-btn')) {
            document.getElementById('reset-btn').addEventListener('click', () => this.resetShape());
        }
        if (document.getElementById('skip-btn')) {
            document.getElementById('skip-btn').addEventListener('click', () => this.skipQuestion());
        }
        if (document.getElementById('next-btn')) {
            document.getElementById('next-btn').addEventListener('click', () => this.manualNextQuestion());
        }
        if (document.getElementById('add-shape-btn')) {
            document.getElementById('add-shape-btn').addEventListener('click', () => this.addShape());
        }
        if (document.getElementById('restart-btn')) {
            document.getElementById('restart-btn').addEventListener('click', () => this.restartGame());
        }
        if (document.getElementById('new-settings-btn')) {
            document.getElementById('new-settings-btn').addEventListener('click', () => this.newSettings());
        }
        
        this.bindShapeEvents();
        this.setupModalEvents();
    }

    updateSettingsFromForm() {
        const difficulty = document.getElementById('difficulty');
        const shapeRandom = document.getElementById('shape-random');
        const timeLimit = document.getElementById('time-limit');
        const streakMode = document.getElementById('streak-mode');
        const answerMode = document.getElementById('answer-mode');
        const totalQuestions = document.getElementById('total-questions');
        const skipAllowed = document.getElementById('skip-allowed');
        const skipCount = document.getElementById('skip-count');
        const hideAnswers = document.getElementById('hide-answers');
        const mixedNumberRatio = document.getElementById('mixed-number-ratio');
        const mixedNumberMax = document.getElementById('mixed-number-max');
        const interactionMode = document.getElementById('interaction-mode');

        if (difficulty) this.settings.difficulty = difficulty.value;
        if (shapeRandom) this.settings.shapeRandom = shapeRandom.value === 'true';
        if (timeLimit) this.settings.timeLimit = parseInt(timeLimit.value, 10);
        if (streakMode) this.settings.streakMode = streakMode.value === 'true';
        if (answerMode) this.settings.answerMode = answerMode.value;
        if (totalQuestions) this.settings.totalQuestions = parseInt(totalQuestions.value, 10);
        if (skipAllowed) this.settings.skipAllowed = skipAllowed.value === 'true';
        if (skipCount) this.settings.skipCount = parseInt(skipCount.value, 10);
        if (hideAnswers) this.settings.hideAnswers = hideAnswers.value === 'true';
        if (mixedNumberRatio) this.settings.mixedNumberRatio = parseInt(mixedNumberRatio.value, 10);
        if (mixedNumberMax) this.settings.mixedNumberMax = parseInt(mixedNumberMax.value, 10);
        if (interactionMode) this.settings.interactionMode = interactionMode.value;
    }

    bindShapeEvents() {
        const shapeContainer = document.getElementById('shape-container');
        if (!shapeContainer) return;
        
        const newContainer = shapeContainer.cloneNode(true);
        shapeContainer.parentNode.replaceChild(newContainer, shapeContainer);
        
        const container = document.getElementById('shape-container');
        
        switch(this.settings.interactionMode) {
            case 'tap':
                this.bindTapMode(container);
                break;
            default:
                this.bindDragMode(container);
                break;
        }
    }

    bindDragMode(shapeContainer) {
        let isMouseDown = false;
        let currentShapeIndex = -1;
        
        shapeContainer.addEventListener('mousedown', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            isMouseDown = true;
            currentShapeIndex = parseInt(shapeElement.dataset.index);
            
            if (isNaN(currentShapeIndex) || currentShapeIndex < 0) {
                currentShapeIndex = -1;
                isMouseDown = false;
                return;
            }
            
            const rect = shapeElement.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.shapeManager.updateShapeFill(currentShapeIndex, x, y, rect);
            this.uiManager.updateFeedback(this.gameState, this.settings);
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
            
            this.shapeManager.updateShapeFill(currentShapeIndex, x, y, rect);
            this.uiManager.updateFeedback(this.gameState, this.settings);
        });
        
        shapeContainer.addEventListener('mouseup', () => {
            isMouseDown = false;
            currentShapeIndex = -1;
        });
    }

    bindTapMode(shapeContainer) {
        shapeContainer.addEventListener('click', (e) => {
            if (!this.gameState.isPlaying) return;
            
            const shapeElement = e.target.closest('.shape');
            if (!shapeElement) return;
            
            const shapeIndex = parseInt(shapeElement.dataset.index);
            if (isNaN(shapeIndex) || shapeIndex < 0) return;
            
            if (!this.modeStates.tapIncrements[shapeIndex]) {
                this.modeStates.tapIncrements[shapeIndex] = 0;
            }
            
            this.modeStates.tapIncrements[shapeIndex] = Math.min(1, this.modeStates.tapIncrements[shapeIndex] + 0.05);
            this.shapeManager.userFillAmounts[shapeIndex] = this.modeStates.tapIncrements[shapeIndex];
            
            // ?�각???�데?�트
            if (this.shapeManager.shapesData[shapeIndex].type === 'circle') {
                this.shapeManager.updateCircleFill(shapeIndex, this.modeStates.tapIncrements[shapeIndex]);
            } else if (this.shapeManager.shapesData[shapeIndex].type === 'cup') {
                this.shapeManager.updateCupFill(shapeIndex, this.modeStates.tapIncrements[shapeIndex]);
            } else {
                this.shapeManager.updateHorizontalFill(shapeIndex, this.modeStates.tapIncrements[shapeIndex]);
            }
            
            this.uiManager.updateFeedback(this.gameState, this.settings);
            this.uiManager.showTapEffect(shapeElement, e.clientX, e.clientY);
        });
    }

    showTutorial() {
        this.uiManager.showScreen('tutorial-screen');
    }

    closeTutorial() {
        this.uiManager.showScreen('settings-screen');
    }

    startGame() {
        console.log('게임 시작');
        this.resetGameState();
        this.uiManager.showScreen('game-screen');
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
        
        this.shapeManager.reset();
        this.uiManager.updateSkipButton(this.settings.skipAllowed, this.gameState.skipUsed, this.settings.skipCount);
    }

    generateQuestion() {
        this.gameState.currentQuestion++;
        
        this.modeStates = {
            tapIncrements: {}
        };
        
        this.currentFraction = FractionGenerator.generate(this.settings);
        
        // ?�형 ?�택
        let shapeType = 'circle';
        if (this.settings.shapeRandom) {
            const shapes = ['circle', 'rectangle', 'cup'];
            shapeType = shapes[Math.floor(Math.random() * shapes.length)];
        }
        
        this.uiManager.updateQuestionDisplay(this.currentFraction, this.gameState.currentQuestion, this.settings.totalQuestions);
        this.shapeManager.createShape(shapeType);
        this.shapeManager.resetShapes();
        this.uiManager.updateAddShapeButtonVisibility(this.currentFraction);
        this.uiManager.updateFeedback(this.gameState, this.settings);
        
        this.bindShapeEvents();
        
        this.gameState.timeLeft = this.settings.timeLimit;
        this.startTimer();
    }

    startTimer() {
        if (this.timer) {
            clearInterval(this.timer);
        }
        
        this.timer = setInterval(() => {
            this.gameState.timeLeft--;
            this.uiManager.updateTimerDisplay(this.gameState.timeLeft);
            this.uiManager.updateFeedback(this.gameState, this.settings);
            
            if (this.gameState.timeLeft <= 0) {
                this.timeUp();
            }
        }, 1000);
    }

    timeUp() {
        clearInterval(this.timer);
        this.gameState.isPlaying = false;
        
        const targetValue = this.currentFraction.wholeNumber + this.currentFraction.numerator / this.currentFraction.denominator;
        this.shapeManager.showAnswer(targetValue);
        
        const userValue = this.shapeManager.calculateTotalUserValue();
        const scoreData = ScoreManager.calculateScore(
            this.currentFraction, 
            userValue, 
            this.gameState.timeLeft, 
            this.settings.timeLimit, 
            this.settings.streakMode, 
            this.gameState
        );
        
        this.gameState.results.push({
            question: this.gameState.currentQuestion,
            target: FractionFormatter.formatFraction(this.currentFraction),
            userAnswer: FractionFormatter.formatFraction(MathUtils.convertToFraction(userValue)),
            score: scoreData.totalScore,
            accuracyScore: scoreData.accuracyScore,
            timeBonus: scoreData.timeScore,
            streakBonus: scoreData.streakScore,
            skipped: false
        });
        
        this.uiManager.showScoreModal(scoreData, this.currentFraction);
        
        if (!this.settings.hideAnswers) {
            this.uiManager.showExplanation(this.currentFraction);
        }
        
        this.uiManager.setModalAutoClose(() => this.nextQuestion());
    }

    skipQuestion() {
        if (this.gameState.isProcessing) return;
        if (!this.settings.skipAllowed || this.gameState.skipUsed >= this.settings.skipCount) return;
        
        this.gameState.isProcessing = true;
        this.uiManager.setProcessingState(true);
        
        this.gameState.skipUsed++;
        this.uiManager.updateSkipButton(this.settings.skipAllowed, this.gameState.skipUsed, this.settings.skipCount);
        
        this.gameState.results.push({
            question: this.gameState.currentQuestion,
            target: FractionFormatter.formatFraction(this.currentFraction),
            userAnswer: '건너?�',
            score: 0,
            skipped: true
        });
        
        this.settings.totalQuestions++;
        this.moveToNextQuestion();
    }

    manualNextQuestion() {
        const nextBtn = document.getElementById('next-btn');
        if (nextBtn.disabled || this.gameState.isProcessing) return;
        
        this.gameState.isProcessing = true;
        this.uiManager.setProcessingState(true);
        
        if (!this.gameState.isPlaying) {
            this.nextQuestion();
            return;
        }
        
        clearInterval(this.timer);
        this.gameState.isPlaying = false;
        
        const targetValue = this.currentFraction.wholeNumber + this.currentFraction.numerator / this.currentFraction.denominator;
        this.shapeManager.showAnswer(targetValue);
        
        const userValue = this.shapeManager.calculateTotalUserValue();
        const scoreData = ScoreManager.calculateScore(
            this.currentFraction, 
            userValue, 
            this.gameState.timeLeft, 
            this.settings.timeLimit, 
            this.settings.streakMode, 
            this.gameState
        );
        
        this.gameState.results.push({
            question: this.gameState.currentQuestion,
            target: FractionFormatter.formatFraction(this.currentFraction),
            userAnswer: FractionFormatter.formatFraction(MathUtils.convertToFraction(userValue)),
            score: scoreData.totalScore,
            accuracyScore: scoreData.accuracyScore,
            timeBonus: scoreData.timeScore,
            streakBonus: scoreData.streakScore,
            skipped: false
        });
        
        this.uiManager.showScoreModal(scoreData, this.currentFraction);
        
        if (!this.settings.hideAnswers) {
            this.uiManager.showExplanation(this.currentFraction);
        }
        
        this.uiManager.setModalAutoClose(() => this.nextQuestion());
    }

    nextQuestion() {
        this.uiManager.removeTimerWarning();
        this.uiManager.hideExplanation();
        this.shapeManager.hideAnswer();
        this.moveToNextQuestion();
    }

    moveToNextQuestion() {
        this.uiManager.resetButtonStates();
        this.gameState.isProcessing = false;
        
        if (this.gameState.currentQuestion >= this.settings.totalQuestions) {
            this.endGame();
        } else {
            this.gameState.isPlaying = true;
            this.generateQuestion();
        }
    }

    endGame() {
        clearInterval(this.timer);
        this.showResults();
    }

    showResults() {
        this.uiManager.showScreen('result-screen');
        ResultsManager.showResults(this.gameState, this.settings);
    }

    resetShape() {
        this.shapeManager.resetShapes();
        this.uiManager.updateFeedback(this.gameState, this.settings);
    }

    addShape() {
        if (!this.gameState.isPlaying) return;
        
        const success = this.shapeManager.addShape();
        if (success) {
            this.bindShapeEvents();
        }
    }

    restartGame() {
        this.startGame();
    }

    newSettings() {
        this.uiManager.showScreen('settings-screen');
    }

    setupModalEvents() {
        const modal = document.getElementById('score-modal');
        const closeBtn = document.getElementById('modal-close-btn');
        
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.uiManager.hideScoreModal();
                this.nextQuestion();
            });
        }
        
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.uiManager.hideScoreModal();
                    this.nextQuestion();
                }
            });
        }
    }
}

// 게임 초기??
document.addEventListener('DOMContentLoaded', () => {
    const game = new FractionGame();
});
