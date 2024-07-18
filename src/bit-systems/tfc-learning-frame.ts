import { TFCLearningFrame, TFCMultipleMediaFrame, TFCLearningFrameLink, TFCNetworkedLearningFrameData, Interacted, CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight, TFLMenuControlsMenuHover, TFLMenuControlsSubMenuHover, TFLMenuPopControlsMenu, TFLMenuPopControlsSubMenu, TFLMenuPopControlsPopClose } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import type { EntityID } from "../utils/networking-types";
import { anyEntityWith } from "../utils/bit-utils";
import { createNetworkedEntity } from "../utils/create-networked-entity";
import { takeOwnership } from "../utils/take-ownership";
import { TFL_MenuControls } from "../tfl-libs/tfl-menu";
import { TFL_MenuPopControls } from "../tfl-libs/tfl-menu-pop";
import { creatorRoundedRectangle } from "../tfl-libs/tfl-control-common-pos";

function clicked(world: HubsWorld, eid: EntityID) {
    return hasComponent(world, Interacted, eid);
}

const TFCLearningFrameQuery = defineQuery([TFCLearningFrame]);
const TFCLearningFrameEnterQuery = enterQuery(TFCLearningFrameQuery);
const TFCLearningFrameExitQuery = exitQuery(TFCLearningFrameQuery);

const TFCLearningFrameLinkQuery = defineQuery([TFCLearningFrameLink]);

const TFCMultipleMediaFrameQuery = defineQuery([TFCMultipleMediaFrame]);

const TFLMenuControlsMenuHoveredQuery = defineQuery([HoveredRemoteRight, TFLMenuControlsMenuHover]);
const TFLMenuControlsMenuHoveredEnterQuery = enterQuery(TFLMenuControlsMenuHoveredQuery);
const TFLMenuControlsMenuHoveredExitQuery = exitQuery(TFLMenuControlsMenuHoveredQuery);

const TFLMenuControlsSubMenuHoveredQuery = defineQuery([HoveredRemoteRight, TFLMenuControlsSubMenuHover]);
const TFLMenuControlsSubMenuHoveredEnterQuery = enterQuery(TFLMenuControlsSubMenuHoveredQuery);
const TFLMenuControlsSubMenuHoveredExitQuery = exitQuery(TFLMenuControlsSubMenuHoveredQuery);

const TFLMenuPopControlsMenuQuery = defineQuery([HoveredRemoteRight, TFLMenuPopControlsMenu]);
const TFLMenuPopControlsMenuEnterQuery = enterQuery(TFLMenuPopControlsMenuQuery);
const TFLMenuPopControlsMenuExitQuery = exitQuery(TFLMenuPopControlsMenuQuery);

const TFLMenuPopControlsSubMenuQuery = defineQuery([HoveredRemoteRight, TFLMenuPopControlsSubMenu]);
const TFLMenuPopControlsSubMenuEnterQuery = enterQuery(TFLMenuPopControlsSubMenuQuery);
const TFLMenuPopControlsSubMenuExitQuery = exitQuery(TFLMenuPopControlsSubMenuQuery);

const TFLMenuPopControlsPopCloseQuery = defineQuery([HoveredRemoteRight, TFLMenuPopControlsPopClose]);

let mediaType : string = "";
let mediaURL : string = "";
let mediaFrameObjectRef : number = 0;
let mediaVideoElement : HTMLVideoElement;
let mediaControlMode : string = "";
let networkClientId : string = "";

let mediaFrame : THREE.Group;
let ControlButton : THREE.Group;
let TFLMenuControls : TFL_MenuControls;
let TFLMenuPopControls : TFL_MenuPopControls;

// 맵 Map<eid, {mediaData}>
const mediaMap = new Map();

