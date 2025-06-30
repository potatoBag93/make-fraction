// 점수 계산 및 결과 관리 클래스
class ScoreManager {
    static calculateScore(currentFraction, userValue, timeLeft, timeLimit, streakMode, gameState) {
        console.log('calculateScore called');
        
        // 기본값 설정
        let totalScore = 50;
        let accuracyScore = 40;
        let timeBonus = 10;
        let streakBonus = 0;
        
        try {
            if (currentFraction && currentFraction.numerator !== undefined && currentFraction.denominator !== undefined) {
                const targetValue = (currentFraction.wholeNumber || 0) + currentFraction.numerator / currentFraction.denominator;
                
                console.log('targetValue:', targetValue);
                console.log('userValue:', userValue);
                
                if (!isNaN(targetValue) && !isNaN(userValue)) {
                    const error = Math.abs(targetValue - userValue) / Math.max(targetValue, 1);
                    const accuracy = Math.max(0, 1 - error);
                    
                    // 기본 점수 (정확도 기반, 0-80점)
                    accuracyScore = Math.round(accuracy * 80);
                    
                    // 시간 보너스 (0-15점)
                    if (timeLeft !== undefined && timeLimit !== undefined) {
                        timeBonus = Math.round((timeLeft / timeLimit) * 15);
                    }
                    
                    // 연속 정답 보너스 (최대 5점)
                    if (streakMode && accuracy > 0.8) {
                        gameState.streak = (gameState.streak || 0) + 1;
                        streakBonus = Math.min(gameState.streak, 5);
                    } else {
                        gameState.streak = 0;
                    }
                    
                    totalScore = Math.min(100, Math.max(0, accuracyScore + timeBonus + streakBonus));
                }
            }
        } catch (error) {
            console.error('Error in calculateScore:', error);
        }
        
        console.log('final scores:', { totalScore, accuracyScore, timeBonus, streakBonus });
        
        return {
            totalScore: totalScore,
            accuracyScore: accuracyScore,
            timeScore: timeBonus,
            streakScore: streakBonus
        };
    }
}

class ResultsManager {
    static showResults(gameState, settings) {
        // 통계 계산
        const allResults = gameState.results;
        const validResults = allResults.filter(r => !r.skipped);
        const skippedCount = allResults.filter(r => r.skipped).length;
        
        // 정답 수: 80점 이상을 정답으로 간주
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
        document.getElementById('total-problems').textContent = settings.totalQuestions;
        document.getElementById('correct-count').textContent = `${correctCount} (건너뜀: ${skippedCount})`;
        document.getElementById('avg-accuracy').textContent = `${avgAccuracy}%`;
        document.getElementById('total-score').textContent = `${avgScore}점`;
        
        // 콘솔에 상세 통계 출력
        console.log(`=== 게임 결과 통계 ===`);
        console.log(`총 문제: ${settings.totalQuestions}개`);
        console.log(`시도한 문제: ${validResults.length}개`);
        console.log(`건너뛴 문제: ${skippedCount}개`);
        console.log(`정답 문제: ${correctCount}개 (80점 이상)`);
        console.log(`평균 점수: ${avgScore}점`);
        console.log(`정확도: ${avgAccuracy}%`);
        console.log(`대분수 문제: ${mixedNumberCount}개`);
        
        // 상세 결과 표시
        this.showDetailedResults(gameState.results);
        
        // 로컬 저장
        this.saveResults(gameState, settings);
    }

    static showDetailedResults(results) {
        const detailsContainer = document.getElementById('problem-details');
        detailsContainer.innerHTML = '';
        
        results.forEach((result, index) => {
            console.log(`Result ${index + 1}:`, result);
            
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

    static saveResults(gameState, settings) {
        const results = {
            date: new Date().toISOString(),
            settings: settings,
            results: gameState.results,
            summary: {
                totalProblems: settings.totalQuestions,
                attempted: gameState.results.filter(r => !r.skipped).length,
                skipped: gameState.results.filter(r => r.skipped).length,
                correct: gameState.results.filter(r => !r.skipped && r.score >= 80).length,
                avgScore: gameState.results.filter(r => !r.skipped).length > 0 ? 
                    Math.round(gameState.results.filter(r => !r.skipped).reduce((sum, r) => sum + r.score, 0) / 
                    gameState.results.filter(r => !r.skipped).length) : 0
            }
        };
        
        LocalStorageManager.saveResults(results);
    }
}
