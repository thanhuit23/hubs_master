import type { HubsWorld } from "../app";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton, TFLMenuPopControlsMenu, TFLMenuPopControlsSubMenu, TFLMenuPopControlsPopClose } from "../bit-components";
import { meshDispose, creatorText, creatorRoundedRectangleTop, creatorRoundedRectangleBottom, creatorRoundedRectangleBorder } from "./tfl-control-common";
import { addEntity, addComponent, removeComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";

// 메뉴 팝업
const MENUPOP = {
    MENU_WIDTH : 1,
    MENU_HEIGHT : 0.2, 
    MENU_PADDING_TOP : 0.03,
    MENU_PADDING_BOTTOM : 0.03,
    MENU_PADDING_LEFT : 0.36,
    MENU_PADDING_RIGHT : 0.36,
    MENU_SPACING : 0.003,
    MENU_CURVE : 0.1,
    MENU_HEADER_HEIGHT : 0.2,
    MENU_FONT_SIZE : 16,
    MENU_FONT_COLOR : "#000000",
    MENU_FONT_WEIGHT : "normal", // normal, bolder
    MENU_COLOR_HEX : 0x000000,
    MENU_OPACITY : 0.8,
    MENU_SUBMENU_COLOR_HEX : 0x000000,
    MENU_HIGHLIGHT_COLOR_HEX : 0x111111,
    MENU_ICON_COLOR_HEX : 0xFFFFFF,
    MENU_CONTROL_COLOR_HEX : 0x000000,
    MENU_CONTROL_BOARD_HEX : 0xFFFFFF,
    MENU_BOARD_THICKNESS : 0.02,
    MENU_OVER_POSITION_Z : 0.004,
    MENU_ICON_1_POSITION_X : 0.13,
    SUB_MENU_PADDING : 0.3
}

// 메뉴 아이콘 - 원 생성
function createIconCircle(colorHex : number) {
    const icon = new THREE.Group();
    // 아이콘 칼라
    let iconColor = MENUPOP.MENU_ICON_COLOR_HEX;
    if (colorHex != undefined && colorHex != null) {
        iconColor = colorHex;
    }
    // 링
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.04, 0.044, 32), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    icon.add(ring);
    // 원
    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.02, 32), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    circle.position.set(0, 0, 0.0001);
    ring.add(circle);
    //
    return icon;
}

// 메뉴 아이콘 - 체크 원 생성
function createIconCheckCircle(circleColorHex : number, checkColorHex : number) {
    const icon = new THREE.Group();
    // 아이콘 칼라
    let iconCircleColor = MENUPOP.MENU_ICON_COLOR_HEX;
    if (circleColorHex != undefined && circleColorHex != null) {
        iconCircleColor = circleColorHex;
    }
    let iconCheckColor = MENUPOP.MENU_COLOR_HEX;
    if (checkColorHex != undefined && checkColorHex != null) {
        iconCheckColor = checkColorHex;
    }
    // 원
    const circle = new THREE.Mesh(new THREE.CircleGeometry(0.044, 32), new THREE.MeshBasicMaterial({color: iconCircleColor, side: THREE.DoubleSide,}));
    icon.add(circle);
    // 체크
    const checkShape = new THREE.Shape();
    checkShape.moveTo(-0.02, 0.01);
    checkShape.lineTo(-0.025, 0.002);
    checkShape.lineTo(0, -0.03);
    checkShape.lineTo(0.03, 0.020);
    checkShape.lineTo(0.025, 0.028);
    checkShape.lineTo(0, -0.015);
    checkShape.lineTo(-0.02, 0.01);
    const check = new THREE.Mesh(new THREE.ShapeGeometry(checkShape), new THREE.MeshBasicMaterial({color: iconCheckColor, side: THREE.DoubleSide}));
    check.position.set(0, 0, 0.0001);
    circle.add(check);
    //
    return icon;
}

// 메뉴 아이콘 - 닫기 생성
function createIconClose(colorControlHex : number, colorHex : number) {
    const icon = new THREE.Group();
    // 아이콘 칼라
    let controlColor = MENUPOP.MENU_ICON_COLOR_HEX;
    if (colorControlHex != undefined && colorControlHex != null) {
        controlColor = colorControlHex;
    }
    // 아이콘 칼라
    let iconColor = MENUPOP.MENU_ICON_COLOR_HEX;
    if (colorHex != undefined && colorHex != null) {
        iconColor = colorHex;
    }
    // 링
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.054, 32), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    icon.add(ring);
    // 원
    const inCircle = new THREE.Mesh(new THREE.CircleGeometry(0.050, 32), new THREE.MeshBasicMaterial({color: controlColor, side: THREE.DoubleSide}));
    ring.add(inCircle);
    inCircle.position.set(0,0, 0.0001);
    // 클로즈
    const closeShape = new THREE.Shape();
    closeShape.moveTo(0, 0.005);
    closeShape.lineTo(-0.015, 0.02);
    closeShape.lineTo(-0.02, 0.02);
    closeShape.lineTo(-0.005, 0);
    closeShape.lineTo(-0.02, -0.02);
    closeShape.lineTo(-0.015, -0.02);
    closeShape.lineTo(0, -0.005);
    closeShape.lineTo(0.015, -0.02);
    closeShape.lineTo(0.02, -0.02);
    closeShape.lineTo(0.005, 0);
    closeShape.lineTo(0.02, 0.02);
    closeShape.lineTo(0.015, 0.02);
    closeShape.moveTo(0, 0.005);
    const close = new THREE.Mesh(new THREE.ShapeGeometry(closeShape), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    inCircle.add(close);
    close.position.set(0, 0, 0.0001);
    //
    return icon;
}

