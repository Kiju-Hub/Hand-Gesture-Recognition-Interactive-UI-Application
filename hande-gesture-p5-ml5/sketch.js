// p5.js와 ml5.js 라이브러리로 손 동작 인식 및 인터랙티브 UI 구성
let video;
let handPose;
let hands = [];
let drawing = [];
let currentStroke = [];

let isDrawingAllowed = false;  // 그리기 허용 여부
let prevOKState = false;      // 이전 그리기 상태

let prevPoint = null;  // 이전 손 위치

let isPinching = false; // 검지+엄지가 붙었는지 여부
let isErasing = false;  // 🗑️ 지우기 모드 여부
let prevErasePoint = null; // 이전 지우기 좌표 저장

// 버튼 위치 및 크기 정의
const buttonX = 20, buttonY = 20, buttonW = 120, buttonH = 50; // 용기 버튼
const buttonX1 = 500, buttonY1 = 20, buttonW1 = 120, buttonH1 = 50; // 인사 버튼
const buttonX2 = 20, buttonY2 = 400, buttonW2 = 120, buttonH2 = 50; // 사랑 버튼
const buttonX3 = 500, buttonY3 = 400, buttonW3 = 120, buttonH3 = 50; // 감사 버튼

let showCourageMessage = false; // 용기 문구 표시 여부
let showGreetingMessage = false; // 인사 메시지 표시 여부
let showLoveMessage = false; // 사랑 메시지 표시 여부
let showThanksMessage = false; // 감사 메시지 표시 여부

let courageMessageTimer = 0; // 용기 문구 표시 시간
let greetingMessageTimer = 0; //인사 문구 표시 시간
let loveMessageTimer = 0; // 사랑 문구 표시 시간
let thanksMessageTimer = 0; // 감사 문구 표시 시간간

let fireworks = []; // 폭죽을 담을 배열
let fireworksTimer = 0; // 폭죽 타이머
let fireworkStartMessage = false; // 폭죽 메시지 표시 여부

let hearts = []; // 하트 애니메이션을 위한 배열

// 웹캠을 통해 손 동작을 실시간으로 추적하기 위한 준비
function preload() {
    handPose = ml5.handPose({ flipped: true });  // 손 동작 추적을 위한 ml5 handPose 모델 불러오기
}

// 웹캠에서 손 동작을 추적하여 결과를 반환
function gotHands(results) {
    hands = results.length > 0 ? results : [];  // 손 동작이 감지되면 hands 배열에 저장
}

// p5.js의 setup() 함수로 화면을 설정
function setup() {
    createCanvas(640, 480);  // 캔버스 크기 설정
    video = createCapture(VIDEO);  // 웹캠 비디오 캡처
    video.hide();  // 비디오 캡처를 화면에 표시하지 않음
    handPose.detectStart(video, gotHands);  // 비디오로부터 손 동작 감지 시작
}

// p5.js의 draw() 함수로 화면을 지속적으로 갱신
function draw() {
    background(255);  // 배경을 흰색으로 설정

    // 화면을 좌우 반전하여 비디오를 표시
    push();
    translate(width, 0);
    scale(-1, 1);
    image(video, 0, 0, width, height);  // 웹캠 화면을 캔버스에 표시
    pop();

    // 저장된 선들을 그리기
    drawStoredStrokes();
    // 현재 그리고 있는 선을 그리기
    drawLiveStroke();

    // 각 버튼 그리기
    drawCourageButton(); // 용기 버튼
    drawGreetingButton(); // 인사 버튼
    drawLoveButton(); // 사랑 버튼
    drawThanksButton(); // 감사 버튼

    // 매 3번째 프레임마다 손 동작 감지
    if (frameCount % 3 === 0) {
        detectHandGesture();  // 손 동작을 감지하고 처리
    }

    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);

    // 현재 상태에 따라 화면에 상태 메시지 표시
    if (isErasing) {
        text("🗑️ Erasing Mode ON", width / 2, 50);  // 지우기 모드일 때
    } else if (isPinching) {
        text("🖊️ Drawing Mode ON", width / 2, 50);  // 그리기 모드일 때
    } else {
        text("✋ Ready...", width / 2, 50);  // 준비 상태일 때
    }

    // 용기 버튼을 클릭했을 때 메시지와 폭죽 효과
    if (showCourageMessage) {
        drawFireworks();  // 폭죽 그리기
        drawCourageMessage();  // 용기 메시지 표시
    }

    // 각 버튼에 해당하는 메시지 표시
    if (showGreetingMessage) {
        drawGreetingeMessage();// 인사 메시지 표시
    }

    if (showLoveMessage) {
        drawLoveMessage(); // 사랑 메시지 표시
        drawHearts()  // 하트 애니메이션 그리기
    }

    if (showThanksMessage) {
        drawThankMessage(); // 감사 메시지 표시
    }
}

