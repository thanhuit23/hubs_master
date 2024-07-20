// 매쉬 제거
export function meshDispose(selectedObj : THREE.Mesh) {
    if (selectedObj == undefined || selectedObj == null) {
        return;
    }
    // 자식부터 매쉬 제거
    if (selectedObj.children.length > 0) {
        for (let index = selectedObj.children.length - 1; index >= 0; index--) {
            if (selectedObj.children[index].type == "Mesh") {
                meshDispose(selectedObj.children[index] as THREE.Mesh);
                ((selectedObj.children[index] as THREE.Mesh).geometry as THREE.ShapeGeometry).dispose();
                ((selectedObj.children[index] as THREE.Mesh).material as THREE.MeshBasicMaterial).dispose();
            } else if (selectedObj.children[index].type == "Group")  {
                groupDispose(selectedObj.children[index] as THREE.Group);
            }
            selectedObj.remove(selectedObj.children[index]);
        }
    }
    (selectedObj.geometry as THREE.ShapeGeometry).dispose();
    (selectedObj.material as THREE.MeshBasicMaterial).dispose();
}

// 그룹 제거
export function groupDispose(selectedObj : THREE.Group) {
    if (selectedObj == undefined || selectedObj == null) {
        return;
    }
    // 자식부터 그룹 제거
    if (selectedObj.children.length > 0) {
        for (let index = selectedObj.children.length - 1; index >= 0; index--) {
            if (selectedObj.children[index].type == "Group")  {
                groupDispose(selectedObj.children[index] as THREE.Group);
            } else if (selectedObj.children[index].type == "Mesh") {
                meshDispose(selectedObj.children[index] as THREE.Mesh);
                ((selectedObj.children[index] as THREE.Mesh).geometry as THREE.ShapeGeometry).dispose();
                ((selectedObj.children[index] as THREE.Mesh).material  as THREE.MeshBasicMaterial).dispose();
            }
            selectedObj.remove(selectedObj.children[index]);
        }
    }
}

// 텍스트 생성
export function creatorText(textInfo : any) {
    // 기본 정보
    const baseInfo = {
        text : "", // 텍스트
        fontColor : "#FFFFFF", // 텍스트 색상
        fontSize : 16, // 텍스트 크기
        fontWeight : "normal", // 텍스트 굵기 (normal, bolder)
        fontRatio : 300, // 텍스트 비율
        backgroundColor : "", // 배경 색상
        lineHeight : 16, // 라인 높이
        lineSpace : 2, // 라인과 라인 사이 공간 높이
        autoCRLF : false // 텍스트 다음 라인 처리 여부
    }
    // assign
    Object.assign(baseInfo, textInfo);
    baseInfo.lineHeight = baseInfo.fontSize + 6;
    // canvas
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    // 텍스트 크기
    context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
    let textWidth = 0;
    let textHeight = 0;
    // 줄바꿈 문자열 - Line-Feed
    const texts = baseInfo.text.split("<LF>");
    if (baseInfo.autoCRLF && texts.length > 1) {
        let maxWidth = 0;
        let totalHeight = (baseInfo.lineHeight * texts.length) + (baseInfo.lineSpace * (texts.length - 1));
        for (let index = 0; index < texts.length; index++) {
            const metrics = context.measureText(texts[index]);
            if (maxWidth < metrics.width) {
                maxWidth = metrics.width;
            }
        }
        textWidth = maxWidth;
        textHeight = totalHeight;
        // 텍스트
        canvas.width = maxWidth;
        canvas.height = totalHeight;
        context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (baseInfo.backgroundColor != "") {
            context.fillStyle = baseInfo.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.fillStyle = baseInfo.fontColor;
        // 텍스트 가운데 정렬
        for (let index = 0; index < texts.length; index++) {
            context.fillText(texts[index], (maxWidth / 2), (baseInfo.lineHeight / 2) + ((baseInfo.lineHeight + baseInfo.lineSpace) * index)); // lineHeight
        }
    } else {
        const metrics = context.measureText(baseInfo.text);
        textWidth = metrics.width;
        textHeight = baseInfo.lineHeight;
        // 텍스트
        canvas.width = textWidth;
        canvas.height = textHeight;
        context.font = baseInfo.fontWeight + " " + baseInfo.fontSize + "px Gulim";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.clearRect(0, 0, canvas.width, canvas.height);
        if (baseInfo.backgroundColor != "") {
            context.fillStyle = baseInfo.backgroundColor;
            context.fillRect(0, 0, canvas.width, canvas.height);
        }
        context.fillStyle = baseInfo.fontColor;
        // 텍스트 가운데 정렬
        context.fillText(baseInfo.text, textWidth / 2, textHeight / 2);
    }
    // 텍스트 텍스처
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    // canvas 제거
    canvas.remove();
    //
    let MeshBasicMaterial = null;
    if (baseInfo.backgroundColor != "") {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide})
    } else {
        MeshBasicMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xFFFFFF, transparent: true, side: THREE.DoubleSide})
    }
    return new THREE.Mesh(new THREE.PlaneGeometry(textWidth / baseInfo.fontRatio, textHeight / baseInfo.fontRatio), MeshBasicMaterial);
}