// 서브 메뉴 클래스
class TFL_MenuPopControls_SubMenu {
    // 서브 메뉴
    subMenu : THREE.Mesh;
    subMenuEid : number = 0;
    // 스크린
    world : HubsWorld;
    // 메뉴
    parent : TFL_MenuPopControls_Menu;
    // 서브 메뉴 타이틀
    title : string = "";
    // 서브 메뉴 가로 크기
    width : number = 0;
    // 서브 메뉴 세로 크기
    height : number = 0;
    // 서브 메뉴 라벨 가로 크기
    labelWidth : number = 0;
    // 서브 메뉴 라벨 가로 크기
    labelHeight : number = 0;

    // 서브 메뉴 클래스 생성
    constructor(world : HubsWorld, parent : TFL_MenuPopControls_Menu, title : string) {
        // 스크린
        this.world = world;
        // 메뉴 컨트롤
        this.parent = parent;
        // 메뉴 타이틀
        this.title = title;
        // 서브 메뉴 가로 크기
        this.width = parent.width;

        // 라벨 생성
        const textInfo = {
            text : title,
            fontColor : parent.fontColor,
            fontSize : parent.fontSize,
            fontWeight : parent.fontWeight,
            autoCRLF : true
        }
        const label = creatorText(textInfo);
        // 라벨 가로/세로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        this.labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        this.labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;
        this.height = MENUPOP.MENU_HEIGHT;
        if (this.height < (this.labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM)) {
            this.height = (this.labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM);
        }
        // 패널 생성
        const subMenuGeometry = new THREE.PlaneGeometry(parent.width, this.height);
        const subMenuMaterial = new THREE.MeshBasicMaterial({color: MENUPOP.MENU_SUBMENU_COLOR_HEX, transparent: parent.transparent, opacity: 0.8, side: THREE.DoubleSide});
        this.subMenu = new THREE.Mesh(subMenuGeometry, subMenuMaterial);
        this.subMenu.position.set(0, 0, 0);
        // 아이콘 생성
        const mwnuIcon = createIconCircle(parent.iconColor);
        mwnuIcon.position.set(-(parent.width * 0.5) + MENUPOP.MENU_ICON_1_POSITION_X, 0, MENUPOP.MENU_OVER_POSITION_Z);
        this.subMenu.add(mwnuIcon);
        // 라벨 추가
        this.subMenu.add(label);
        label.position.set(0, 0, MENUPOP.MENU_OVER_POSITION_Z);

        this.subMenuEid = addEntity(this.world);
        addObject3DComponent(this.world, this.subMenuEid, this.getMesh());
        addComponent(world, TFLMenuPopControlsSubMenu, this.subMenuEid); // TFLMenuPopControlsSubMenu
        addComponent(world, CursorRaycastable, this.subMenuEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.subMenuEid); // Hover
        addComponent(world, SingleActionButton, this.subMenuEid); // Click
    }

    // 서브 메뉴 숨기
    hide = function() {
        this.subMenu.visible = false;
        this.subMenu.matrixNeedsUpdate = true;
    }

    // 서브 메뉴 노출
    show = function() {
        this.subMenu.visible = true;
        this.subMenu.matrixNeedsUpdate = true;
    }
    
    // 서브 메뉴 위치 조정
    rePosition = function(width : number) {
        this.subMenu.geometry.dispose();
        this.subMenu.geometry = new THREE.PlaneGeometry(width, this.height);
        this.subMenu.position.x = 0;
        this.subMenu.children[0].position.x = -(width * 0.5) + MENUPOP.MENU_ICON_1_POSITION_X;
        this.subMenu.children[0].matrixNeedsUpdate = true;
        this.subMenu.matrixNeedsUpdate = true;
    }

    // 서브 메뉴 호버
    updateHover = function(hovering : boolean) {
        if (hovering) {
            this.subMenu.material.color.setHex(MENUPOP.MENU_HIGHLIGHT_COLOR_HEX);
        } else {
            this.subMenu.material.color.setHex(MENUPOP.MENU_SUBMENU_COLOR_HEX);
        }
    }

    remove = () => {
        addComponent(this.world, TFLMenuPopControlsSubMenu, this.subMenuEid); // TFLMenuPopControlsSubMenu
        addComponent(this.world, CursorRaycastable, this.subMenuEid); // Raycast
        addComponent(this.world, RemoteHoverTarget, this.subMenuEid); // Hover
        addComponent(this.world, SingleActionButton, this.subMenuEid); // Click
        this.subMenu.matrixNeedsUpdate = true;
    }

    // 서브 메뉴 클래스에서 메시 가져오기
    getMesh = () => {
        return this.subMenu;
    }
}

// 메뉴 클래스
class TFL_MenuPopControls_Menu {
    menu : THREE.Group = new THREE.Group();
    menuEid : number = 0;
    // 스크린
    world : HubsWorld;
    // 메뉴 컨트롤
    parent : TFL_MenuPopControls;
    // 메뉴 타이틀
    title : string = "";
    // 메뉴 가로 크기
    width : number = 0;
    // 메뉴 세로 크기
    height : number = 0;
    // 메뉴 폰트 크기
    fontSize : number = MENUPOP.MENU_FONT_SIZE;
    // 메뉴 폰트 칼라
    fontColor : string = MENUPOP.MENU_FONT_COLOR;
    // 메뉴 폰트 두께
    fontWeight : string = MENUPOP.MENU_FONT_WEIGHT;
    // 메뉴 아이콘 칼라
    iconColor : number = MENUPOP.MENU_ICON_COLOR_HEX;
    // 메뉴 투명여부
    transparent : boolean = false;
    // 메뉴 투명도
    opacity : number = 0.5;

