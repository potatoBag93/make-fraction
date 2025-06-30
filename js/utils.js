// 유틸리티 함수들
class MathUtils {
    // 최대공약수 계산
    static gcd(a, b) {
        while (b !== 0) {
            let temp = b;
            b = a % b;
            a = temp;
        }
        return a;
    }

    // 분수 단순화
    static simplifyFraction(numerator, denominator) {
        const gcdValue = this.gcd(numerator, denominator);
        return {
            numerator: numerator / gcdValue,
            denominator: denominator / gcdValue
        };
    }

    // 소수를 분수로 변환
    static convertToFraction(decimal) {
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
}

class FractionGenerator {
    static generate(settings) {
        let minDenominator, maxDenominator;
        
        switch (settings.difficulty) {
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
            const shouldBeMixed = Math.random() * 100 < settings.mixedNumberRatio;
            wholeNumber = shouldBeMixed ? Math.floor(Math.random() * settings.mixedNumberMax) + 1 : 0;
            
            numerator = Math.floor(Math.random() * (denominator - 1)) + 1; // 1부터 denominator-1까지
            
            attempts++;
            if (attempts > 100) break; // 무한 루프 방지
            
        } while (MathUtils.gcd(numerator, denominator) === denominator); // 기약분수가 1이 되는 경우 제외 (n/n 형태)
        
        return { numerator, denominator, wholeNumber };
    }
}

class LocalStorageManager {
    static saveResults(results) {
        const savedResults = JSON.parse(localStorage.getItem('fractionGameResults') || '[]');
        savedResults.push(results);
        
        // 최대 50개의 결과만 보관 (용량 관리)
        if (savedResults.length > 50) {
            savedResults.splice(0, savedResults.length - 50);
        }
        
        localStorage.setItem('fractionGameResults', JSON.stringify(savedResults));
        console.log(`결과 저장 완료. 총 저장된 게임: ${savedResults.length}개`);
    }

    static clearStorage() {
        localStorage.removeItem('fractionGameResults');
        console.log('로컬 저장소 초기화 완료');
    }

    static getStoredResults() {
        return JSON.parse(localStorage.getItem('fractionGameResults') || '[]');
    }
}

// 분수 포맷팅 클래스
class FractionFormatter {
    static formatFraction(fraction) {
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
}
