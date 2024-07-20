// Tekville Foundation Library
// TFL > UI > Common
// Text

// 폰트 로드
function fontLoader(fontname : string, fontUrl : string) {
    let result = new Promise((resolve) => {
        const fontFace = new FontFace(fontname, "url(" + fontUrl + ")");
        fontFace.load().then(
            () => {
                resolve(fontFace);
            },
            (err) => {
                console.log("font load error:", err);
            }
        )
	});
    return result;
}

// 텍스트 텍스처 생성
export async function createTextTexture(textProperty : any) {
    // 기본 속성
    const property = {
        text : "", // 텍스트
        fontColorText : "#FFFFFF", // 텍스트 색상
        fontSize : 16, // 텍스트 크기
        fontWeight : "normal", // 텍스트 굵기 (normal: 일반, bolder: 굵게)
        fontName : "Gulim", // 텍스트 폰트
        fontUrl : "", // 폰트 URL
        fontRatio : 300, // 텍스트 비율 (고정 값)
        backgroundColorText : "", // 배경 색상
        lineHeight : 16, // 텍스트 라인 높이 (텍스트 한줄 높이 - 텍스트 크기와 1:1)
        lineSpace : 2, // 텍스트 라인과 텍스트 라인 사이 공간 높이 (텍스트 줄간격(줄 높이))
        autoOverflowWrap : false, // 텍스트 다음 라인 처리 여부
        fixedWidth : 0, // 너비 (0: 자동, 0 보다 크면 설정된 크기로 고정)
        paddingLeft : 0, // 왼쪽 여백 크기 (0 보다 크면 설정된 크기)
        paddingTop : 0, // 위쪽 여백 크기 (0 보다 크면 설정된 크기)
        paddingRight : 0, // 오른쪽 여백 크기 (0 보다 크면 설정된 크기)
        paddingBottom : 0, // 아래쪽 여백 크기 (0 보다 크면 설정된 크기)
        textAlign : "left", // 텍스트 정렬 (left, center, right)
        wordBreak : "normal", // 텍스트 줄 바꿈 (normal: 일반, breakall: 글자 단위, keepall: 공백 단위)
        textWidth : 0, // 텍스트 너비 (Canvas의 너비)
        textHeight : 0 // 텍스트 높이 (Canvas의 높이)
    };
    // assign
    Object.assign(property, textProperty);

    let fontFace = null;
    // 외부 폰트 사용
    if (property.fontName != "" && property.fontUrl != "") {
        fontFace = await fontLoader(property.fontName, property.fontUrl);
        document.fonts.add(fontFace as FontFace);
    } else if (property.fontName == "") {
        property.fontName = "Gulim";
    }

    // 텍스트 라인 높이
    property.lineHeight = property.fontSize + 6;

    // Canvas 생성
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = property.fontWeight + " " + property.fontSize + "px " + property.fontName;

    // 텍스트 너비와 높이 설정
    property.textWidth = 0;
    property.textHeight = property.lineHeight;

    // 임의 문자열로 분리하여 텍스트 배열 생성
    let texts = property.text.split("<<tfl-create-text>>");

    // 자동 줄바꿈
    if (property.autoOverflowWrap) {
        // 줄바꿈 문자열 - Line-Feed
        // 줄바꿈 문자열로 분리하여 텍스트 배열 생성
        texts = property.text.split("\\\\n");
        let maxWidth = 0;
        let totalHeight = (property.lineHeight * texts.length) + (property.lineSpace * (texts.length - 1));
        for (let index = 0; index < texts.length; index++) {
            const metrics = context.measureText(texts[index]);
            if (maxWidth < metrics.width) {
                maxWidth = metrics.width;
            }
        }
        // 최대 너비와 높이로 설정
        property.textWidth = maxWidth;
        property.textHeight = totalHeight;
    } else {
        const metrics = context.measureText(texts[0]);
        // 텍스트 배열이 하나이므로 너비만 설정
        property.textWidth = metrics.width;
    }

    // 고정 너비로 텍스트 자동 줄바꿈
    if (property.fixedWidth > 0) {
        // 고정 너비 = (고정 너비 - 왼쪽 여백 크기 - 오른쪽 여백 크기) * 텍스트 비율
        const fixedWidth = (property.fixedWidth - property.paddingLeft - property.paddingRight) * property.fontRatio;
        // 텍스트 라인 배열
        const textLines = [];
        for (let index = 0; index < texts.length; index++) {
            const text = texts[index];
            let textLine = "";
            if (property.wordBreak == "breakall") {
                // 글자 단위로 텍스트 너비 비교
                for (let index2 = 0; index2 < text.length; index2++) {
                    const metrics = context.measureText(textLine + text[index2]);
                    if (metrics.width > fixedWidth) {
                        if (text[index2] != " ") {
                            textLines.push(textLine);
                            textLine = text[index2];
                        } else {
                            textLines.push(textLine);
                            textLine = "";
                        }
                    } else {
                        textLine += text[index2];
                    }
                }
                if (textLine != "") {
                    textLines.push(textLine);
                }
            } else if (property.wordBreak == "keepall") {
                // 공백 단위로 텍스트 너비 비교
                const textKeepAll = text.split(" ");
                for (let index2 = 0; index2 < textKeepAll.length; index2++) {
                    const metrics = context.measureText(textLine + textKeepAll[index2] + " ");
                    if (metrics.width > fixedWidth) {
                        textLines.push(textLine);
                        textLine = textKeepAll[index2];
                    } else {
                        textLine += textKeepAll[index2];
                    }
                    textLine += " ";
                }
                if (textLine != "") {
                    textLines.push(textLine);
                }
            } else {
                // 글자 단위로 텍스트 너비 비교
                for (let index2 = 0; index2 < text.length; index2++) {
                    const metrics = context.measureText(textLine + text[index2]);
                    if (metrics.width > fixedWidth) {
                        textLines.push(textLine);
                        textLine = "";
                        break;
                    } else {
                        textLine += text[index2];
                    }
                }
                if (textLine != "") {
                    textLines.push(textLine);
                    break;
                }
            }
        }

        // 고정 너비로 설정
        property.textWidth = property.fixedWidth * property.fontRatio;
        if (textLines.length > 0) {
            // 텍스트 라인 배열로 높이 설정
            property.textHeight = (property.lineHeight * textLines.length) + (property.lineSpace * (textLines.length - 1));
            // 텍스트 라인 배열로 텍스트 배열 변경
            texts = textLines;
        }
    }

    // Canvas 설정
    canvas.width = property.textWidth;
    canvas.height = property.textHeight;

    // 텍스트 정렬 (left, center, right)
    let textPositionX = 0;
    if (property.fixedWidth > 0) {
        if (property.textAlign == "left") {
            textPositionX = property.paddingLeft * property.fontRatio;
        } else if (property.textAlign == "center") {
            textPositionX = (property.textWidth * 0.5);
        } else if (property.textAlign == "right") {
            textPositionX = property.textWidth - (property.paddingRight * property.fontRatio);
        }
    }
    
    context.font = property.fontWeight + " " + property.fontSize + "px " + property.fontName;
    context.textAlign = property.textAlign as CanvasTextAlign;
    context.textBaseline = "middle" as CanvasTextBaseline;
    // 배경 클리어
    context.clearRect(0, 0, canvas.width, canvas.height);

    // 배경 색상
    if (property.backgroundColorText != "") {
        context.fillStyle = property.backgroundColorText;
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    // 텍스트 색상
    context.fillStyle = property.fontColorText;

    // 텍스트 배열을 정렬하여 출력
    for (let index = 0; index < texts.length; index++) {
        context.fillText(texts[index], textPositionX, (property.lineHeight * 0.5) + ((property.lineHeight + property.lineSpace) * index) + 1); // lineHeight
    }

    // 텍스트 텍스처
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    // canvas 제거
    canvas.remove();

    if (fontFace != null) {
        document.fonts.delete(fontFace as FontFace);
    }

    return [texture, property];
}

// 텍스트 머티리얼 생성
export async function createTextMaterial(textProperty : any) {
    const result = await createTextTexture(textProperty);
    const texture = result[0] as THREE.Texture;
    const property = result[1] as any;

    let material = null;
    if (property.backgroundColorText != "") {
        material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide})
    } else {
        material = new THREE.MeshBasicMaterial({map: texture, color: 0XFFFFFF, transparent: true, side: THREE.DoubleSide})
    }

    return [material, property];
}

// 텍스트 매쉬 생성
export async function createTextMesh(textProperty : any) {
    const result = await createTextMaterial(textProperty);
    const material = result[0] as THREE.MeshBasicMaterial;
    const property = result[1] as any;

    return new THREE.Mesh(new THREE.PlaneGeometry(property.textWidth / property.fontRatio, property.textHeight / property.fontRatio), material);
}