// 용기 버튼 그리기
function drawCourageButton() {
    fill(0, 150, 255); 
    stroke(0);
    strokeWeight(2);
    rect(buttonX, buttonY, buttonW, buttonH, 10);  // 버튼 사각형

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("용기 버튼", buttonX + buttonW / 2, buttonY + buttonH / 2);  // 버튼 텍스트
}

// 인사 버튼 그리기
function drawGreetingButton() {
    fill(200, 200, 200);  
    stroke(0);
    strokeWeight(2);
    rect(buttonX1, buttonY1, buttonW1, buttonH1, 10);  // 버튼 사각형

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("인사 버튼", buttonX1 + buttonW1 / 2, buttonY1 + buttonH1 / 2);  // 버튼 텍스트
}

// 사랑 버튼 그리기
function drawLoveButton() {
    fill(255, 0, 0); 
    stroke(0);
    strokeWeight(2);
    rect(buttonX2, buttonY2, buttonW2, buttonH2, 10);  // 버튼 사각형

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("사랑 버튼", buttonX2 + buttonW2 / 2, buttonY2 + buttonH2 / 2);  // 버튼 텍스트
}

// 감사 버튼 그리기
function drawThanksButton() {
    fill(0, 255, 0); 
    stroke(0);
    strokeWeight(2);
    rect(buttonX3, buttonY3, buttonW3, buttonH3, 10);  // 버튼 사각형

    fill(255);
    textSize(16);
    textAlign(CENTER, CENTER);
    text("감사 버튼", buttonX3 + buttonW3 / 2, buttonY3 + buttonH3 / 2);  // 버튼 텍스트
}

// 폭죽을 그리는 함수
function drawFireworks() {
    let elapsed = millis() - fireworksTimer;

    if (elapsed < 4000) {
        fireworks.push(new Firework(random(width), random(height)));  // 폭죽을 계속 생성
    } else {
        fireworks = [];  
    }

    // 폭죽 업데이트 및 화면에 표시
    for (let firework of fireworks) {
        firework.update();
        firework.show();
    }
}

// Firework 클래스: 폭죽 애니메이션을 정의
class Firework {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(10, 20);
        this.alpha = 255;
        this.speed = random(2, 5);
        this.color = color(random(255), random(255), random(255));
    }

    // 폭죽 업데이트
    update() {
        this.y -= this.speed;  // 폭죽이 위로 올라가도록
        this.alpha -= 5;  // 투명도 감소
        this.size += 1;  // 크기 증가
    }

    // 폭죽 표시
    show() {
        fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
        noStroke();
        ellipse(this.x, this.y, this.size);  // 폭죽 그리기
    }
}


class Heart {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = random(20, 30);
        this.alpha = 255;
        this.speed = random(2, 5);
        this.color = color(255, 0, 0); // 빨간 하트
        this.lifetime = 255;
    }

    update() {
        this.y -= this.speed;  // 하트가 위로 올라가도록
        this.size += 1; // 하트 크기 증가
        this.alpha -= 5;  // 투명도 감소
        this.lifetime -= 2; // 하트의 지속 시간 감소
    }

    show() {
        fill(this.color.levels[0], this.color.levels[1], this.color.levels[2], this.alpha);
        noStroke();
        ellipse(this.x, this.y, this.size); // 하트 그리기
    }

    isAlive() {
        return this.alpha > 0; // 하트가 사라지지 않았으면 true 반환
    }
}