    // 서브 메뉴 리스트
    subMenuList : Array<TFL_MenuPopControls_SubMenu> = [];
    subMenus : THREE.Group = new THREE.Group();
    // 메뉴 라벨 가로 크기
    labelWidth : number = 0;
    // 서브 메뉴 라벨 가로 크기
    labelHeight : number = 0;

    // 서브 메뉴 라벨 가로 크기
    subMenuWidth : number = 0;

    // 메뉴 클래스 생성
    constructor(world : HubsWorld, parent : TFL_MenuPopControls, title : string) {
        // 스크린
        this.world = world;
        // 메뉴 컨트롤
        this.parent = parent;
        // 메뉴 타이틀
        this.title = title;
        // 메뉴 가로 크기
        this.width = parent.width;
        // 메뉴 폰트 크기
        this.fontSize = parent.fontSize;
        // 메뉴 폰트 칼라
        this.fontColor = parent.fontColor;
        // 메뉴 폰트 두께
        this.fontWeight = parent.fontWeight;
        // 아이콘 칼라
        this.iconColor = parent.iconColor;
        // 메뉴 컨트롤 투명여부
        this.transparent = parent.transparent;
        // 메뉴 컨트롤 투명도
        this.opacity = parent.opacity;

        // 라벨 생성
        const textInfo = {
            text : this.title,
            fontColor : this.fontColor,
            fontSize : this.fontSize,
            fontWeight : this.fontWeight,
            autoCRLF : true
        }
        const label = creatorText(textInfo);
        // 라벨 가로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        this.labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        this.labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;
        this.height = MENUPOP.MENU_HEIGHT;
        if (this.height < (this.labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM)) {
            this.height = (this.labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM);
        }
        // 패널 생성
        const menuGeometry = new THREE.PlaneGeometry(parent.width, this.height);
        const menuMaterial = new THREE.MeshBasicMaterial({color: MENUPOP.MENU_COLOR_HEX, transparent: parent.transparent, opacity: parent.opacity, side: THREE.DoubleSide});
        const menuPanel = new THREE.Mesh(menuGeometry, menuMaterial);
        this.menu.add(menuPanel);
        menuPanel.position.set(0, -(this.height * 0.5), 0);
        // 아이콘 생성
        const mwnuIcon = createIconCheckCircle(parent.iconColor, MENUPOP.MENU_COLOR_HEX);
        menuPanel.add(mwnuIcon);
        mwnuIcon.position.set(-(parent.width * 0.5) + MENUPOP.MENU_ICON_1_POSITION_X, 0, MENUPOP.MENU_OVER_POSITION_Z);
        // 라벨 추가
        menuPanel.add(label);
        label.position.set(0, 0, MENUPOP.MENU_OVER_POSITION_Z);

        this.menuEid = addEntity(this.world);
        addObject3DComponent(this.world, this.menuEid, this.getMesh());
        addComponent(world, TFLMenuPopControlsMenu, this.menuEid); // TFLMenuPopControlsMenuHover
        addComponent(world, CursorRaycastable, this.menuEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.menuEid); // Hover
        addComponent(world, SingleActionButton, this.menuEid); // Click
    }

    // 서브 메뉴 추가
    addSubMenu = function (title : string) {
        const subMenu = new TFL_MenuPopControls_SubMenu(this.world, this, title);
        this.subMenuList.push(subMenu);
        this.subMenus.add(subMenu.getMesh());
        // 서브 메뉴 가로 크기 조정
        this.reSizeSubMenu();
        return subMenu;
    }

    // 서브 메뉴 가로 크기 조정
    reSizeSubMenu = function () {
        // 타이틀 / 메뉴 최대 가로 크기
        let labelMaxWidth = this.labelWidth;
        this.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            if (labelMaxWidth < child.labelWidth) {
                labelMaxWidth = child.labelWidth;
            }
        });
        // 여백 추가
        labelMaxWidth += (MENUPOP.SUB_MENU_PADDING * 2);
        this.subMenuWidth = labelMaxWidth;
        // Geometry 가로 크기 조정
        this.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            child.rePosition(labelMaxWidth);
        });
    }

    // 메뉴 크기와 위치 조정
    rePosition = function(width : number) {
        this.menu.children[0].geometry.dispose();
        this.menu.children[0].geometry = new THREE.PlaneGeometry(width, this.height);
        this.menu.children[0].children[0].position.x = -(width * 0.5) + MENUPOP.MENU_ICON_1_POSITION_X;
        this.menu.children[0].children[0].matrixNeedsUpdate = true;
        this.menu.children[0].matrixNeedsUpdate = true;
    }

    // 메뉴 레이아웃 업데이트
    performLayout = function() {
        // 메뉴 패널 위치
        let childY = this.getMesh().position.y;
        return childY;
    }

    // 메뉴 호버
    updateHover = function(hovering : boolean) {
        if (hovering) {
            this.menu.children[0].material.color.setHex(MENUPOP.MENU_HIGHLIGHT_COLOR_HEX);
        } else {
            this.menu.children[0].material.color.setHex(MENUPOP.MENU_COLOR_HEX);
        }
    }

    remove = () => {
        removeComponent(this.world, TFLMenuPopControlsMenu, this.menuEid); // TFLMenuPopControlsMenuHover
        removeComponent(this.world, CursorRaycastable, this.menuEid); // Raycast
        removeComponent(this.world, RemoteHoverTarget, this.menuEid); // Hover
        removeComponent(this.world, SingleActionButton, this.menuEid); // Click

        this.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            child.remove();
        });
        this.menu.remove(this.subMenus);
        this.menu.matrixNeedsUpdate = true;
    }

    // 메뉴 클래스에서 메시 가져오기
    getMesh = () => {
        return this.menu;
    }
}

