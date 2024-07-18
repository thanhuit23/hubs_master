import type { HubsWorld } from "../app";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton, TFCControlsFolderHover, TFCControlsItemHover } from "../bit-components";
import { addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { createPanel, creatorText, createDownArrow, FOLDER, ITEM, LABEL } from "./tfl-common";

// 아이템 클래스
class TFL_Controls_Item {
    world : HubsWorld;
    item : THREE.Mesh;
    itemEid : number = 0;
    parent : TFL_Controls_Folder;
    width : number = ITEM.ITEM_WIDTH;

    constructor(world : HubsWorld, parent : TFL_Controls_Folder, title : string, width : number) {
        this.world = world;
        this.parent = parent;

        if (width != undefined && width != null) {
            this.width = width;
        }

        // 패널 생성 
        this.item = createPanel(this.width, ITEM.ITEM_HEIGHT, ITEM.ITEM_DEPTH, ITEM.ITEM_COLOR_HEX);
        this.item.type = "item";
        this.item.name = title;

        // 라벨 생성 (한글 텍스트)
        const label = creatorText(title);
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        label.position.set(labelWidth/2 + 0.2, -(ITEM.ITEM_HEIGHT / 2), LABEL.LABEL_DEPTH);
        label.type = "itemLabel";
        this.item.add(label);

        this.itemEid = addEntity(this.world);
        addObject3DComponent(this.world, this.itemEid, this.getMesh());
        addComponent(world, TFCControlsItemHover, this.itemEid); // TFCControlsItemHover
        addComponent(world, CursorRaycastable, this.itemEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.itemEid); // Hover
        addComponent(world, SingleActionButton, this.itemEid); // Click
    }
  
    // 패널 숨기
    hide = function() {
        this.item.visible = false;
        this.item.matrixNeedsUpdate = true;
    }
  
    // 패널 노출
    show = function() {
        this.item.visible = true;
        this.item.matrixNeedsUpdate = true;
    }
  
    // 아이템 클래스에서 메시 가져오기
    getMesh = () => {
        return this.item;
    }
}

// 폴더 클래스
class TFL_Controls_Folder {
    world : HubsWorld;
    folder : THREE.Group = new THREE.Group();
    folderEid : number = 0;
    parent : TFL_Controls;
    width : number = FOLDER.FOLDER_WIDTH;

    // 아이템 리스트 생성
    itemList : Array<TFL_Controls_Item> = [];
    // 아이템 리스트 생성
    items = new THREE.Group();

    // 폴더 상태 (collapsed:true - 축소, collapsed:false - 화장(expand))
    state = {
        collapsed: true
    };

    constructor(world : HubsWorld, parent : TFL_Controls, title : string, width : number) {
        this.world = world;
        this.parent = parent;

        if (width != undefined && width != null) {
            this.width = width;
        }

        // 패널 생성
        const panel = createPanel(this.width, FOLDER.FOLDER_HEIGHT, FOLDER.FOLDER_DEPTH, FOLDER.FOLDER_COLOR_HEX);
        panel.type = "folder";
        panel.name = title;
        
        // 아래 방향 화살표 생성
        const downArrow = createDownArrow();
        downArrow.geometry.computeBoundingBox();
        const downArrowBoundingBox = downArrow.geometry.boundingBox!;
        const downArrowWidth = downArrowBoundingBox.max.x - downArrowBoundingBox.min.x;
        downArrow.position.set(downArrowWidth/2 + 0.05, -(FOLDER.FOLDER_HEIGHT / 2), LABEL.LABEL_DEPTH);
        downArrow.type = "folderArrow";
        panel.add(downArrow);
        
        // 라벨 생성 (한글 텍스트)
        const label = creatorText(title);
        label.geometry.computeBoundingBox();
        const labelBoundingBox = label.geometry.boundingBox!;
        const labelWidth = labelBoundingBox.max.x - labelBoundingBox.min.x;
        label.position.set(labelWidth/2 + 0.2, -(ITEM.ITEM_HEIGHT / 2), LABEL.LABEL_DEPTH);
        label.type = "folderLabel";
        panel.add(label);

        // 패널 추가
        this.folder.add(panel);
        
        this.items.position.set(0, -(ITEM.ITEM_HEIGHT + ITEM.ITEM_SPACING), 0);
        // 아이템 리스트 추가
        this.folder.add(this.items);

        this.folderEid = addEntity(this.world);
        addObject3DComponent(this.world, this.folderEid, this.getMesh());
        addComponent(world, TFCControlsFolderHover, this.folderEid); // TFCControlsFolderHover
        addComponent(world, CursorRaycastable, this.folderEid); // Raycast
        addComponent(world, RemoteHoverTarget, this.folderEid); // Hover
        addComponent(world, SingleActionButton, this.folderEid); // Click
    }

    // 폴더에 아이템 추가
    addItem = (title : string) => {
        const item = new TFL_Controls_Item(this.world, this, title, this.width);

        this.itemList.push(item);
        this.items.add(item.getMesh());
        // 폴더 레이아웃 업데이트
        this.parent.performLayout();

        return item;
    }

    // 폴더 토글 (화장/축소)
    toggle = () => {
        this.state.collapsed = !this.state.collapsed;
        // 폴더 레이아웃 업데이트
        this.parent.performLayout();
    }

    // 폴더 화장
    open = () => {
        this.state.collapsed = false;
        // 폴더 레이아웃 업데이트
        this.parent.performLayout();
    }

    // 폴더 축소
    close = () => {
        this.state.collapsed = true;
        // 폴더 레이아웃 업데이트
        this.parent.performLayout();
    }

    // 폴더 상태 (화장/축소)
    isCollapsed = () => {
        return this.state.collapsed;
    }

    updateHover = function(hovering : boolean) {
        if (hovering) {
            this.folder.children[0].material.color.setHex(FOLDER.FOLDER_COLOR_HIGHLIGHT_HEX);
        } else {
            this.folder.children[0].material.color.setHex(FOLDER.FOLDER_COLOR_HEX);
        }
        this.folder.children[0].matrixNeedsUpdate = true;
    }

    // 폴더 레이아웃 업데이트
    // child의 visible를 false로 해도 영역이 존재하기 때문에 제거를 해야 함
    performLayout = () => {
        // 폴더 패널 위치
        let childY = this.getMesh().position.y;
        if (this.state.collapsed) {
            this.folder.children[0].children[0].rotation.z = Math.PI * 0.5;
            this.itemList.forEach(function (child : TFL_Controls_Item) {
                child.hide();
            });
            this.items.visible = false;
            // 아이템 리스트 제거
            this.folder.remove(this.items);
        } else {
            this.folder.children[0].children[0].rotation.z = 0;
            this.itemList.forEach(function (child : TFL_Controls_Item) {
                child.show();
            });
            let childTop = 0;
            this.items.children.forEach(function (child) {
                child.position.y = childTop;
                childTop -= (ITEM.ITEM_HEIGHT + ITEM.ITEM_SPACING);
            });
            childY += childTop;
            this.items.visible = true;
            // 아이템 리스트 추가
            this.folder.add(this.items);
        }
        this.folder.children[0].children[0].matrixNeedsUpdate = true;
        this.items.matrixNeedsUpdate = true;
        this.folder.matrixNeedsUpdate = true;

        return childY;
    }

    // 폴더 클래스에서 메시 가져오기
    getMesh = () => {
        return this.folder;
    }
}

// 컨트롤 클래스
export class TFL_Controls {
    world : HubsWorld;
    controls : THREE.Group = new THREE.Group();
    constolsEid : number = 0;
    controlList : Array<TFL_Controls_Folder> = [];
    width : number = 0;
    accordionUI : boolean = false;

    constructor(world : HubsWorld, width : number, accordionUI : boolean) {
        this.world = world;
	this.width = width;
	this.accordionUI = accordionUI;

        this.constolsEid = addEntity(world);
        addObject3DComponent(world, this.constolsEid, this.getMesh());
    }

    // 컨트롤에 폴더 추가
    addFolder = (title : string) => {
        const folder = new TFL_Controls_Folder(this.world, this, title, this.width);

        this.controlList.push(folder);
        this.controls.add(folder.getMesh());

        // 컨트롤 레이아웃 업데이트
        this.performLayout();

        return folder;
    };

    // 컨트롤에 있는 폴더에 대한 호버 처리
    updateFolderHover = function(selectedObj : THREE.Group) {
        this.controlList.forEach(function (child : TFL_Controls_Folder) {
            if (selectedObj != null && child.folder == selectedObj) {
                child.updateHover(true);
            } else {
                //child.updateHover(false);
            }
        });
    }

    // 컨트롤에 있는 폴더에 대한 호버 처리
    updateFolderHoverOut = function(selectedObj : THREE.Group) {
        this.controlList.forEach(function (child : TFL_Controls_Folder) {
            if (selectedObj != null && child.folder == selectedObj) {
                child.updateHover(false);
            }
        });
    }

    toggle = function(selectedObj : THREE.Group) {
        if (this.accordionUI) {
            this.controlList.forEach(function (child : TFL_Controls_Folder) {
                if (selectedObj != null && child.folder == selectedObj) {
                    child.toggle();
                } else {
                    child.close();
                }
            });
        } else {
            this.controlList.forEach(function (child : TFL_Controls_Folder) {
                if (selectedObj != null && child.folder == selectedObj) {
                    child.toggle();
                }
            });
        }
    }

    // 컨트롤 레이아웃 업데이트
    performLayout = () => {
        let childY = 0;
        this.controlList.forEach((child : TFL_Controls_Folder) => {
            child.getMesh().position.y = childY;
            // 폴더 레이아웃 업데이트
            childY = child.performLayout() - (FOLDER.FOLDER_HEIGHT + FOLDER.FOLDER_SPACING);
            child.getMesh().matrixNeedsUpdate = true;
        });
        this.getMesh().matrixNeedsUpdate = true;
    }

    // 컨트롤 클래스에서 메시 가져오기
    getMesh = () => {
        return this.controls;
    }
}