// 하트 애니메이션을 화면에 그리기
function drawHearts() {
    // 하트 애니메이션을 업데이트하고 화면에 그리기
    for (let heart of hearts) {
        heart.update();
        heart.show();
    }

    // 3초 동안 하트를 추가
    if (millis() - loveMessageTimer < 4000) {
        hearts.push(new Heart(random(width), random(height))); // 하트 애니메이션을 계속 생성
    }

    // 하트가 사라지면 배열에서 제거
    hearts = hearts.filter(heart => heart.isAlive());
}



// ✅ 용기 버튼, 사랑 버튼, 감사 버튼, 인사 버튼 근처에 검지가 오면 문구 표시
function checkCourageButton(indexTip) {
    if (!indexTip) return;

    let x = indexTip.x;
    let y = indexTip.y;

    // 용기 버튼 범위 내에 검지가 있으면 메시지 표시
    if (x > buttonX && x < buttonX + buttonW && y > buttonY && y < buttonY + buttonH) {
        showCourageMessage = true;
        courageMessageTimer = millis(); // 현재 시간 저장
        fireworksTimer = millis();
    }
    // 인사 버튼 범위 내에 검지가 있으면 메시지 표시
    else if (x > buttonX1 && x < buttonX1 + buttonW1 && y > buttonY1 && y < buttonY1 + buttonH1) {
        showGreetingMessage = true;
        greetingMessageTimer = millis(); // 현재 시간 저장
    }
    // 사랑 버튼 범위 내에 검지가 있으면 메시지 표시
    else if (x > buttonX2 && x < buttonX2 + buttonW2 && y > buttonY2 && y < buttonY2 + buttonH2) {
        showLoveMessage = true;
        loveMessageTimer = millis(); // 현재 시간 저장
    }
    // 감사 버튼 범위 내에 검지가 있으면 메시지 표시
    else if (x > buttonX3 && x < buttonX3 + buttonW3 && y > buttonY3 && y < buttonY3 + buttonH3) {
        showThanksMessage = true;
        thanksMessageTimer = millis(); // 현재 시간 저장
    }
}


// ✅ 용기 문구를 화면에 표시하는 함수
function drawCourageMessage() {
    let elapsed = millis() - courageMessageTimer;

    // 3초 동안 문구 표시, 이후 숨김
    if (elapsed > 4000) {
        showCourageMessage = false;
        return;
    }

    let alpha = map(elapsed, 0, 3000, 255, 0); // 시간이 지날수록 점점 사라짐

    fill(0, 0, 250, alpha); // 
    strokeWeight(5); // 외곽선 굵기
    textSize(50);
    textAlign(CENTER, CENTER);
    text("포기하지 마세요!\n 화이팅💪🔥", width / 2, height / 2);
}


//인사버튼
function drawGreetingeMessage() {
    let elapsed = millis() - greetingMessageTimer;

    // 3초 동안 문구 표시, 이후 숨김
    if (elapsed > 4000) {
        showGreetingMessage = false;
        return;
    }

    let alpha = map(elapsed, 0, 3000, 255, 0); // 시간이 지날수록 점점 사라짐

    fill(250, 250, 250, alpha); 
    strokeWeight(5); // 외곽선 굵기
    textSize(45);
    textAlign(CENTER, CENTER);
    text("안녕하세요\n 만나서 반갑습니다 !🔥", width / 2, height / 2);
}

//사랑버튼
function drawLoveMessage() {
    let elapsed = millis() - loveMessageTimer;

    // 3초 동안 문구 표시, 이후 숨김
    if (elapsed > 4000) {
        showLoveMessage = false;
        return;
    }

    let alpha = map(elapsed, 0, 3000, 255, 0); // 시간이 지날수록 점점 사라짐

    fill(250, 0, 0, alpha); 
    strokeWeight(5); // 외곽선 굵기
    textSize(45);
    textAlign(CENTER, CENTER);
    text("사랑해요~~❤️🧡💛\n Lovely ^^..", width / 2, height / 2);

}