// 팝업 메뉴 클래스
class TFL_PopMenuControls {
    popMmenuControls : THREE.Group = new THREE.Group();
    constolsEid : number = 0;
    // 스크린
    world : HubsWorld;
    // 팝업 메뉴 컨트롤 가로 크기
    width : number = MENUPOP.MENU_WIDTH;
    // 팝업 메뉴 컨트롤 커브 크기
    curve : number = MENUPOP.MENU_CURVE;
    // 팝업 메뉴 컨트롤 투명여부
    transparent : boolean = false;
    // 팝업 메뉴 컨트롤 투명도
    opacity : number = 0.5;
    // 메뉴 폰트 크기
    fontSize : number = MENUPOP.MENU_FONT_SIZE;
    // 팝업 메뉴 컨트롤 폰트 칼라
    fontColor : string = MENUPOP.MENU_FONT_COLOR;
    // 팝업 메뉴 컨트롤 폰트 두께
    fontWeight : string = MENUPOP.MENU_FONT_WEIGHT;
    // 팝업 메뉴 컨트롤 아이콘 칼라
    iconColor : number = MENUPOP.MENU_ICON_COLOR_HEX;
    // 팝업 메뉴 컨트롤 칼라
    controlColor : number = MENUPOP.MENU_CONTROL_COLOR_HEX;
    // 팝업 메뉴 컨트롤 보더 칼라
    boardColor : number = MENUPOP.MENU_CONTROL_BOARD_HEX;

    // 팝업 메뉴 컨트롤 타이틀
    title : string = "";
    // 메뉴
    menu : TFL_MenuPopControls_Menu | null = null;
    // 팝업 메뉴 닫기 아이콘
    closeIcon : THREE.Group;
    constolsCloseEid : number = 0;

    // 팝업 메뉴 컨트롤 클래스 생성
    constructor(world : HubsWorld, width : number = MENUPOP.MENU_WIDTH, curve : number = MENUPOP.MENU_CURVE, transparent : boolean = false, 
        opacity : number = 0.5, fontSize : number = MENUPOP.MENU_FONT_SIZE, fontColor : string = MENUPOP.MENU_FONT_COLOR, fontWeight : string = MENUPOP.MENU_FONT_WEIGHT, iconColorHex :number = MENUPOP.MENU_ICON_COLOR_HEX, 
        controlColorHex : number = MENUPOP.MENU_CONTROL_COLOR_HEX, boardColorHex : number = MENUPOP.MENU_CONTROL_BOARD_HEX) {
        // 스크린
        this.world = world;
        // 팝업 메뉴 컨트롤 가로 크기
        if (width != undefined && width != null) {
            this.width = width;
        }
        // 팝업 메뉴 컨트롤 커브 크기
        if (curve != undefined && curve != null) {
            this.curve = curve;
        }
        // 팝업 메뉴 컨트롤 투명여부
        if (transparent != undefined && transparent != null) {
            this.transparent = transparent;
        }
        // 팝업 메뉴 컨트롤 투명도
        if (opacity != undefined && opacity != null) {
            this.opacity = opacity;
        }
        // 메뉴 폰트 크기
        if (fontSize != undefined && fontSize != null) {
            this.fontSize = fontSize;
        }
        // 팝업 메뉴 컨트롤 폰트 칼라
        if (fontColor != undefined && fontColor != null) {
            this.fontColor = fontColor;
        }
        // 팝업 메뉴 컨트롤 폰트 두께
        if (fontWeight != undefined && fontWeight != null) {
            this.fontWeight = fontWeight;
        }
        // 팝업 메뉴 컨트롤 아이콘 칼라
        if (iconColorHex != undefined && iconColorHex != null) {
            this.iconColor = iconColorHex;
        }
        // 팝업 메뉴 컨트롤 칼라
        if (controlColorHex != undefined && controlColorHex != null) {
            this.controlColor = controlColorHex;
        }
        // 팝업 메뉴 컨트롤 보더 칼라
        if (boardColorHex != undefined && boardColorHex != null) {
            this.boardColor = boardColorHex;
        }

        // 팝업 메뉴 닫기 아이콘 생성
        this.closeIcon = createIconClose(this.controlColor, this.iconColor);
        this.closeIcon.visible = false;
        this.popMmenuControls.add(this.closeIcon);
        this.closeIcon.position.x = this.width - 0.12;
        this.closeIcon.position.y = -(MENUPOP.MENU_HEADER_HEIGHT) * 0.5;
        this.closeIcon.position.z = MENUPOP.MENU_OVER_POSITION_Z;
        
        this.constolsCloseEid = addEntity(this.world);
        addObject3DComponent(this.world, this.constolsCloseEid, this.getMesh());
        addComponent(this.world, TFLMenuPopControlsPopClose, this.constolsCloseEid); // TFLMenuPopControlsPopClose
        addComponent(this.world, CursorRaycastable, this.constolsCloseEid); // Raycast
        addComponent(this.world, RemoteHoverTarget, this.constolsCloseEid); // Hover
        addComponent(this.world, SingleActionButton, this.constolsCloseEid); // Click
    }

