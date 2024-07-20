// Panel
export const PANEL = {
    PANEL_DEPTH : 0.02,
    PANEL_SPACING : 0.01
}

// Color
export const COLOR = {
    COLOR_BACK_HEX : 0x1A1A1A,
    COLOR_BACK_HIGHLIGHT_HEX : 0x313131
}

// Folder
export const FOLDER = {
    FOLDER_WIDTH : 1.0,
    FOLDER_HEIGHT : 0.24,
    FOLDER_SPACING : 0.01,
    FOLDER_DEPTH : 0.01,
    FOLDER_COLOR_HEX : 0x1A1A1A,
    FOLDER_COLOR_HIGHLIGHT_HEX : 0x3A3A3A
}

// Item
export const ITEM = {
    ITEM_WIDTH : 1.0,
    ITEM_HEIGHT : 0.24,
    ITEM_SPACING : 0.01,
    ITEM_DEPTH : 0.01,
    ITEM_COLOR_HEX : 0x5A5A5A
}

// Label
export const LABEL = {
    LABEL_DEPTH : 0.011
}

// Tab
export const TAB = {
    TAB_WIDTH : 0.3,
    TAB_HEIGHT : 0.3,
    TAB_PADDING : 0.1,
    TAB_SPACING : 0.01,
    TAB_DEPTH : 0.01,
    TAB_INACTIVE_COLOR_HEX : 0x6A6A6A,
    TAB_ACTIVE_COLOR_HEX : 0xC5C4C4,
    TAB_CONTROL_WIDTH : 1.0,
    TAB_CONTROL_HEIGHT : 1.0,
    TAB_CONTROL_PADDING : 0.03,
    TAB_ITEM_WIDTH : 1.0,
    TAB_ITEM_HEIGHT : 0.24,
    TAB_ITEM_SPACING : 0.02,
    TAB_ITEM_DEPTH : 0.01,
    TAB_ITEM_COLOR_HEX : 0x9A9A9A
}

// 패널 생성 (박스 타입)
export function createPanel(width : number, height : number, depth : number, backgroundColor : number) {
    const boxGeometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshBasicMaterial({color: 0xffffff});
    const panel = new THREE.Mesh(boxGeometry, material);
    panel.geometry.translate(width * 0.5, -height * 0.5, 0);

    if (backgroundColor != undefined && backgroundColor != null) {
        material.color.setHex(backgroundColor);
    } else {
        material.color.setHex(COLOR.COLOR_BACK_HEX);
    }

    return panel;
}

// 아래 방향 화살표 생성
export function createDownArrow() {
    const width = 0.04;
    const height = 0.04;
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(-width, height);
    shape.lineTo(width, height);
    shape.lineTo(0, 0);
  
    const shapeGeometry = new THREE.ShapeGeometry(shape);
    shapeGeometry.translate(0, -height * 0.5, 0);
  
    return new THREE.Mesh(shapeGeometry, new THREE.MeshBasicMaterial({color: 0xffffff}));
}

// 한글 텍스트 생성
export function creatorText(text : string) {
    const fontWeight = "normal";
    const fontSize = 16;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = fontWeight + " " + fontSize + "px Gulim";

    const metrics = context.measureText(text);

    const textWidth = metrics.width;
    const textHeight = fontSize + 10;

    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = fontWeight + " " + fontSize + "px Gulim";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#000000";
    context.fillText(text, textWidth/2, textHeight/2);

    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;

    canvas.remove();

    const textMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xFFFFFF, transparent: true, side: THREE.DoubleSide});

    return new THREE.Mesh(new THREE.PlaneGeometry(textWidth / 140, textHeight / 140), textMaterial);
}

