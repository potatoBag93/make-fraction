// 도형 생성 및 관리 클래스
class ShapeManager {
    constructor() {
        this.shapesData = [];
        this.userFillAmounts = [];
        this.currentShape = 'circle';
    }

    reset() {
        this.shapesData = [];
        this.userFillAmounts = [];
    }

    createShape(shapeType) {
        this.currentShape = shapeType;
        
        // 처음에는 하나의 빈 도형만 제공 (학습 효과 향상)
        this.shapesData = [{
            type: this.currentShape,
            target: 0, // 사용자가 정해야 함
            isWhole: false,
            index: 0
        }];
        this.userFillAmounts = [0];
        
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
        shapeDiv.id = `shape-${index}`;
        shapeDiv.dataset.index = index;
        
        switch (shapeData.type) {
            case 'circle':
                this.createCircleShape(shapeDiv, index);
                break;
            case 'rectangle':
                this.createRectangleShape(shapeDiv, index);
                break;
            case 'cup':
                this.createCupShape(shapeDiv, index);
                break;
        }
        
        return shapeDiv;
    }

    createCircleShape(shapeDiv, index) {
        shapeDiv.innerHTML = `
            <svg viewBox="0 0 200 200" class="shape-svg">
                <circle cx="100" cy="100" r="90" fill="none" stroke="#ddd" stroke-width="2"/>
                <path id="filled-path-${index}" fill="#4CAF50" opacity="0.7" d=""/>
                <path id="answer-path-${index}" fill="#FF9800" opacity="0.8" d="" style="display:none"/>
            </svg>
        `;
    }

    createRectangleShape(shapeDiv, index) {
        shapeDiv.innerHTML = `
            <div style="width: 200px; height: 200px; border: 2px solid #ddd; position: relative; background: #f9f9f9;">
                <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 100%; width: 0%; position: absolute; left: 0; top: 0;"></div>
                <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 100%; width: 0%; position: absolute; left: 0; top: 0; display: none;"></div>
            </div>
        `;
    }

    createCupShape(shapeDiv, index) {
        shapeDiv.innerHTML = `
            <div style="width: 200px; height: 200px; border: 2px solid #2196F3; border-top: none; border-radius: 0 0 20px 20px; position: relative; background: linear-gradient(to top, #e3f2fd 0%, #ffffff 100%);">
                <div id="filled-rect-${index}" style="background: #4CAF50; opacity: 0.7; height: 0%; width: 100%; position: absolute; bottom: 0;"></div>
                <div id="answer-rect-${index}" style="background: #FF9800; opacity: 0.8; height: 0%; width: 100%; position: absolute; bottom: 0; display: none;"></div>
            </div>
        `;
    }

    addShape() {
        if (this.shapesData.length >= 5) {
            return false; // 최대 5개까지만
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
        
        this.addNewShapeElement(newIndex);
        return true;
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

    updateShapeFill(shapeIndex, x, y, shapeRect) {
        // 유효성 검사
        if (shapeIndex < 0 || shapeIndex >= this.shapesData.length) {
            console.warn(`Invalid shapeIndex: ${shapeIndex}`);
            return;
        }
        
        const shapeData = this.shapesData[shapeIndex];
        if (!shapeData) {
            console.warn(`No shapeData found for index: ${shapeIndex}`);
            return;
        }
        
        if (shapeData.type === 'circle') {
            // 원형은 부채꼴 모양으로 채우기
            const centerX = shapeRect.width / 2;
            const centerY = shapeRect.height / 2;
            
            const deltaX = x - centerX;
            const deltaY = y - centerY;
            
            let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
            if (angle < 0) angle += 360;
            
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
        
        const startX = centerX;
        const startY = centerY - radius;
        
        if (angle >= 360) {
            filledPath.setAttribute('d', `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`);
        } else {
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
            filledElement.style.width = `${percentage * 100}%`;
        }
    }

    updateCupFill(shapeIndex, percentage) {
        const filledElement = document.getElementById(`filled-rect-${shapeIndex}`);
        if (filledElement) {
            filledElement.style.height = `${percentage * 100}%`;
        }
    }

    resetShapes() {
        console.log('resetShapes called');
        
        // 기본 채우기 상태 초기화
        if (this.userFillAmounts.length > 0) {
            this.userFillAmounts.fill(0);
        }
        
        // 각 도형의 시각적 상태 초기화
        this.shapesData.forEach((shapeData, index) => {
            let shapeElement = document.getElementById(`shape-${index}`);
            if (!shapeElement) {
                shapeElement = document.querySelector(`[data-index="${index}"]`);
            }
            
            if (!shapeElement) {
                console.warn(`Shape element not found for index ${index}`);
                return;
            }
            
            if (shapeData.type === 'circle') {
                const filledPath = document.getElementById(`filled-path-${index}`);
                if (filledPath) {
                    filledPath.setAttribute('d', '');
                }
            } else if (shapeData.type === 'cup') {
                const filledElement = document.getElementById(`filled-rect-${index}`);
                if (filledElement) {
                    filledElement.style.height = '0%';
                }
            } else {
                const filledElement = document.getElementById(`filled-rect-${index}`);
                if (filledElement) {
                    filledElement.style.width = '0%';
                }
            }
        });
    }

    calculateTotalUserValue() {
        let total = 0;
        this.shapesData.forEach((shapeData, index) => {
            if (shapeData.isWhole) {
                total += this.userFillAmounts[index] * (shapeData.target || 1);
            } else {
                total += this.userFillAmounts[index];
            }
        });
        return total;
    }

    showAnswer(targetValue) {
        let remainingValue = targetValue;
        
        this.shapesData.forEach((shapeData, index) => {
            let answerRatio = 0;
            
            if (remainingValue >= 1) {
                answerRatio = 1;
                remainingValue -= 1;
            } else if (remainingValue > 0) {
                answerRatio = remainingValue;
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
                    answerElement.style.height = `${Math.min(answerRatio * 100, 100)}%`;
                } else {
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
        
        const startX = centerX;
        const startY = centerY - radius;
        
        if (angle >= 360) {
            answerPath.setAttribute('d', `M ${centerX} ${centerY} m -${radius} 0 a ${radius} ${radius} 0 1 1 ${radius * 2} 0 a ${radius} ${radius} 0 1 1 -${radius * 2} 0`);
        } else {
            const endAngle = (angle - 90) * (Math.PI / 180);
            const endX = centerX + radius * Math.cos(endAngle);
            const endY = centerY + radius * Math.sin(endAngle);
            
            const largeArcFlag = angle > 180 ? 1 : 0;
            
            answerPath.setAttribute('d', 
                `M ${centerX} ${centerY} L ${startX} ${startY} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${endX} ${endY} Z`
            );
        }
    }

    hideAnswer() {
        this.shapesData.forEach((shapeData, index) => {
            if (shapeData.type === 'circle') {
                const answerPath = document.getElementById(`answer-path-${index}`);
                if (answerPath) answerPath.style.display = 'none';
            } else {
                const answerElement = document.getElementById(`answer-rect-${index}`);
                if (answerElement) answerElement.style.display = 'none';
            }
        });
    }
}