    // 팝업 메뉴 레이아웃 업데이트
    performLayout = function(menu : TFL_MenuPopControls_Menu) {
        this.performRemoveLayout();
        
        // 팝업 메뉴 가로 크기
        let popMenuWidth = menu.subMenuWidth;
        // 팝업 메뉴 헤더 높이
        let menuHeaderHeight = MENUPOP.MENU_HEADER_HEIGHT;
        if (menuHeaderHeight < menu.height) {
            menuHeaderHeight = menu.height;
        }

        // 메뉴 컨트롤 헤더
        const layoutPopMenuHeader = creatorRoundedRectangleTop(popMenuWidth, menuHeaderHeight, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutPopMenuHeader.userData = {"meshType": "layoutPopMenuHeader"};
        layoutPopMenuHeader.type = "layoutPopMenuHeader";
        this.popMmenuControls.add(layoutPopMenuHeader);
        // 라벨 패널 생성
        const labelPanel = new THREE.Mesh(new THREE.PlaneGeometry(popMenuWidth - (this.curve * 2), menuHeaderHeight), new THREE.MeshBasicMaterial({color: this.controlColor, side: THREE.DoubleSide, transparent: true, opacity: this.opacity}));
        labelPanel.userData = {"meshType": "layoutPopMenuHeaderLabel"};
        labelPanel.type = "layoutPopMenuHeaderLabel";
        this.popMmenuControls.add(labelPanel);
        labelPanel.position.set(popMenuWidth * 0.5, -(menuHeaderHeight) * 0.5, 0);
        // 라벨 생성
        const textInfo = {
            text : menu.title,
            fontColor : this.fontColor,
            fontSize : this.fontSize,
            fontWeight : this.fontWeight,
            autoCRLF : true
        }
        const label = creatorText(textInfo);
        labelPanel.add(label);
        label.position.set(0, 0, MENUPOP.MENU_OVER_POSITION_Z);

        // 팝업 메뉴 닫기 아이콘
        this.closeIcon.position.x = popMenuWidth - 0.12;
        this.closeIcon.position.y = -(menuHeaderHeight) * 0.5;
        this.closeIcon.position.z = MENUPOP.MENU_OVER_POSITION_Z;
        this.closeIcon.matrixNeedsUpdate = true;
        this.closeIcon.visible = true;

        // 팝업 메뉴에 서브 메뉴 추가
        this.menu = menu;
        this.menu.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            child.show();
        });
        this.menu.subMenus.visible = true;
        this.popMmenuControls.add(this.menu.subMenus);
        this.menu.subMenus.position.set(popMenuWidth * 0.5, -menuHeaderHeight, 0);
    
        // 메뉴 위치
        let childY = -MENUPOP.MENU_SPACING;
        this.menu.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            child.getMesh().position.y = childY - (child.height * 0.5);
            // 서브 메뉴 레이아웃 업데이트
            childY -= (child.height + MENUPOP.MENU_SPACING);
            child.getMesh().matrixNeedsUpdate = true;
        });

        // 메뉴 컨트롤 세로 크기
        let menuHeight = MENUPOP.MENU_SPACING;
        this.menu.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
            menuHeight += (child.height + MENUPOP.MENU_SPACING);
        });
        this.height = menuHeaderHeight + menuHeight + this.curve;

        // 메뉴 컨트롤 푸터
        const layoutPopMenuFooter = creatorRoundedRectangleBottom(popMenuWidth, this.height, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutPopMenuFooter.userData = {"meshType": "layoutPopMenuFooter"};
        layoutPopMenuFooter.type = "layoutPopMenuFooter";
        this.popMmenuControls.add(layoutPopMenuFooter);

        // 메뉴 컨트롤 보더
        const layoutPopMenuBoard = creatorRoundedRectangleBorder(popMenuWidth, this.height, this.boardColor, MENUPOP.MENU_BOARD_THICKNESS, this.curve, this.curve, this.curve, this.curve);
        layoutPopMenuBoard.userData = {"meshType": "layoutPopMenuBoard"};
        layoutPopMenuBoard.type = "layoutPopMenuBoard";
        this.popMmenuControls.add(layoutPopMenuBoard);

        this.popMmenuControls.visible = true;
        this.popMmenuControls.matrixNeedsUpdate = true;
    }

    // 팝업 메뉴 레이아웃 업데이트
    performRemoveLayout = function() {
        this.popMmenuControls.visible = false;
        // 팝업 메뉴 닫기 아이콘
        this.closeIcon.visible = false;

        // 팝업 메뉴 컨트롤 헤더 제거
        const layoutPopMenuHeaderMesh = this.popMmenuControls.getObjectByProperty("type", "layoutPopMenuHeader");
        if (layoutPopMenuHeaderMesh != undefined && layoutPopMenuHeaderMesh != null) {
            meshDispose(layoutPopMenuHeaderMesh);
            this.popMmenuControls.remove(layoutPopMenuHeaderMesh);
        }
        // 팝업 메뉴 컨트롤 헤더 라벨 제거
        const layoutPopMenuHeaderLabelMesh = this.popMmenuControls.getObjectByProperty("type", "layoutPopMenuHeaderLabel");
        if (layoutPopMenuHeaderLabelMesh != undefined && layoutPopMenuHeaderLabelMesh != null) {
            meshDispose(layoutPopMenuHeaderLabelMesh);
            this.popMmenuControls.remove(layoutPopMenuHeaderLabelMesh);
        }
        // 팝업 메뉴 컨트롤 푸터 제거
        const layoutPopMenuFooterMesh = this.popMmenuControls.getObjectByProperty("type", "layoutPopMenuFooter");
        if (layoutPopMenuFooterMesh != undefined && layoutPopMenuFooterMesh != null) {
            meshDispose(layoutPopMenuFooterMesh);
            this.popMmenuControls.remove(layoutPopMenuFooterMesh);
        }
        // 팝업 메뉴 컨트롤 보더 제거
        const layoutPopMenuBoardMesh = this.popMmenuControls.getObjectByProperty("type", "layoutPopMenuBoard");
        if (layoutPopMenuBoardMesh != undefined && layoutPopMenuBoardMesh != null) {
            meshDispose(layoutPopMenuBoardMesh);
            this.popMmenuControls.remove(layoutPopMenuBoardMesh);
        }

        // 팝업 메뉴에서 서브 메뉴 제거
        if (this.menu != null) {
            this.menu.subMenuList.forEach(function (child : TFL_MenuPopControls_SubMenu) {
                child.hide();
            });
            this.menu.subMenus.visible = false;
            this.popMmenuControls.remove(this.menu.subMenus);
            this.popMmenuControls.matrixNeedsUpdate = true;
            this.menu = null;
        }
    }

    // 팝업 메뉴 컨트롤 클래스에서 메시 가져오기
    getMesh = () => {
        return this.popMmenuControls;
    }
}