function drawThankMessage() {
    let elapsed = millis() - thanksMessageTimer;

    // 3초 동안 문구 표시, 이후 숨김
    if (elapsed > 4000) {
        showThanksMessage = false;
        return;
    }

    let alpha = map(elapsed, 0, 3000, 255, 0); // 시간이 지날수록 점점 사라짐

    fill(0, 250, 0, alpha); 
    strokeWeight(5); // 외곽선 굵기
    textSize(45);
    textAlign(CENTER, CENTER);
    text("감사합니다~ \n Thank You🙏😊💖!!!", width / 2, height / 2);
}




// ✍️ 손 동작 감지 및 그림/지우기 제어
function detectHandGesture() {
    if (hands.length === 0) return;

    let hand = hands[0]; // 첫 번째 손 사용
    let indexTip = hand.keypoints[8]; // 검지 끝
    let thumbTip = hand.keypoints[4]; // 엄지 끝
    let pinkyTip = hand.keypoints[20]; // 새끼손가락 끝
    let pinkyPIP = hand.keypoints[18]; // 새끼손가락 관절

    if (!indexTip || !thumbTip || !pinkyTip || !pinkyPIP) {
        console.warn("🚨 손가락 키포인트를 찾을 수 없음. 감지를 스킵합니다.");
        return;
    }

    // 새끼손가락이 펴졌으면 지우기 모드 활성화 (그리기 모드 비활성화)
    isErasing = isPinkyUp(pinkyTip, pinkyPIP);

    // 검지+엄지가 붙었는지 확인 (그리기)
    let pinchingNow = isPinchingGesture(indexTip, thumbTip);

    //  새끼손가락이 펴져 있을 때는 절대 그리기 모드가 되지 않음!
    if (isErasing) {
        isPinching = false;
    } else {
        if (pinchingNow && !isPinching) {
            currentStroke = []; // 새로운 선 시작
        }
        isPinching = pinchingNow;
    }

    // 지우기 모드가 우선 실행됨
    if (isErasing && pinkyTip) {
        eraseAlongPinkyFinger(pinkyTip);
    } else if (isPinching) {
        drawWithIndexFinger(indexTip);
    } else {
        if (currentStroke.length > 0) {
            drawing.push([...currentStroke]);
            currentStroke = [];
        }
        prevPoint = null;
        prevErasePoint = null;
    }

    if (!indexTip) return;

    checkCourageButton(indexTip); //  용기 버튼 체크
}

// 새끼손가락이 펴졌는지 확인하는 함수 (지우기 모드)
function isPinkyUp(pinkyTip, pinkyPIP) {
    if (!pinkyTip || !pinkyPIP) {
        console.warn("🚨 새끼손가락 데이터 없음. 지우기 모드 중지.");
        return false;
    }
    return pinkyTip.y < pinkyPIP.y;
}

// 검지와 엄지가 가까운지 확인하는 함수 (그리기 모드)
function isPinchingGesture(indexTip, thumbTip) {
    let pinchThreshold = 30; 
    return dist(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y) < pinchThreshold;
}

// 새끼손가락이 펴졌는지 확인하는 함수 (지우기 모드)
function isPinkyUp(pinkyTip, pinkyPIP) {
    if (!pinkyTip || !pinkyPIP) {
        console.warn("🚨 새끼손가락 데이터 없음. 지우기 모드 중지.");
        return false;
    }
    return pinkyTip.y < pinkyPIP.y;
}

// 새끼손가락 끝을 따라 지우기
function eraseAlongPinkyFinger(pinkyTip) {
    if (!pinkyTip) return;

    let eraseRadius = 50; // 지우기 반경 50

    if (prevErasePoint) {
        let steps = 20;
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;
            let interpolatedX = lerp(prevErasePoint.x, pinkyTip.x, t);
            let interpolatedY = lerp(prevErasePoint.y, pinkyTip.y, t);
            eraseNearPoints({ x: interpolatedX, y: interpolatedY }, eraseRadius);
        }
    } else {
        eraseNearPoints(pinkyTip, eraseRadius);
    }

    prevErasePoint = { x: pinkyTip.x, y: pinkyTip.y };
}