function getMediaVideoTexture(mediaVideoElement: HTMLVideoElement, url: string) {
    mediaVideoElement.src = url;

    const texture = new THREE.VideoTexture(mediaVideoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;

    return texture;
}

function removeMediaVideoTexture(mediaType: string, mediaVideoElement: HTMLVideoElement) {
    if (mediaType == "video") {
        if (mediaVideoElement && !mediaVideoElement.paused) {
            mediaVideoElement.pause();
            mediaVideoElement.src = "";
        }
    }
}

function getMediaImageTexture(url: string) {
    const texture = new THREE.TextureLoader().load(url);
    return texture;
}

export function TFCLearningFrameSystem(world: HubsWorld) {
    TFCLearningFrameEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFC Learning Frame Component", eid);

        const source = APP.getString(TFCLearningFrame.source[eid])!;
        //console.log("Learning Frame Source", source);
        const mediaInfo = JSON.parse(source);

        // 객체 위치
        const learningFrameObject = world.eid2obj.get(eid)!;
        const learningFrameObjectPosition = new THREE.Vector3();
        learningFrameObject.getWorldPosition(learningFrameObjectPosition);
        //console.log("myObject World Position", learningFrameObjectPosition);

        // 객체 크기
        const learningFrameObjectScale = new THREE.Vector3();
        learningFrameObject.getWorldScale(learningFrameObjectScale);
        //console.log("myObject World Scale", learningFrameObjectScale);

        learningFrameObject.visible = false;

        mediaVideoElement = document.createElement("video");
        mediaVideoElement.autoplay = false;
        mediaVideoElement.loop = true;
        mediaVideoElement.preload = "auto";
        mediaVideoElement.crossOrigin = "anonymous";
        mediaVideoElement.setAttribute("playsinline", "");
        mediaVideoElement.setAttribute("webkit-playsinline", "");
        mediaVideoElement.width = 0;
        mediaVideoElement.height = 0;

        mediaType = mediaInfo.videos.menus[0].links[0].type;
        let texture = null;
        if (mediaType == "video") {
            texture = getMediaVideoTexture(mediaVideoElement, mediaInfo.videos.menus[0].links[0].url);
        } else if (mediaType == "image") {
            texture = getMediaImageTexture(mediaInfo.videos.menus[0].links[0].url);
        }

        // ViewFrame
        const viewFrameEid = addEntity(world);
        mediaFrame = new THREE.Group();

        // View
        const viewEid = addEntity(world);
        const planeGeometry = new THREE.PlaneGeometry(learningFrameObjectScale.x, learningFrameObjectScale.y);
        const planeMaterial = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        const mediaMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        addObject3DComponent(world, viewEid, mediaMesh);
        addComponent(world, TFCMultipleMediaFrame, viewEid);
        addComponent(world, CursorRaycastable, viewEid); // Raycast
        addComponent(world, RemoteHoverTarget, viewEid); // Hover
        addComponent(world, SingleActionButton, viewEid); // Click

        mediaFrame.add(mediaMesh);

        // Video ProgressBar
        const progressBarEid = addEntity(world);
        TFCMultipleMediaFrame.videoProgressRef[viewEid] = progressBarEid;
        TFCMultipleMediaFrame.videoProgressWidth[viewEid] = learningFrameObjectScale.x;

        // ProgressBar
        const progressBar = new THREE.Group();
        const progressFrameGeometry = new THREE.PlaneGeometry(learningFrameObjectScale.x, 0.05);
        const progressFrameMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side:THREE.DoubleSide});
        progressFrameMaterial.transparent = true;
        progressFrameMaterial.opacity = 0.2;
        const progressFrame = new THREE.Mesh(progressFrameGeometry, progressFrameMaterial);
        progressBar.add(progressFrame);

        const progressValueGeometry = new THREE.PlaneGeometry((learningFrameObjectScale.x / 100), 0.05);
        const progressValueMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side:THREE.DoubleSide});
        const progressValue = new THREE.Mesh(progressValueGeometry, progressValueMaterial);
        progressValue.scale.x = 0;
        progressValue.translateX(-learningFrameObjectScale.x);
        progressBar.add(progressValue);

        addObject3DComponent(world, progressBarEid, progressBar);

        progressBar.position.set(0, -learningFrameObjectScale.y * 0.5, 0.01);
        mediaFrame.add(progressBar);

        addObject3DComponent(world, viewFrameEid, mediaFrame);

        mediaFrame.position.set(learningFrameObjectPosition.x, learningFrameObjectPosition.y, learningFrameObjectPosition.z);
        world.scene.add(mediaFrame);

        if (mediaType == "video") {
            mediaFrame.children[1].visible = true;
        } else {
            mediaFrame.children[1].visible = false;
        }

        // Left Menu Controls
        TFLMenuControls = new TFL_MenuControls(world, mediaInfo.videos.title, 1.2, 0.1, true, true, 0.5, 20, "#FFFFFF", "bolder", 0xFFFFFF, 0x00000, 0xFFFFFF);

        for (let index1 = 0; index1 < mediaInfo.videos.menus.length; index1++) {
            const videoInfo = mediaInfo.videos.menus[index1];
            const menu = TFLMenuControls.addMenu(videoInfo.title);
            for (let index2 = 0; index2 < videoInfo.links.length; index2++) {
                const videoItemInfo = videoInfo.links[index2];
                const videoItem = menu.addSubMenu(videoItemInfo.title);
                addComponent(world, TFCLearningFrameLink, videoItem.subMenuEid);
                TFCLearningFrameLink.type[videoItem.subMenuEid] = APP.getSid(videoItemInfo.type);
                TFCLearningFrameLink.url[videoItem.subMenuEid] = APP.getSid(videoItemInfo.url);
                TFCLearningFrameLink.info[videoItem.subMenuEid] = APP.getSid("");
            }

            if (index1 == 0) {
                menu.open();
            }
        }

        TFLMenuControls.initLayout();
        TFLMenuControls.performLayout();

        TFLMenuControls.getMesh().position.set(learningFrameObjectPosition.x - ((learningFrameObjectScale.x * 0.5) + TFLMenuControls.width + 0.2), learningFrameObjectPosition.y + (learningFrameObjectScale.y * 0.5), learningFrameObjectPosition.z);
        //TFLMenuControls.getMesh().scale.set(0.8, 0.8, 0.8);
        world.scene.add(TFLMenuControls.getMesh());

        // Right MenuPop Controls
        TFLMenuPopControls = new TFL_MenuPopControls(world, mediaInfo.questions.title, 1, 0.1, true, 0.5, 20, "#FFFFFF", "bolder", 0xFFFFFF, 0x000000, 0xFFFFFF);

        for (let index1 = 0; index1 < mediaInfo.questions.menus.length; index1++) {
            const questionInfo = mediaInfo.questions.menus[index1];
            const menu = TFLMenuPopControls.addMenu(questionInfo.title);
            for (let index2 = 0; index2 < questionInfo.links.length; index2++) {
                const questionItemInfo = questionInfo.links[index2];
                const questionItem = menu.addSubMenu(questionItemInfo.title);
                addComponent(world, TFCLearningFrameLink, questionItem.subMenuEid);
                TFCLearningFrameLink.type[questionItem.subMenuEid] = APP.getSid(questionItemInfo.type);
                TFCLearningFrameLink.url[questionItem.subMenuEid] = APP.getSid(questionItemInfo.url);
                TFCLearningFrameLink.info[questionItem.subMenuEid] = APP.getSid("");
            }
        }

        TFLMenuPopControls.initLayout();
        TFLMenuPopControls.performLayout();

        TFLMenuPopControls.getMesh().position.set(learningFrameObjectPosition.x + ((learningFrameObjectScale.x * 0.5) + 0.2), learningFrameObjectPosition.y + (learningFrameObjectScale.y * 0.5), learningFrameObjectPosition.z);
        //TFLMenuPopControls.getMesh().scale.set(0.8, 0.8, 0.8);
        world.scene.add(TFLMenuPopControls.getMesh());

        // Control Button
        const controlButtonEid = addEntity(world);

        const baseRoundedRectangleInfo = {
            text : "제어하기",
            fontSize : 20,
            fontWeight : "bolder",
            minWidth: TFLMenuControls.width,
            transparent : true,
            autoHeight : true
        }
        ControlButton = creatorRoundedRectangle(baseRoundedRectangleInfo);
        ControlButton.position.set(learningFrameObjectPosition.x - ((learningFrameObjectScale.x * 0.5) + (TFLMenuControls.width * 0.5) + 0.2), learningFrameObjectPosition.y + ((learningFrameObjectScale.y * 0.5) + 0.2), learningFrameObjectPosition.z);

        addObject3DComponent(world, controlButtonEid, ControlButton);

        addComponent(world, TFCLearningFrameLink, controlButtonEid);
        mediaFrameObjectRef = viewFrameEid;
        TFCLearningFrameLink.type[controlButtonEid] = APP.getSid("control");
        TFCLearningFrameLink.url[controlButtonEid] = APP.getSid("");
        TFCLearningFrameLink.info[controlButtonEid] = APP.getSid("");

        addComponent(world, CursorRaycastable, controlButtonEid); // Raycast
        addComponent(world, RemoteHoverTarget, controlButtonEid); // Hover
        addComponent(world, SingleActionButton, controlButtonEid); // Click

        world.scene.add(ControlButton);
        
        // Map Add
        const mediaData = {
            mediaType: "", // 미디어 타입
            mediaURL: "", // 미디어 URL
            mediaFrameObjectRef: mediaFrameObjectRef, // 미디어 프레임 Eid
            mediaVideoElement: mediaVideoElement, // 비디오
            mediaControlMode: "", // 비디오 컨트롤 모드
            networkClientId: "", // 네트워크 클라이언트 ID
            mediaFrame: mediaFrame, // 미디어 프레임(Group)
            ControlButton: ControlButton, // 컨트롤 버튼
            TFLMenuControls: TFLMenuControls, // 메뉴 컨트롤
            TFLMenuPopControls: TFLMenuPopControls // 메뉴 팝업 컨트롤
        };
        mediaMap.set(eid, mediaData);
    });

    TFCLearningFrameExitQuery(world).forEach((eid: number) => {
        //console.log("Exit Learning Frame Component", eid);
        world.scene.remove(mediaFrame);
        world.scene.remove(ControlButton);
        TFLMenuControls.removeLayout();
        world.scene.remove(TFLMenuControls.getMesh());
        TFLMenuPopControls.removeLayout();
        world.scene.remove(TFLMenuPopControls.getMesh());

        const networkedEid = anyEntityWith(world, TFCNetworkedLearningFrameData)!;
        if (networkedEid) {
            if (APP.getString(TFCNetworkedLearningFrameData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedLearningFrameData.clientId[networkedEid]) == NAF.clientId) {
                    TFCNetworkedLearningFrameData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedLearningFrameData.url[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.info[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.clientId[networkedEid] = APP.getSid("");
                }
            }
        }

        mediaMap.delete(eid);
    });

    TFCLearningFrameLinkQuery(world).forEach((eid: number) => {
        if (clicked(world, eid)) {
            const networkedEid = anyEntityWith(world, TFCNetworkedLearningFrameData)!;
            
            const type = APP.getString(TFCLearningFrameLink.type[eid])!;
            const url = APP.getString(TFCLearningFrameLink.url[eid])!;
            const info = APP.getString(TFCLearningFrameLink.info[eid])!;

            if (type == "control" && url == "" && info == "") {
                if (networkedEid) {
                    takeOwnership(world, networkedEid);
                    TFCNetworkedLearningFrameData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedLearningFrameData.url[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.info[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                } else {
                    //console.log("tfc-networked-learning-frame-data");
                    const nid = createNetworkedEntity(world, "tfc-networked-learning-frame-data", { type: "control", url: "", control: "", info: "", clientId: NAF.clientId });
                }
            } else {
                if (networkedEid && networkClientId == NAF.clientId) {
                    TFCNetworkedLearningFrameData.type[networkedEid] = APP.getSid(type);
                    TFCNetworkedLearningFrameData.url[networkedEid] = APP.getSid(url);
                    TFCNetworkedLearningFrameData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedLearningFrameData.info[networkedEid] = APP.getSid(info);
                    TFCNetworkedLearningFrameData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                }
            }
        }
    });

    TFCMultipleMediaFrameQuery(world).forEach((eid: number) => {
        const networkedEid = anyEntityWith(world, TFCNetworkedLearningFrameData)!;
        if (networkedEid) {
            if (clicked(world, eid)) {
                if (networkClientId == NAF.clientId) {       
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused) {
                            TFCNetworkedLearningFrameData.control[networkedEid] = APP.getSid("MediaVideoPlay");
                        } else {
                            TFCNetworkedLearningFrameData.control[networkedEid] = APP.getSid("MediaVideoStop");
                        }
                    }
                } else {
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused) {
                            mediaVideoElement.play();
                        } else {
                            mediaVideoElement.pause();
                        }
                    }
                }
            }

            if (APP.getString(TFCNetworkedLearningFrameData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedLearningFrameData.clientId[networkedEid]) == NAF.clientId) {
                    ((ControlButton.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(0x5CB85C);
                } else {
                    ((ControlButton.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(0x000000);
                }
                ControlButton.children[0].matrixNeedsUpdate = true;
                networkClientId = APP.getString(TFCNetworkedLearningFrameData.clientId[networkedEid])!;
            }

            if (APP.getString(TFCNetworkedLearningFrameData.type[networkedEid]) != "" &&
                APP.getString(TFCNetworkedLearningFrameData.url[networkedEid]) != "") {
                if (APP.getString(TFCNetworkedLearningFrameData.url[networkedEid]) != mediaURL) {
                    const mediaObject = world.eid2obj.get(mediaFrameObjectRef);
                    if (mediaObject) {
                        removeMediaVideoTexture(mediaType, mediaVideoElement);

                        const type = APP.getString(TFCNetworkedLearningFrameData.type[networkedEid])!;
                        const url = APP.getString(TFCNetworkedLearningFrameData.url[networkedEid])!;

                        let texture = null;
                        if (type == "video") {
                            mediaObject.children[1].visible = true;
                            mediaObject.children[1].children[1].scale.x = 0;
                            mediaObject.children[1].children[1].matrixNeedsUpdate = true;
                            texture = getMediaVideoTexture(mediaVideoElement, url);
                        } else if (type == "image") {
                            mediaObject.children[1].visible = false;
                            texture = getMediaImageTexture(url);
                        }
                        mediaControlMode = "MediaVideoStop";
                        mediaType = type;
                        mediaURL = url;

                        const mediaMesh = mediaObject.children[0] as THREE.Mesh;
                        mediaMesh.material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
                        mediaMesh.matrixNeedsUpdate = true;
                    }
                }

                if (APP.getString(TFCNetworkedLearningFrameData.control[networkedEid]) != mediaControlMode) {
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused && (APP.getString(TFCNetworkedLearningFrameData.control[networkedEid]) == "MediaVideoPlay")) {
                            mediaVideoElement.play();
                        } else {
                            mediaVideoElement.pause();
                        }
                    }
                    mediaControlMode = APP.getString(TFCNetworkedLearningFrameData.control[networkedEid])!;
                }
            }
        }

        if (mediaType == "video") {
            if (mediaVideoElement && !mediaVideoElement.paused) {
                const videoProgressId = TFCMultipleMediaFrame.videoProgressRef[eid];
                const videoProgressWidth = TFCMultipleMediaFrame.videoProgressWidth[eid];
                const videoProgressObject = world.eid2obj.get(videoProgressId);
                if (videoProgressObject) {
                    const progress = (mediaVideoElement.currentTime / mediaVideoElement.duration) * 100;
                    //console.log("progress", progress);

                    videoProgressObject.children[1].scale.x = progress;
                    videoProgressObject.children[1].position.x = ((videoProgressWidth/2) * (progress/100)) - (videoProgressWidth/2);
                    videoProgressObject.children[1].matrixNeedsUpdate = true;
                }
            }
        }
    });

    TFLMenuControlsMenuHoveredQuery(world).forEach((eid: number) => {
        if (TFLMenuControls) {
            if (clicked(world, eid)) {
                const controlsMenuObject = world.eid2obj.get(eid);
                if (controlsMenuObject) {
                    //console.log("TFL Menu Controls was clicked", eid);
                    TFLMenuControls.toggle(controlsMenuObject as THREE.Group);
                }
            }
        }
    });

    TFLMenuControlsMenuHoveredEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFL Menu Controls Menu Hover", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateMenuHover(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuControlsMenuHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL Menu Controls Menu Hover", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateMenuHoverOut(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuControlsSubMenuHoveredEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFL Menu Controls SubMenu Hover", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateSubMenuHover(controlsMenuObject as THREE.Mesh);
            }
        }
    });

    TFLMenuControlsSubMenuHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL Menu Controls SubMenu Hover", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateSubMenuHoverOut(controlsMenuObject as THREE.Mesh);
            }
        }
    });

    TFLMenuPopControlsMenuQuery(world).forEach((eid: number) => {
        if (TFLMenuPopControls) {
            if (clicked(world, eid)) {
                const controlsMenuObject = world.eid2obj.get(eid);
                if (controlsMenuObject) {
                    //console.log("TFL MenuPop Controls Menu was clicked", eid);
                    TFLMenuPopControls.openPopMenu(controlsMenuObject as THREE.Group);
                }
            }
        }
    });

    TFLMenuPopControlsMenuEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFL MenuPop Controls Menu", eid);
        if (TFLMenuPopControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuPopControls.updateMenuHover(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuPopControlsMenuExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL MenuPop Controls Menu", eid);
        if (TFLMenuPopControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuPopControls.updateMenuHoverOut(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuPopControlsSubMenuEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFL MenuPop Controls SubMenu", eid);
        if (TFLMenuPopControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuPopControls.updateSubMenuHover(controlsMenuObject as THREE.Mesh);
            }
        }
    });

    TFLMenuPopControlsSubMenuExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL MenuPop Controls SubMenu", eid);
        if (TFLMenuPopControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuPopControls.updateSubMenuHoverOut(controlsMenuObject as THREE.Mesh);
            }
        }
    });

    TFLMenuPopControlsPopCloseQuery(world).forEach((eid: number) => {
        if (TFLMenuPopControls) {
            if (clicked(world, eid)) {
                const controlsPopMenuCloseObject = world.eid2obj.get(eid);
                if (controlsPopMenuCloseObject) {
                    //console.log("TFL MenuPop Controls Close was clicked", eid);
                    TFLMenuPopControls.closePopMenu(controlsPopMenuCloseObject as THREE.Group);
                }
            }
        }
    });
};