// 메뉴 팝업 컨트롤 클래스
export class TFL_MenuPopControls {
    menuPopControls : THREE.Group = new THREE.Group();
    constolsEid : number = 0;
    // 스크린
    world : HubsWorld;
    // 메뉴 팝업 컨트롤 타이틀
    title : string = "";
    // 메뉴 팝업 컨트롤 가로 크기
    width : number = MENUPOP.MENU_WIDTH;
    // 메뉴 팝업 컨트롤 커브 크기
    curve : number = MENUPOP.MENU_CURVE;
    // 메뉴 팝업 컨트롤 투명여부
    transparent : boolean = false;
    // 메뉴 팝업 컨트롤 투명도
    opacity : number = 0.5;
    // 메뉴 폰트 크기
    fontSize : number = MENUPOP.MENU_FONT_SIZE;
    // 메뉴 팝업 컨트롤 폰트 칼라
    fontColor : string = MENUPOP.MENU_FONT_COLOR;
    // 메뉴 팝업 컨트롤 폰트 두께
    fontWeight : string = MENUPOP.MENU_FONT_WEIGHT;
    // 메뉴 팝업 컨트롤 아이콘 칼라
    iconColor : number = MENUPOP.MENU_ICON_COLOR_HEX;
    // 메뉴 팝업 컨트롤 칼라
    controlColor : number = MENUPOP.MENU_CONTROL_COLOR_HEX;
    // 메뉴 팝업 컨트롤 보더 칼라
    boardColor : number = MENUPOP.MENU_CONTROL_BOARD_HEX;

    // 메뉴 리스트
    menuList : Array<TFL_MenuPopControls_Menu> = [];
    menus : THREE.Group = new THREE.Group();
    // 메뉴 팝업 컨트롤 초기 레이아웃 여부
    init = false;
    // 팝업 메뉴 컨트롤
    popMenuControl : THREE.Group;
    
    // 메뉴 팝업 컨트롤 클래스 생성
    constructor(world : HubsWorld, title : string, width : number, curve : number, transparent : boolean, 
        opacity : number, fontSize : number, fontColor : string, fontWeight : string, iconColorHex :number, 
        controlColorHex : number, boardColorHex : number) {
        // 스크린
        this.world = world;
        // 메뉴 팝업 컨트롤 타이틀
        this.title = title;
        // 메뉴 팝업 컨트롤 가로 크기
        if (width != undefined && width != null) {
            this.width = width;
        }
        // 메뉴 팝업 컨트롤 커브 크기
        if (curve != undefined && curve != null) {
            this.curve = curve;
        }
        // 메뉴 팝업 컨트롤 투명여부
        if (transparent != undefined && transparent != null) {
            this.transparent = transparent;
        }
        // 메뉴 팝업 컨트롤 투명도
        if (opacity != undefined && opacity != null) {
            this.opacity = opacity;
        }
        // 메뉴 폰트 크기
        if (fontSize != undefined && fontSize != null) {
            this.fontSize = fontSize;
        }
        // 메뉴 팝업 컨트롤 폰트 칼라
        if (fontColor != undefined && fontColor != null) {
            this.fontColor = fontColor;
        }
        // 메뉴 팝업 컨트롤 폰트 두께
        if (fontWeight != undefined && fontWeight != null) {
            this.fontWeight = fontWeight;
        }
        // 메뉴 팝업 컨트롤 아이콘 칼라
        if (iconColorHex != undefined && iconColorHex != null) {
            this.iconColor = iconColorHex;
        }
        // 메뉴 팝업 컨트롤 칼라
        if (controlColorHex != undefined && controlColorHex != null) {
            this.controlColor = controlColorHex;
        }
        // 메뉴 팝업 컨트롤 보더 칼라
        if (boardColorHex != undefined && boardColorHex != null) {
            this.boardColor = boardColorHex;
        }

        // 메뉴 위치
        this.menus.position.set(this.width * 0.5, 0, 0);
        this.menuPopControls.add(this.menus);

        this.constolsEid = addEntity(world);
        addObject3DComponent(world, this.constolsEid, this.getMesh());
    }

    // 메뉴 추가
    addMenu = function(title : string) {
        const menu = new TFL_MenuPopControls_Menu(this.world, this, title);
        this.menuList.push(menu);
        this.menus.add(menu.getMesh());
        // 메뉴 팝업의 가로 크기 조정
        this.reSizeMenu();
        // 메뉴 팝업 레이아웃 업데이트
        this.performLayout();
        return menu;
    }