// 새끼손가락이 펴졌는지 확인하는 함수 (지우기 모드)
function isPinkyUp(pinkyTip, pinkyPIP) {
    if (!pinkyTip || !pinkyPIP) {
        console.warn("🚨 새끼손가락 데이터 없음. 지우기 모드 중지.");
        return false;
    }
    return pinkyTip.y < pinkyPIP.y;
}


// 검지와 엄지가 가까운지 확인하는 함수 (그리기 모드)
function isPinchingGesture(indexTip, thumbTip) {
    let pinchThreshold = 30; 
    return dist(indexTip.x, indexTip.y, thumbTip.x, thumbTip.y) < pinchThreshold;
}

function isPinkyUp(pinkyTip, pinkyPIP) {
    if (!pinkyTip || !pinkyPIP) {
        console.warn("🚨 새끼손가락 데이터 없음. 지우기 모드 중지.");
        return false; // 데이터가 없으면 false 반환하여 무조건 지우기 모드 OFF
    }
    return pinkyTip.y < pinkyPIP.y;
}



// 특정 좌표 근처의 선을 삭제하는 함수
function eraseNearPoints(erasePoint, eraseRadius) {
    for (let d = drawing.length - 1; d >= 0; d--) {
        let stroke = drawing[d];

        let removedPoints = 0; // 몇 개의 점을 지웠는지 추적

        for (let i = stroke.length - 1; i >= 0; i--) {
            let pt = stroke[i];
            if (dist(erasePoint.x, erasePoint.y, pt.x, pt.y) < eraseRadius) {
                stroke.splice(i, 1);
                removedPoints++;
            }
        }

        // 일정 개수 이상의 점이 삭제되었을 때만 선 삭제
        if (stroke.length === 0 || removedPoints > 5) {
            drawing.splice(d, 1);
        }
    }
}

// 현재 그리고 있는 선을 화면에 실시간 표시
function drawLiveStroke() {
    stroke(0);
    strokeWeight(4);
    noFill();
    beginShape();
    for (let pt of currentStroke) {
        curveVertex(pt.x, pt.y);
    }
    endShape();
}

// 기존 저장된 선을 화면에 표시
function drawStoredStrokes() {
    stroke(0);  // 선 색상은 검은색으로 설정
    strokeWeight(4);  // 선 두께는 4픽셀
    noFill();  // 도형 내부는 채우지 않음
    // drawing 배열에 저장된 각 선을 화면에 그리기
    for (let stroke of drawing) {
        beginShape();  // 새로운 선을 그리기 시작
        // 저장된 선의 각 점을 따라 곡선을 그리기
        for (let pt of stroke) {
            curveVertex(pt.x, pt.y);  // 선의 각 점을 곡선으로 연결
        }
        endShape();  // 선 그리기 종료
    }
}

// 검지로 선을 그림
function drawWithIndexFinger(indexTip) {
    if (!indexTip || isErasing) return;  // 검지 손톱이 없거나 지우기 모드일 경우, 선 그리기 중지

    let x = indexTip.x;  // 검지 끝 점의 x 좌표
    let y = indexTip.y;  // 검지 끝 점의 y 좌표

    // 이전 점이 있으면, 두 점을 연결하는 중간 점들을 계산하여 선을 그리기
    if (prevPoint) {
        let steps = 25;  // 선을 그릴 때 중간 점의 수
        for (let i = 1; i <= steps; i++) {
            let t = i / steps;  // 중간 점 비율 (0~1)
            // 이전 점과 현재 점 사이의 x, y 좌표를 보간(interpolation)하여 중간 점 계산
            let interpolatedX = lerp(prevPoint.x, x, t);  // lerp() 함수는 두 점 사이의 보간을 계산
            let interpolatedY = lerp(prevPoint.y, y, t);
            currentStroke.push({ x: interpolatedX, y: interpolatedY });  // 계산된 중간 점을 현재 선에 추가
        }
    } else {
        // 첫 번째 점일 경우, 그냥 현재 점을 추가
        currentStroke.push({ x, y });
    }

    prevPoint = { x, y };  // 현재 점을 이전 점으로 저장하여 다음 점과 연결
    drawLiveStroke();  // 현재 그린 선을 화면에 실시간으로 표시
}