// 모서리가 둥근 직사각형 상단 생성
// left-top-radius, top-right-radius
export function creatorRoundedRectangleTop(width : number, topheight : number, controlColor : number, transparent : boolean, opacity : number, lefttopradius : number, toprightradius : number) {
    const shapeHeader = new THREE.Shape();
    // left
    shapeHeader.moveTo(lefttopradius, 0); // top start
    shapeHeader.lineTo(lefttopradius, -topheight); // right line
    shapeHeader.lineTo(0, -topheight); // bottom line
    shapeHeader.lineTo(0, -lefttopradius); // left line
    shapeHeader.quadraticCurveTo(0, 0, lefttopradius, 0); // left top curve
    // right
    shapeHeader.moveTo(width - toprightradius, 0); // top start
    shapeHeader.quadraticCurveTo(width, 0, width, -toprightradius); // top right curve
    shapeHeader.lineTo(width, -topheight); // right line
    shapeHeader.lineTo(width - toprightradius, -topheight); // bottom line
    shapeHeader.lineTo(width - toprightradius, 0); // left line
    return new THREE.Mesh(new THREE.ShapeGeometry(shapeHeader), new THREE.MeshBasicMaterial({color: controlColor, side: THREE.DoubleSide, transparent: transparent, opacity: opacity}));
}

// 모서리가 둥근 직사각형 하단 생성
// right-bottom-radius, bottom-left-radius
export function creatorRoundedRectangleBottom(width : number, height : number, controlColor : number, transparent : boolean, opacity : number, rightbottomradius : number, bottomleftradius : number) {
    const shapeFooter = new THREE.Shape();
    shapeFooter.moveTo(0, -(height - bottomleftradius)); // top start
    shapeFooter.lineTo(width, -(height - rightbottomradius)); // top line
    shapeFooter.quadraticCurveTo(width, -height, width - rightbottomradius, -height); // right bottom curve
    shapeFooter.lineTo(bottomleftradius, -height); // bottom line
    shapeFooter.quadraticCurveTo(0, -height, 0, -(height - bottomleftradius)); // bottom left curve
    return new THREE.Mesh(new THREE.ShapeGeometry(shapeFooter), new THREE.MeshBasicMaterial({color: controlColor, side: THREE.DoubleSide, transparent: transparent, opacity: opacity}));
}

// 모서리가 둥근 직사각형 보더 테두리 생성
// left-top-radius, top-right-radius, right-bottom-radius, bottom-left-radius
export function creatorRoundedRectangleBorder(width : number, height : number, boardColor : number, thickness : number, lefttopradius : number, toprightradius : number, rightbottomradius : number, bottomleftradius : number) {
    const pathBorder = new THREE.Shape();
    pathBorder.moveTo(lefttopradius, thickness); // top start
    pathBorder.lineTo(width - toprightradius, thickness); // top line
    pathBorder.quadraticCurveTo(width + thickness, thickness, width + thickness, -toprightradius); // top right curve
    pathBorder.lineTo(width + thickness, -(height - rightbottomradius)); // right line
    pathBorder.quadraticCurveTo(width + thickness, -(height + thickness), width - rightbottomradius, -(height + thickness)); // right bottom curve
    pathBorder.lineTo(bottomleftradius, -(height + thickness)); // bottom line
    pathBorder.quadraticCurveTo(-thickness, -(height + thickness), -thickness, -(height - bottomleftradius)); // bottom left curve
    pathBorder.lineTo(-thickness, -lefttopradius); // left line
    pathBorder.quadraticCurveTo(-thickness, thickness, lefttopradius, thickness); // left top curve
    pathBorder.lineTo(lefttopradius, 0); // top end - top start
    pathBorder.quadraticCurveTo(0, 0, 0, -lefttopradius); // top left curve
    pathBorder.lineTo(0, -(height - bottomleftradius)); // left line
    pathBorder.quadraticCurveTo(0, -height, bottomleftradius, -height); // left bottom curve
    pathBorder.lineTo((width - rightbottomradius), -height); // bottom line
    pathBorder.quadraticCurveTo(width, -height, width, -(height - rightbottomradius)); // bottom right curve
    pathBorder.lineTo(width, -toprightradius); // right line
    pathBorder.quadraticCurveTo(width, 0, (width - toprightradius), 0); // right top curve
    pathBorder.lineTo(width - lefttopradius, 0); // top line
    pathBorder.lineTo(lefttopradius, 0); // top end
    return new THREE.Mesh(new THREE.ShapeGeometry(pathBorder), new THREE.MeshBasicMaterial({color: boardColor, side: THREE.DoubleSide}));
}