    // 메뉴 팝업의 가로 크기 조정
    reSizeMenu = function () {
        // 라벨 생성
        const textInfo = {
            text : this.title,
            fontColor : this.fontColor,
            fontSize : this.fontSize,
            fontWeight : this.fontWeight,
            autoCRLF : true
        }
        const label = creatorText(textInfo);
        // 라벨 가로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        // 라벨 제거
        label.geometry.dispose();
        label.material.dispose();

        // 타이틀 / 메뉴 최대 가로 크기
        let labelMaxWidth = labelWidth;
        this.menuList.forEach(function (child : TFL_MenuPopControls_Menu) {
            if (labelMaxWidth < child.labelWidth) {
                labelMaxWidth = child.labelWidth;
            }
        });
        // 여백 추가
        labelMaxWidth += (MENUPOP.MENU_PADDING_LEFT + MENUPOP.MENU_PADDING_RIGHT);
        if (labelMaxWidth < this.menuPopControls.width) {
            labelMaxWidth = this.menuPopControls.width;
        }
        this.width = labelMaxWidth;
        // 메뉴 Geometry 가로 크기 조정
        this.menuList.forEach(function (child : TFL_MenuPopControls_Menu) {
            child.rePosition(labelMaxWidth);
        });
    }

    // 메뉴 팝업 컨트롤 초기 레이아웃
    initLayout = function () {
        if (this.init) {
            return;
        }
        // 메뉴 위치
        this.menus.position.set(this.width * 0.5, 0, 0);
        // 팝업 메뉴 생성
        this.popMenuControl = new TFL_PopMenuControls(this.world, this.width, this.curve, this.transparent, this.opacity, this.fontSize, this.fontColor, this.fontWeight, this.iconColor, this.controlColor, this.boardColor);
        this.popMenuControl.getMesh().visible = false;
        // 팝업 메뉴 추가
        this.menuPopControls.add(this.popMenuControl.getMesh());
        //
        this.init = true;
    }
    
