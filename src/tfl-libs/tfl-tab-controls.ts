import type { HubsWorld } from "../app";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton, TFCTabControlsTabHover } from "../bit-components";
import { addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { createPanel, creatorText, TAB, LABEL } from "./tfl-common";

// 탭 컨트롤 아이템 클래스
class TFL_TabControls_Item {
    world : HubsWorld;
    item : THREE.Mesh;
    itemEid : number = 0;
    parent : TFL_TabControls_Tab;

    // 아이템 생성
    constructor(world : HubsWorld, parent : TFL_TabControls_Tab, title : string) {
        this.world = world;
        this.parent = parent;

        const width = parent.parent.width - (TAB.TAB_CONTROL_PADDING * 2);

        // 패널 생성 
        this.item = createPanel(width, TAB.TAB_ITEM_HEIGHT, TAB.TAB_ITEM_DEPTH, TAB.TAB_ITEM_COLOR_HEX);
        this.item.type = "tabItem";
        this.item.name = title;

        // 라벨 생성 (한글 텍스트)
        const label = creatorText(title);
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        label.position.set(labelWidth/2 + 0.2, -(TAB.TAB_ITEM_HEIGHT / 2), LABEL.LABEL_DEPTH);
        label.type = "tabItemLabel";
        this.item.add(label);

        this.itemEid = addEntity(this.world);
        addObject3DComponent(this.world, this.itemEid, this.getMesh());
        addComponent(world, CursorRaycastable, this.itemEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.itemEid); // Hover
        addComponent(world, SingleActionButton, this.itemEid); // Click
    }

    // 아이템 숨기
    hide = function() {
        this.item.visible = false;
        this.item.matrixNeedsUpdate = true;
    }

    // 아이템 노출
    show = function() {
        this.item.visible = true;
        this.item.matrixNeedsUpdate = true;
    }

    // 아이템 클래스에서 메시 가져오기
    getMesh = () => {
        return this.item;
    }
}

// 탭 컨트롤 탭 클래스
class TFL_TabControls_Tab {
    world : HubsWorld;
    tab : THREE.Group;
    tabEid : number = 0;
    parent : TFL_TabControls;
    tabWidth : number = 0;

    // 아이템 리스트 생성
    itemList : Array<TFL_TabControls_Item> = [];
    // 아이템 리스트 생성
    items = new THREE.Group();

    // 탭 상태 (active:true - 활성화, active:false - 비활성화)
    state = {
        active: false
    };

    // 탭 클래스 생성
    constructor(world : HubsWorld, parent : TFL_TabControls, title : string) {
        this.world = world;
        this.parent = parent;

        this.tab = new THREE.Group();

        // 라벨 생성 (한글 텍스트)
        const label = creatorText(title);
        // 한글 가로 크기
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        // 탭 가로 크기 설정
        this.tabWidth = labelWidth + (TAB.TAB_PADDING * 2);
        let labelPos = (labelWidth / 2) + TAB.TAB_PADDING;
        if (this.tabWidth < TAB.TAB_WIDTH) {
            this.tabWidth = TAB.TAB_WIDTH;
            labelPos = (labelWidth / 2) + (TAB.TAB_WIDTH / 2) - (labelWidth / 2); // 가운데 정렬
        }

        // 패널 생성
        const panel = createPanel(this.tabWidth, TAB.TAB_HEIGHT, TAB.TAB_DEPTH, TAB.TAB_INACTIVE_COLOR_HEX);
        panel.type = "tab";
        panel.name = title;

        // 라벨 추가
        label.position.set(labelPos, -(TAB.TAB_HEIGHT / 2), LABEL.LABEL_DEPTH);
        label.type = "tabLabel";
        panel.add(label);

        // 패널 추가
        this.tab.add(panel);

        this.tabEid = addEntity(this.world);
        addObject3DComponent(this.world, this.tabEid, this.getMesh());
        addComponent(world, TFCTabControlsTabHover, this.tabEid); // TFCTabControlsTabHover
        addComponent(world, CursorRaycastable, this.tabEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.tabEid); // Hover
        addComponent(world, SingleActionButton, this.tabEid); // Click
    }

    // 폴더에 아이템 추가
    addItem = (title : string) => {
        const item = new TFL_TabControls_Item(this.world, this, title);

        this.itemList.push(item);
        this.items.add(item.getMesh());
        // 폴더 레이아웃 업데이트
        this.parent.performLayout();

        return item;
    }

    // 탭 활성화
    active = function () {
        if (this.state.active) { 
            return;
        }
        this.state.active = true;
    };

    // 탭 비활성화
    inactive = function () {
        if (!this.state.active) {
            return;
        }
        this.state.active = false;
    };

    // 탭 상태 (활성화/비활성화)
    isActive = function () {
        return this.state.active;
    }

    // 탭 레이아웃 업데이트
    // child의 visible를 false로 해도 영역이 존재하기 때문에 제거를 해야 함
    performLayout = () => {
        if (this.state.active) {
            ((this.tab.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(TAB.TAB_ACTIVE_COLOR_HEX);
            let childTop = -(TAB.TAB_HEIGHT + TAB.TAB_CONTROL_PADDING);
            this.itemList.forEach(function (child : TFL_TabControls_Item) {
                child.show();
            });
            this.items.children.forEach(function (child) {
                child.position.x = TAB.TAB_CONTROL_PADDING;
                child.position.y = childTop;
                child.position.z = TAB.TAB_ITEM_DEPTH;
                childTop -= (TAB.TAB_ITEM_HEIGHT + TAB.TAB_ITEM_SPACING);
            });
            this.items.visible = true;
            // 아이템 리스트 추가
            this.parent.listAdd(this.items);
        } else {
            ((this.tab.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(TAB.TAB_INACTIVE_COLOR_HEX);
            this.itemList.forEach(function (child : TFL_TabControls_Item) {
                child.hide();
            });
            this.items.visible = false;
            // 아이템 리스트 제거
            this.parent.listRemove(this.items);
        }
        this.tab.children[0].matrixNeedsUpdate = true;
        this.items.matrixNeedsUpdate = true;
        this.tab.matrixNeedsUpdate = true;
    }

    // 탭 클래스에서 메시 가져오기
    getMesh = () => {
        return this.tab;
    }
}

// 탭 컨트롤 클래스
export class TFL_TabControls {
    world : HubsWorld;
    tabControls : THREE.Group;
    tabConstolsEid : number = 0;
    tabControlList : Array<TFL_TabControls_Tab> = [];
    width : number = TAB.TAB_CONTROL_WIDTH;
    height : number = TAB.TAB_CONTROL_HEIGHT;

    // 탭 컨트롤 클래스 생성
    constructor(world : HubsWorld, width : number, height : number) {
        this.world = world;
        this.width = width;

        this.tabControls = new THREE.Group();

        // 탭 컨트롤 가로 크기
        if (width != undefined && width != null) {
            this.width = width;
        }

        // 탭 컨트롤 세로 크기
        if (height != undefined && height != null) {
            this.height = height;
        }

        // 패널 생성
        const panel = createPanel(this.width, this.height, TAB.TAB_DEPTH, TAB.TAB_ACTIVE_COLOR_HEX);
        panel.geometry.translate(0, -TAB.TAB_HEIGHT, 0);
        // 패널 추가
        this.tabControls.add(panel);

        this.tabConstolsEid = addEntity(world);
        addObject3DComponent(world, this.tabConstolsEid, this.getMesh());
    }

    // 탭 컨트롤에 탭 추가
    addTab = (title : string) => {
        const tab = new TFL_TabControls_Tab(this.world, this, title);

        this.tabControlList.push(tab);
        this.tabControls.add(tab.getMesh());

        // 컨트롤 레이아웃 업데이트
        this.performLayout();

        return tab;
    };

    // 컨트롤 레이아웃 업데이트
    performLayout = () => {
        let childX = 0;
        this.tabControlList.forEach((child : TFL_TabControls_Tab) => {
            child.getMesh().position.y = 0;
            child.getMesh().position.x = childX;
            // 폴더 레이아웃 업데이트
            child.performLayout();
            childX += (child.tabWidth + TAB.TAB_SPACING);
            child.getMesh().matrixNeedsUpdate = true;
        });
        this.getMesh().matrixNeedsUpdate = true;
    }

    // 탭 컨트롤 영역에 아이템 추가
    listAdd = function (items : THREE.Group) {
        this.tabControls.children[0].add(items);
        this.tabControls.children[0].matrixNeedsUpdate = true;
    }

    // 탭 컨트롤 영역에 아이템 제거
    listRemove = function (items : THREE.Group) {
        this.tabControls.children[0].remove(items);
        this.tabControls.children[0].matrixNeedsUpdate = true;
    }

    // 탭 컨트롤에서 탭 선택
    select = function (selectedObj : THREE.Group) {
        this.tabControlList.forEach(function (child : TFL_TabControls_Tab) {
            if (selectedObj != null && child.tab == selectedObj) {
                child.active();
            } else {
                child.inactive();
            }
        });
        this.performLayout();
    }

    // 탭 컨트롤 클래스에서 메시 가져오기
    getMesh = () => {
        return this.tabControls;
    }
}
