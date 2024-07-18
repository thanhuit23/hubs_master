import type { HubsWorld } from "../app";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton, TFLMenuControlsMenuHover, TFLMenuControlsSubMenuHover } from "../bit-components";
import { meshDispose, creatorText, creatorRoundedRectangleTop, creatorRoundedRectangleBottom, creatorRoundedRectangleBorder } from "./tfl-control-common";
import { addEntity, addComponent, removeComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";

// 메뉴
const MENU = {
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
    MENU_SUBMENU_OPACITY : 0.5,
    MENU_HIGHLIGHT_COLOR_HEX : 0x111111,
    MENU_ICON_COLOR_HEX : 0xFFFFFF,
    MENU_CONTROL_COLOR_HEX : 0x000000,
    MENU_CONTROL_BOARD_HEX : 0xFFFFFF,
    MENU_BOARD_THICKNESS : 0.02,
    MENU_OVER_POSITION_Z : 0.004,
    MENU_ICON_1_POSITION_X : 0.13,
    MENU_ICON_2_POSITION_X : 0.23
}

// 메뉴 아이콘 - 화살표 생성
function createIconArrow(colorHex : number) {
    // 아이콘 칼라
    let iconColor = MENU.MENU_ICON_COLOR_HEX;
    if (colorHex != undefined && colorHex != null) {
        iconColor = colorHex;
    }
    // 화살표
    const playShape = new THREE.Shape();
    playShape.moveTo(-0.03, 0);
    playShape.lineTo(-0.04, 0.005);
    playShape.lineTo(0, 0.04);
    playShape.lineTo(0.04, 0.005);
    playShape.lineTo(0.03, 0);
    playShape.lineTo(0, 0.025);
    playShape.moveTo(-0.03, 0);
    return new THREE.Mesh(new THREE.ShapeGeometry(playShape), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
}

// 메뉴 아이콘 - 동영상 생성
function createIconPlay(colorHex : number) {
    const icon = new THREE.Group();
    // 아이콘 칼라
    let iconColor = MENU.MENU_ICON_COLOR_HEX;
    if (colorHex != undefined && colorHex != null) {
        iconColor = colorHex;
    }
    // 링
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.05, 0.054, 32), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    icon.add(ring);
    // 플레이
    const playShape = new THREE.Shape();
    playShape.moveTo(-0.01, -0.03);
    playShape.lineTo(-0.02, -0.03);
    playShape.lineTo(-0.02, 0.03);
    playShape.lineTo(-0.01, 0.03);
    playShape.lineTo(-0.01, -0.03);
    playShape.moveTo(0, -0.03);
    playShape.lineTo(0, 0.03);
    playShape.lineTo(0.03, 0);
    playShape.lineTo(0, -0.03);
    const play = new THREE.Mesh(new THREE.ShapeGeometry(playShape), new THREE.MeshBasicMaterial({color: iconColor, side: THREE.DoubleSide}));
    icon.add(play);
    //
    return icon;
}

// 서브 메뉴 클래스
class TFL_MenuControls_SubMenu {
    // 서브 메뉴
    subMenu : THREE.Mesh;
    subMenuEid : number = 0;
    //  스크린
    world : HubsWorld;
    // 메뉴 컨트롤
    parent : TFL_MenuControls_Menu;
    // 메뉴 타이틀
    title : string = "";
    // 서브 메뉴 가로 크기
    width : number = 0;
    // 서브 메뉴 세로 크기
    height : number = 0;
    // 서브 메뉴 라벨 가로 크기
    labelWidth : number = 0;
    // 서브 메뉴 라벨 세로 크기
    labelHeight : number = 0;

    // 서브 메뉴 클래스 생성
    constructor(world : HubsWorld, parent : TFL_MenuControls_Menu, title : string) {
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
        // 라벨 가로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        this.labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        this.labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;
        this.height = MENU.MENU_HEIGHT;
        if (this.height < (this.labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM)) {
            this.height = (this.labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM);
        }
        // 패널 생성
        const subMenuGeometry = new THREE.PlaneGeometry(parent.width, this.height);
        const subMenuMaterial = new THREE.MeshBasicMaterial({color: MENU.MENU_SUBMENU_COLOR_HEX, transparent: parent.transparent, opacity: MENU.MENU_SUBMENU_OPACITY, side: THREE.DoubleSide});
        this.subMenu = new THREE.Mesh(subMenuGeometry, subMenuMaterial);
        this.subMenu.position.set(0, 0, 0);

        // 아이콘 생성
        const mwnuIcon = createIconPlay(parent.iconColor);
        mwnuIcon.position.set(-(parent.width * 0.5) + MENU.MENU_ICON_2_POSITION_X, 0, MENU.MENU_OVER_POSITION_Z);
        this.subMenu.add(mwnuIcon);
        // 라벨 추가
        this.subMenu.add(label);
        label.position.set(0, 0, MENU.MENU_OVER_POSITION_Z);

        this.subMenuEid = addEntity(this.world);
        addObject3DComponent(this.world, this.subMenuEid, this.getMesh());
        addComponent(world, TFLMenuControlsSubMenuHover, this.subMenuEid); // TFLMenuControlsSubMenuHover
        addComponent(world, CursorRaycastable, this.subMenuEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.subMenuEid); // Hover
        addComponent(world, SingleActionButton, this.subMenuEid); // Click

    }

    // 서브 메뉴 위치 조정
    rePosition = function(width : number) {
        this.subMenu.geometry.dispose();
        this.subMenu.geometry = new THREE.PlaneGeometry(width, this.height);
        this.subMenu.position.x = 0;
        this.subMenu.children[0].position.x = -(width * 0.5) + MENU.MENU_ICON_2_POSITION_X;
        this.subMenu.matrixNeedsUpdate = true;
    }
    
    // 서브 메뉴 숨기
    hide = function() {
        this.subMenu.visible = false;
    }

    // 서브 메뉴 노출
    show = function() {
        this.subMenu.visible = true;
    }

    // 서브 메뉴 호버
    updateHover = function(hovering : boolean) {
        if (hovering) {
            this.subMenu.material.color.setHex(MENU.MENU_HIGHLIGHT_COLOR_HEX);
        } else {
            this.subMenu.material.color.setHex(MENU.MENU_SUBMENU_COLOR_HEX);
        }
    }

    remove = () => {
        removeComponent(this.world, TFLMenuControlsSubMenuHover, this.subMenuEid); // TFLMenuControlsSubMenuHover
        removeComponent(this.world, CursorRaycastable, this.subMenuEid); // Raycast
        removeComponent(this.world, RemoteHoverTarget, this.subMenuEid); // Hover
        removeComponent(this.world, SingleActionButton, this.subMenuEid); // Click
        this.subMenu.matrixNeedsUpdate = true;
    }

    // 서브 메뉴 클래스에서 메시 가져오기
    getMesh = () => {
        return this.subMenu;
    }
}

// 메뉴 클래스
class TFL_MenuControls_Menu {
    menu : THREE.Group = new THREE.Group();
    menuEid : number = 0;
    //  스크린
    world : HubsWorld;
    // 메뉴 컨트롤
    parent : TFL_MenuControls;
    // 메뉴 타이틀
    title : string = "";
    // 메뉴 가로 크기
    width : number = 0;
    // 메뉴 세로 크기
    height : number = 0;
    // 메뉴 폰트 크기
    fontSize : number = MENU.MENU_FONT_SIZE;
    // 메뉴 폰트 칼라
    fontColor : string = MENU.MENU_FONT_COLOR;
    // 메뉴 폰트 두께
    fontWeight : string = MENU.MENU_FONT_WEIGHT;
    // 메뉴 아이콘 칼라
    iconColor : number = MENU.MENU_ICON_COLOR_HEX;
    // 메뉴 투명여부
    transparent : boolean = false;
    // 메뉴 투명도
    opacity : number = 0.5;

    // 서브 메뉴 리스트
    subMenuList : Array<TFL_MenuControls_SubMenu> = [];
    subMenus : THREE.Group = new THREE.Group();
    
    // 메뉴 상태 (collapsed:true - 축소, collapsed:false - 화장(expand))
    state = {
        collapsed: true
    };
    // 메뉴 라벨 가로 크기
    labelWidth : number = 0;
    // 메뉴 라벨 세로 크기
    labelHeight : number = 0;

    // 메뉴 클래스 생성
    constructor(world : HubsWorld, parent : TFL_MenuControls, title : string) {
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
        // 라벨 생성
        const label = creatorText(textInfo);
        // 라벨 가로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        this.labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        this.labelHeight = labelBoundingBox.max.y - labelBoundingBox.min.y;
        this.height = MENU.MENU_HEIGHT;
        if (this.height < (this.labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM)) {
            this.height = (this.labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM);
        }
    
        // 패널 생성
        const menuGeometry = new THREE.PlaneGeometry(parent.width, this.height);
        const menuMaterial = new THREE.MeshBasicMaterial({color: MENU.MENU_COLOR_HEX, transparent: parent.transparent, opacity: MENU.MENU_OPACITY, side: THREE.DoubleSide});
        const menuPanel = new THREE.Mesh(menuGeometry, menuMaterial);
        this.menu.add(menuPanel);
        menuPanel.position.set(0, -(this.height * 0.5), 0);

        // 아이콘 생성
        const mwnuIcon = createIconArrow(parent.iconColor);
        menuPanel.add(mwnuIcon);
        mwnuIcon.position.set(-(parent.width * 0.5) + MENU.MENU_ICON_1_POSITION_X, -0.02, MENU.MENU_OVER_POSITION_Z);
        // 라벨 추가
        menuPanel.add(label);
        label.position.set(0, 0, MENU.MENU_OVER_POSITION_Z);

        // 서브 메뉴 위치
        this.subMenus.position.set(0, -this.height, 0);
        this.menu.add(this.subMenus);
        
        this.menuEid = addEntity(this.world);
        addObject3DComponent(this.world, this.menuEid, this.getMesh());
        addComponent(world, TFLMenuControlsMenuHover, this.menuEid); // TFLMenuControlsMenuHover
        addComponent(world, CursorRaycastable, this.menuEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.menuEid); // Hover
        addComponent(world, SingleActionButton, this.menuEid); // Click
    }

    // 서브 메뉴 추가
    addSubMenu = function (title : string) {
        const subMenu = new TFL_MenuControls_SubMenu(this.world, this, title);
        this.subMenuList.push(subMenu);
        this.subMenus.add(subMenu.getMesh());
        // 메뉴 위치 조정
        let childTop = -MENU.MENU_SPACING;
        this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
            child.getMesh().position.y = childTop - (child.height * 0.5);
            childTop -= (child.height + MENU.MENU_SPACING);
            child.getMesh().matrixNeedsUpdate = true;
        });
        // 메뉴 컨트롤 가로 크기 조정
        this.parent.reSizeMenu();
        // 메뉴 컨트롤 레이아웃 업데이트
        this.parent.performLayout();
        return subMenu;
    }

    // 메뉴 화장
    open = () => {
        if (!this.state.collapsed) { 
            return;
        }
        this.state.collapsed = false;
        // 메뉴 레이아웃 업데이트
        this.parent.performLayout();
    };

    // 메뉴 축소
    close = () => {
        if (this.state.collapsed) {
            return;
        }
        this.state.collapsed = true;
        // 메뉴 레이아웃 업데이트
        this.parent.performLayout();
    };

    // 메뉴 상태 (화장/축소)
    isCollapsed = () => {
        return this.state.collapsed;
    }

    // 메뉴 토글 (화장/축소)
    toggle = () => {
        this.state.collapsed = !this.state.collapsed;
        // 메뉴 레이아웃 업데이트
        this.parent.performLayout();
    }

    // 서브 메뉴 수
    getOpenSubMenuCount = function() {
        let subMenuCount = 0;
        if (!this.state.collapsed) {
            subMenuCount = this.subMenus.children.length;
        }
        return subMenuCount;
    }

    // 화장된 메뉴의 서브 메뉴 높이
    getOpenSubMenuHeight = function() {
        let subMenuHeight = 0;
        if (!this.state.collapsed) {
            this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
                subMenuHeight += (child.height + MENU.MENU_SPACING);
            });
        }
        return subMenuHeight;
    }

    // 서브 메뉴 가로 크기 가져오기
    getMaxWidth = function () {
        // 타이틀 / 메뉴 최대 가로 크기
        let labelMaxWidth = this.labelWidth;
        this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
            if (labelMaxWidth < child.labelWidth) {
                labelMaxWidth = child.labelWidth;
            }
        });
        // 여백 추가
        labelMaxWidth += (MENU.MENU_PADDING_LEFT + MENU.MENU_PADDING_RIGHT);
        if (labelMaxWidth < this.width) {
            labelMaxWidth = this.width;
        }
        return labelMaxWidth;
    }

    // 메뉴 위치 조정
    rePosition = function(width : number) {
        this.menu.children[0].geometry.dispose();
        this.menu.children[0].geometry = new THREE.PlaneGeometry(width, this.height);
        this.menu.children[0].children[0].position.x = -(width * 0.5) + MENU.MENU_ICON_1_POSITION_X;
        // Geometry 가로 크기 조정
        this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
            child.rePosition(width);
        });
        this.menu.children[0].matrixNeedsUpdate = true;
    }
    
    // 메뉴 레이아웃 업데이트
    performLayout = () => {
        // 메뉴 패널 위치
        let childY = this.getMesh().position.y;
        if (this.state.collapsed) {
            this.menu.children[0].children[0].rotation.z = Math.PI;
            this.menu.children[0].children[0].position.y = 0.02;
            this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
                child.hide();
            });
            this.subMenus.visible = false;
            // 서브 메뉴 리스트 제거
            this.menu.remove(this.subMenus);
        } else {
            this.menu.children[0].children[0].rotation.z = 0;
            this.menu.children[0].children[0].position.y = -0.02;
            let childTop = 0;
            this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
                child.show();
                childTop -= (child.height + MENU.MENU_SPACING);
            });
            childY += childTop;
            this.subMenus.visible = true;
            // 서브 메뉴 리스트 추가
            this.menu.add(this.subMenus);
        }
        this.menu.children[0].children[0].matrixNeedsUpdate = true;
        this.subMenus.matrixNeedsUpdate = true;
        this.menu.matrixNeedsUpdate = true;

        return childY;
    }

    // 메뉴 호버
    updateHover = function(hovering : boolean) {
        if (hovering) {
            this.menu.children[0].material.color.setHex(MENU.MENU_HIGHLIGHT_COLOR_HEX);
        } else {
            this.menu.children[0].material.color.setHex(MENU.MENU_COLOR_HEX);
        }
        this.menu.children[0].matrixNeedsUpdate = true;
    }

    remove = () => {
        removeComponent(this.world, TFLMenuControlsMenuHover, this.menuEid); // TFLMenuControlsMenuHover
        removeComponent(this.world, CursorRaycastable, this.menuEid); // Raycast
        removeComponent(this.world, RemoteHoverTarget, this.menuEid); // Hover
        removeComponent(this.world, SingleActionButton, this.menuEid); // Click

        this.subMenuList.forEach(function (child : TFL_MenuControls_SubMenu) {
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

// 메뉴 컨트롤 클래스
export class TFL_MenuControls {
    menuControls : THREE.Group = new THREE.Group();
    constolsEid : number = 0;
    // 스크린
    world : HubsWorld;
    // 메뉴 컨트롤 타이틀
    title : string = "";
    // 메뉴 컨트롤 가로 크기
    width : number = MENU.MENU_WIDTH;
    // 메뉴 컨트롤 커브 크기
    curve : number = MENU.MENU_CURVE;
    // 메뉴 아코디언 UI
    accordionUI : boolean = false;
    // 메뉴 컨트롤 투명여부
    transparent : boolean = false;
    // 메뉴 컨트롤 투명도
    opacity : number = 0.5;
    // 메뉴 폰트 크기
    fontSize : number = MENU.MENU_FONT_SIZE;
    // 메뉴 폰트 칼라
    fontColor : string = MENU.MENU_FONT_COLOR;
    // 메뉴 폰트 두께
    fontWeight : string = MENU.MENU_FONT_WEIGHT;
    // 아이콘 칼라
    iconColor : number = MENU.MENU_ICON_COLOR_HEX;
    // 메뉴 컨트롤 칼라
    controlColor : number = MENU.MENU_CONTROL_COLOR_HEX;
    // 메뉴 컨트롤 보더 칼라
    boardColor : number = MENU.MENU_CONTROL_BOARD_HEX;

    // 메뉴 리스트
    menuList : Array<TFL_MenuControls_Menu> = [];
    menus : THREE.Group = new THREE.Group();
    // 메뉴 컨트롤 초기 레이아웃 여부
    init : boolean = false;

    // 메뉴 컨트롤 클래스 생성
    constructor(world : HubsWorld, title : string, width : number, curve : number, accordionUI : boolean, 
        transparent : boolean, opacity : number, fontSize : number, fontColor : string, fontWeight : string, iconColorHex :number, 
        controlColorHex : number, boardColorHex : number) {
        // 스크린
        this.world = world;
        // 메뉴 컨트롤 타이틀
        this.title = title;
        // 메뉴 컨트롤 가로 크기
        if (width != undefined && width != null) {
            this.width = width;
        }
        // 메뉴 컨트롤 커브 크기
        if (curve != undefined && curve != null) {
            this.curve = curve;
        }
        // 메뉴 아코디언 UI
        if (accordionUI != undefined && accordionUI != null) {
            this.accordionUI = accordionUI;
        }
        // 메뉴 컨트롤 투명여부
        if (transparent != undefined && transparent != null) {
            this.transparent = transparent;
        }
        // 메뉴 컨트롤 투명도
        if (opacity != undefined && opacity != null) {
            this.opacity = opacity;
        }
        // 메뉴 폰트 크기
        if (fontSize != undefined && fontSize != null) {
            this.fontSize = fontSize;
        }
        // 메뉴 폰트 칼라
        if (fontColor != undefined && fontColor != null) {
            this.fontColor = fontColor;
        }
        // 메뉴 폰트 두께
        if (fontWeight != undefined && fontWeight != null) {
            this.fontWeight = fontWeight;
        }
        // 아이콘 칼라
        if (iconColorHex != undefined && iconColorHex != null) {
            this.iconColor = iconColorHex;
        }
        // 메뉴 컨트롤 칼라
        if (controlColorHex != undefined && controlColorHex != null) {
            this.controlColor = controlColorHex;
        }
        // 메뉴 컨트롤 보더 칼라
        if (boardColorHex != undefined && boardColorHex != null) {
            this.boardColor = boardColorHex;
        }

        // 메뉴 위치
        this.menus.position.set(this.width * 0.5, 0, 0);
        this.menuControls.add(this.menus);

        this.constolsEid = addEntity(world);
        addObject3DComponent(world, this.constolsEid, this.getMesh());
    }

    // 메뉴 추가
    addMenu = (title : string) => {
        const menu = new TFL_MenuControls_Menu(this.world, this, title);
        this.menuList.push(menu);
        this.menus.add(menu.getMesh());

        // 메뉴 가로 크기 조정
        this.reSizeMenu();
        // 메뉴 레이아웃 업데이트
        this.performLayout();

        return menu;
    }

    // 메뉴 가로 크기 조정
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
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x + (MENU.MENU_CURVE * 2);
        // 라벨 제거
        label.geometry.dispose();
        label.material.dispose();
        if (this.width < labelWidth) {
            this.width = labelWidth;
        }

        // 타이틀 / 메뉴 최대 가로 크기
        let menuMaxWidth = this.width;
        this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
            const childMenuMaxWidth = child.getMaxWidth();
            if (menuMaxWidth < childMenuMaxWidth) {
                menuMaxWidth = childMenuMaxWidth;
            }
        });
        this.width = menuMaxWidth;
        // 메뉴 Geometry 가로 크기 조정
        this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
            child.rePosition(menuMaxWidth);
        });
    }

    // 메뉴 컨트롤 초기 레이아웃
    initLayout = function () {
        if (this.init) {
            return;
        }
        // 메뉴 위치
        this.menus.position.set(this.width * 0.5, 0, 0);
        //
        this.init = true;
    }
    
    // 메뉴 컨트롤 레이아웃 업데이트
    performLayout = function() {
        if (!this.init) {
            return;
        }

        // 메뉴 컨트롤 헤더 제거
        const layoutMenuHeaderMesh = this.menuControls.getObjectByProperty("type", "layoutMenuHeader");
        if (layoutMenuHeaderMesh != undefined && layoutMenuHeaderMesh != null) {
            meshDispose(layoutMenuHeaderMesh);
            this.menuControls.remove(layoutMenuHeaderMesh);
        }
        // 메뉴 컨트롤 헤더 라벨 제거
        const layoutMenuHeaderLabelMesh = this.menuControls.getObjectByProperty("type", "layoutMenuHeaderLabel");
        if (layoutMenuHeaderLabelMesh != undefined && layoutMenuHeaderLabelMesh != null) {
            meshDispose(layoutMenuHeaderLabelMesh);
            this.menuControls.remove(layoutMenuHeaderLabelMesh);
        }
        // 메뉴 컨트롤 푸터 제거
        const layoutMenuFooterMesh = this.menuControls.getObjectByProperty("type", "layoutMenuFooter");
        if (layoutMenuFooterMesh != undefined && layoutMenuFooterMesh != null) {
            meshDispose(layoutMenuFooterMesh);
            this.menuControls.remove(layoutMenuFooterMesh);
        }
        // 메뉴 컨트롤 보더 제거
        const layoutMenuBoardMesh = this.menuControls.getObjectByProperty("type", "layoutMenuBoard");
        if (layoutMenuBoardMesh != undefined && layoutMenuBoardMesh != null) {
            meshDispose(layoutMenuBoardMesh);
            this.menuControls.remove(layoutMenuBoardMesh);
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
        let menuHeaderHeight = MENU.MENU_HEADER_HEIGHT;
        if (menuHeaderHeight < (labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM)) {
            menuHeaderHeight = (labelHeight + MENU.MENU_PADDING_TOP + MENU.MENU_PADDING_BOTTOM);
        }
        // 메뉴 컨트롤 헤더
        const layoutMenuHeader = creatorRoundedRectangleTop(this.width, menuHeaderHeight, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutMenuHeader.userData = {"meshType": "layoutMenuHeader"};
        layoutMenuHeader.type = "layoutMenuHeader";
        this.menuControls.add(layoutMenuHeader);
        // 라벨 패널 생성
        const labelPanel = new THREE.Mesh(new THREE.PlaneGeometry(this.width - (this.curve * 2), menuHeaderHeight), new THREE.MeshBasicMaterial({color: this.controlColor, side: THREE.DoubleSide, transparent: true, opacity: this.opacity}));
        labelPanel.userData = {"meshType": "layoutMenuHeaderLabel"};
        labelPanel.type = "layoutMenuHeaderLabel";
        this.menuControls.add(labelPanel);
        labelPanel.position.set(this.width * 0.5, -(menuHeaderHeight * 0.5), 0);
        // 라벨 추가
        labelPanel.add(label);
        label.position.set(0, 0, MENU.MENU_OVER_POSITION_Z);

        // 메뉴 위치
        let childY = -(menuHeaderHeight + MENU.MENU_SPACING);
        this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
            child.getMesh().position.y = childY;
            // 메뉴 레이아웃 업데이트
            childY = child.performLayout() - child.height - MENU.MENU_SPACING;
            child.getMesh().matrixNeedsUpdate = true;
        });

        // 메뉴 컨트롤 세로 크기
        let menuHeight = MENU.MENU_SPACING;
        this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
            menuHeight += (child.height + MENU.MENU_SPACING);
            menuHeight += child.getOpenSubMenuHeight();
        });
        this.height = menuHeaderHeight + menuHeight + this.curve;

        // 메뉴 컨트롤 푸터
        const layoutMenuFooter = creatorRoundedRectangleBottom(this.width, this.height, this.controlColor, this.transparent, this.opacity, this.curve, this.curve);
        layoutMenuFooter.userData = {"meshType": "layoutMenuFooter"};
        layoutMenuFooter.type = "layoutMenuFooter";
        this.menuControls.add(layoutMenuFooter);

        // 메뉴 컨트롤 보더
        const layoutMenuBoard = creatorRoundedRectangleBorder(this.width, this.height, this.boardColor, MENU.MENU_BOARD_THICKNESS, this.curve, this.curve, this.curve, this.curve);
        layoutMenuBoard.userData = {"meshType": "layoutMenuBoard"};
        layoutMenuBoard.type = "layoutMenuBoard";
        this.menuControls.add(layoutMenuBoard);

        this.getMesh().matrixNeedsUpdate = true;
    }

    // 메뉴 컨트롤에 있는 메뉴에 대한 호버 처리
    updateMenuHover = function(selectedObj : THREE.Group) {
        this.menuList.forEach(function (menu : TFL_MenuControls_Menu) {
            if (selectedObj != null && menu.getMesh() == selectedObj) {
                menu.updateHover(true);
            }
        });
    }

    // 메뉴 컨트롤에 있는 메뉴에 대한 호버 처리
    updateMenuHoverOut = function(selectedObj : THREE.Group) {
        this.menuList.forEach(function (menu : TFL_MenuControls_Menu) {
            if (selectedObj != null && menu.getMesh() == selectedObj) {
                menu.updateHover(false);
            }
        });
    }

    // 메뉴 컨트롤에 있는 서브 메뉴에 대한 호버 처리
    updateSubMenuHover = function(selectedObj : THREE.Mesh) {
        this.menuList.forEach(function (menu : TFL_MenuControls_Menu) {
            if (selectedObj != null) {
                menu.subMenuList.forEach(function (subMenu : TFL_MenuControls_SubMenu) {
                    if (subMenu.getMesh() == selectedObj) {
                        subMenu.updateHover(true);
                    }
                });
            }
        });
    }

    // 메뉴 컨트롤에 있는 서브 메뉴에 대한 호버 처리
    updateSubMenuHoverOut = function(selectedObj : THREE.Mesh) {
        this.menuList.forEach(function (menu : TFL_MenuControls_Menu) {
            if (selectedObj != null) {
                menu.subMenuList.forEach(function (subMenu : TFL_MenuControls_SubMenu) {
                    if (subMenu.getMesh() == selectedObj) {
                        subMenu.updateHover(false);
                    }
                });
            }
        });
    }

    // 메뉴 토글 (화장/축소)
    toggle = function(selectedObj : THREE.Group) {
        if (this.accordionUI) {
            this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
                if (selectedObj != null && child.getMesh() == selectedObj) {
                    child.toggle();
                } else {
                    child.close();
                }
            });
        } else {
            this.menuList.forEach(function (child : TFL_MenuControls_Menu) {
                if (selectedObj != null && child.getMesh() == selectedObj) {
                    child.toggle();
                }
            });
        }
    }

    removeLayout = function() {
        if (!this.init) {
            return;
        }

        // 메뉴 컨트롤 헤더 제거
        const layoutMenuHeaderMesh = this.menuControls.getObjectByProperty("type", "layoutMenuHeader");
        if (layoutMenuHeaderMesh != undefined && layoutMenuHeaderMesh != null) {
            meshDispose(layoutMenuHeaderMesh);
            this.menuControls.remove(layoutMenuHeaderMesh);
        }
        // 메뉴 컨트롤 헤더 라벨 제거
        const layoutMenuHeaderLabelMesh = this.menuControls.getObjectByProperty("type", "layoutMenuHeaderLabel");
        if (layoutMenuHeaderLabelMesh != undefined && layoutMenuHeaderLabelMesh != null) {
            meshDispose(layoutMenuHeaderLabelMesh);
            this.menuControls.remove(layoutMenuHeaderLabelMesh);
        }
        // 메뉴 컨트롤 푸터 제거
        const layoutMenuFooterMesh = this.menuControls.getObjectByProperty("type", "layoutMenuFooter");
        if (layoutMenuFooterMesh != undefined && layoutMenuFooterMesh != null) {
            meshDispose(layoutMenuFooterMesh);
            this.menuControls.remove(layoutMenuFooterMesh);
        }
        // 메뉴 컨트롤 보더 제거
        const layoutMenuBoardMesh = this.menuControls.getObjectByProperty("type", "layoutMenuBoard");
        if (layoutMenuBoardMesh != undefined && layoutMenuBoardMesh != null) {
            meshDispose(layoutMenuBoardMesh);
            this.menuControls.remove(layoutMenuBoardMesh);
        }

        // remove
        this.menuList.forEach(function (menu : TFL_MenuControls_Menu) {
            menu.remove();
        });
        this.menuControls.remove(this.menus);
        this.getMesh().matrixNeedsUpdate = true;
    }

    // 메뉴 컨트롤 클래스에서 메시 가져오기
    getMesh = () => {
        return this.menuControls;
    }
}