    // 메뉴 팝업 컨트롤 레이아웃 업데이트
    performLayout = function() {
        if (!this.init) {
            return;
        }

        // 메뉴 팝업 컨트롤 헤더 제거
        const layoutMenuPopHeaderMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopHeader");
        if (layoutMenuPopHeaderMesh != undefined && layoutMenuPopHeaderMesh != null) {
            meshDispose(layoutMenuPopHeaderMesh);
            this.menuPopControls.remove(layoutMenuPopHeaderMesh);
        }
        // 메뉴 팝업 컨트롤 헤더 라벨 제거
        const layoutMenuPopHeaderLabelMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopHeaderLabel");
        if (layoutMenuPopHeaderLabelMesh != undefined && layoutMenuPopHeaderLabelMesh != null) {
            meshDispose(layoutMenuPopHeaderLabelMesh);
            this.menuPopControls.remove(layoutMenuPopHeaderLabelMesh);
        }
        // 메뉴 팝업 컨트롤 푸터 제거
        const layoutMenuPopFooterMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopFooter");
        if (layoutMenuPopFooterMesh != undefined && layoutMenuPopFooterMesh != null) {
            meshDispose(layoutMenuPopFooterMesh);
            this.menuPopControls.remove(layoutMenuPopFooterMesh);
        }
        // 메뉴 팝업 컨트롤 보더 제거
        const layoutMenuPopBoardMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopBoard");
        if (layoutMenuPopBoardMesh != undefined && layoutMenuPopBoardMesh != null) {
            meshDispose(layoutMenuPopBoardMesh);
            this.menuPopControls.remove(layoutMenuPopBoardMesh);
        }

        // 라벨 생성
        const textInfo = {
            text : this.title,
            fontColor : this.fontColor,
            fontSize : this.fontSize,
            fontWeight : this.fontWeight,
            autoCRLF : true
        }
        const label = creatorText(textInfo);
        // 라벨 가로/세로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;
        let menuHeaderHeight = MENUPOP.MENU_HEADER_HEIGHT;
        if (menuHeaderHeight < (labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM)) {
            menuHeaderHeight = (labelHeight + MENUPOP.MENU_PADDING_TOP + MENUPOP.MENU_PADDING_BOTTOM);
        }
        // 메뉴 컨트롤 헤더
        const layoutMenuPopHeader = creatorRoundedRectangleTop(this.width, menuHeaderHeight, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutMenuPopHeader.userData = {"meshType": "layoutMenuPopHeader"};
        layoutMenuPopHeader.type = "layoutMenuPopHeader";
        this.menuPopControls.add(layoutMenuPopHeader);
        // 라벨 패널 생성
        const labelPanel = new THREE.Mesh(new THREE.PlaneGeometry(this.width - (this.curve * 2), menuHeaderHeight), new THREE.MeshBasicMaterial({color: this.controlColor, side: THREE.DoubleSide, transparent: true, opacity: this.opacity}));
        labelPanel.userData = {"meshType": "layoutMenuPopHeaderLabel"};
        labelPanel.type = "layoutMenuPopHeaderLabel";
        this.menuPopControls.add(labelPanel);
        labelPanel.position.set(this.width * 0.5, -(menuHeaderHeight) * 0.5, 0);
        // 라벨 추가
        labelPanel.add(label);
        label.position.set(0, 0, MENUPOP.MENU_OVER_POSITION_Z);

        // 메뉴 위치
        let childY = -(menuHeaderHeight + MENUPOP.MENU_SPACING);
        this.menuList.forEach(function (child : TFL_MenuPopControls_Menu) {
            child.getMesh().position.y = childY;
            // 메뉴 레이아웃 업데이트
            childY = child.performLayout() - child.height - MENUPOP.MENU_SPACING;
            child.getMesh().matrixNeedsUpdate = true;
        });

        // 메뉴 컨트롤 세로 크기
        let menuHeight = MENUPOP.MENU_SPACING;
        this.menuList.forEach(function (child : TFL_MenuPopControls_Menu) {
            menuHeight += (child.height + MENUPOP.MENU_SPACING);
        });
        this.height = menuHeaderHeight + menuHeight + this.curve;

        // 메뉴 컨트롤 푸터
        const layoutMenuPopFooter = creatorRoundedRectangleBottom(this.width, this.height, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutMenuPopFooter.userData = {"meshType": "layoutMenuPopFooter"};
        layoutMenuPopFooter.type = "layoutMenuPopFooter";
        this.menuPopControls.add(layoutMenuPopFooter);

        // 메뉴 컨트롤 보더
        const layoutMenuPopBoard = creatorRoundedRectangleBorder(this.width, this.height, this.boardColor, MENUPOP.MENU_BOARD_THICKNESS, this.curve, this.curve, this.curve, this.curve);
        layoutMenuPopBoard.userData = {"meshType": "layoutMenuPOpBoard"};
        layoutMenuPopBoard.type = "layoutMenuPopBoard";
        this.menuPopControls.add(layoutMenuPopBoard);

        this.getMesh().matrixNeedsUpdate = true;
    }

    // 메뉴 팝업 컨트롤에 있는 메뉴에 대한 호버 처리
    updateMenuHover = function(selectedObj : THREE.Group) {
        this.menuList.forEach(function (menu : TFL_MenuPopControls_Menu) {
            if (selectedObj != null && menu.getMesh() == selectedObj) {
                menu.updateHover(true);
            }
        });
    }

    // 메뉴 팝업 컨트롤에 있는 메뉴에 대한 호버 처리
    updateMenuHoverOut = function(selectedObj : THREE.Group) {
        this.menuList.forEach(function (menu : TFL_MenuPopControls_Menu) {
            if (selectedObj != null && menu.getMesh() == selectedObj) {
                menu.updateHover(false);
            }
        });
    }

    // 메뉴 팝업 컨트롤에 있는 서브 메뉴에 대한 호버 처리
    updateSubMenuHover = function(selectedObj : THREE.Mesh) {
        this.menuList.forEach(function (menu : TFL_MenuPopControls_Menu) {
            if (selectedObj != null) {
                menu.subMenuList.forEach(function (subMenu : TFL_MenuPopControls_SubMenu) {
                    if (subMenu.getMesh() == selectedObj) {
                        subMenu.updateHover(true);
                    }
                });
            }
        });
    }

    // 메뉴 팝업 컨트롤에 있는 서브 메뉴에 대한 호버 처리
    updateSubMenuHoverOut = function(selectedObj : THREE.Mesh) {
        this.menuList.forEach(function (menu : TFL_MenuPopControls_Menu) {
            if (selectedObj != null) {
                menu.subMenuList.forEach(function (subMenu : TFL_MenuPopControls_SubMenu) {
                    if (subMenu.getMesh() == selectedObj) {
                        subMenu.updateHover(false);
                    }
                });
            }
        });
    }
    
    // 팝업 메뉴 오픈
    openPopMenu = function(selectedObj : THREE.Group) {
        let posX = (this.popMenuControl.width / 5) * 4; // 0
        let posY = -0.2; // 0
        let menu : TFL_MenuPopControls_Menu | null = null;
        for (let index = 0; index < this.menuList.length; index++) {
            let child = this.menuList[index];
            if (selectedObj != null && child.getMesh() == selectedObj) {
                //posX = child.position.x + ((menuPopControl.width / 5) * 4);
                //posY = child.position.y;
                menu = child;
                break;
            }
        }
        if (menu != null) {
            this.popMenuControl.performLayout(menu);
            this.popMenuControl.getMesh().position.set(posX, posY, 0.1);
        }
    }

    // 팝업 메뉴 닫기
    closePopMenu = function(selectedObj : THREE.Group) {
        this.popMenuControl.performRemoveLayout();
    }

    removeLayout = function() {
        if (!this.init) {
            return;
        }

        // 메뉴 팝업 컨트롤 헤더 제거
        const layoutMenuPopHeaderMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopHeader");
        if (layoutMenuPopHeaderMesh != undefined && layoutMenuPopHeaderMesh != null) {
            meshDispose(layoutMenuPopHeaderMesh);
            this.menuPopControls.remove(layoutMenuPopHeaderMesh);
        }
        // 메뉴 팝업 컨트롤 헤더 라벨 제거
        const layoutMenuPopHeaderLabelMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopHeaderLabel");
        if (layoutMenuPopHeaderLabelMesh != undefined && layoutMenuPopHeaderLabelMesh != null) {
            meshDispose(layoutMenuPopHeaderLabelMesh);
            this.menuPopControls.remove(layoutMenuPopHeaderLabelMesh);
        }
        // 메뉴 팝업 컨트롤 푸터 제거
        const layoutMenuPopFooterMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopFooter");
        if (layoutMenuPopFooterMesh != undefined && layoutMenuPopFooterMesh != null) {
            meshDispose(layoutMenuPopFooterMesh);
            this.menuPopControls.remove(layoutMenuPopFooterMesh);
        }
        // 메뉴 팝업 컨트롤 보더 제거
        const layoutMenuPopBoardMesh = this.menuPopControls.getObjectByProperty("type", "layoutMenuPopBoard");
        if (layoutMenuPopBoardMesh != undefined && layoutMenuPopBoardMesh != null) {
            meshDispose(layoutMenuPopBoardMesh);
            this.menuPopControls.remove(layoutMenuPopBoardMesh);
        }

        // remove
        this.menuList.forEach(function (menu : TFL_MenuPopControls_Menu) {
            menu.remove();
        });
        this.menuPopControls.remove(this.menus);
        this.menuPopControls.remove(this.popMenuControl.getMesh());

        this.getMesh().matrixNeedsUpdate = true;
    }

    // 메뉴 팝업 컨트롤 클래스에서 메시 가져오기
    getMesh = () => {
        return this.menuPopControls;
    }
}
