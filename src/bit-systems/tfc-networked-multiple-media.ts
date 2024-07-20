import { TFCNetworkedMultipleMedia, TFCMultipleMediaFrame, TFCMultipleMediaLink, TFCNetworkedMediaData, Interacted, CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight, TFLMenuControlsMenuHover, TFLMenuControlsSubMenuHover, TFLMenuPopControlsMenu, TFLMenuPopControlsSubMenu, TFLMenuPopControlsPopClose } from "../bit-components";
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

const TFCNetworkedMultipleMediaQuery = defineQuery([TFCNetworkedMultipleMedia]);
const TFCNetworkedMultipleMediaEnterQuery = enterQuery(TFCNetworkedMultipleMediaQuery);
const TFCNetworkedMultipleMediaExitQuery = exitQuery(TFCNetworkedMultipleMediaQuery);

const TFCMultipleMediaLinkQuery = defineQuery([TFCMultipleMediaLink]);

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

function getMediaVideoTexture(url: string) {
    if (!mediaVideoElement) {
        mediaVideoElement = document.createElement("video");
        mediaVideoElement.autoplay = false;
        mediaVideoElement.loop = true;
        mediaVideoElement.preload = "auto";
        mediaVideoElement.crossOrigin = "anonymous";
        mediaVideoElement.setAttribute("playsinline", "");
        mediaVideoElement.setAttribute("webkit-playsinline", "");
        mediaVideoElement.width = 0;
        mediaVideoElement.height = 0;
    }
    mediaVideoElement.src = url;

    const texture = new THREE.VideoTexture(mediaVideoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;

    return texture;
}

function removeMediaVideoTexture() {
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

export function TFCNetworkedMultipleMediaSystem(world: HubsWorld) {
    TFCNetworkedMultipleMediaEnterQuery(world).forEach((eid: number) => {
        console.log("Enter TFC Networked Multiple Media Component", eid);

        const source = APP.getString(TFCNetworkedMultipleMedia.source[eid])!;
        //console.log("Networked Multiple Media Source", source);
        const mediaInfo = JSON.parse(source);

        const myObject = world.eid2obj.get(eid)!;
        const myObjectPosition = new THREE.Vector3();
        myObject.getWorldPosition(myObjectPosition);
        //console.log("myObject World Position", myObjectPosition);

        const myObjectScale = new THREE.Vector3();
        myObject.getWorldScale(myObjectScale);
        //console.log("myObject World Scale", myObjectScale);

        myObject.visible = false;

        mediaType = mediaInfo.videos.menus[0].links[0].type;
        let texture = null;
        if (mediaType == "video") {
            texture = getMediaVideoTexture(mediaInfo.videos.menus[0].links[0].url);
        } else if (mediaType == "image") {
            texture = getMediaImageTexture(mediaInfo.videos.menus[0].links[0].url);
        }

        // ViewFrame
        const viewFrameEid = addEntity(world);
        mediaFrame = new THREE.Group();

        // View
        const viewEid = addEntity(world);
        const planeGeometry = new THREE.PlaneGeometry(myObjectScale.x * 2, myObjectScale.z * 2);
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
        TFCMultipleMediaFrame.videoProgressWidth[viewEid] = myObjectScale.x * 2;

        // ProgressBar
        const progressBar = new THREE.Group();
        const progressFrameGeometry = new THREE.PlaneGeometry(myObjectScale.x * 2, 0.05);
        const progressFrameMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side:THREE.DoubleSide});
        progressFrameMaterial.transparent = true;
        progressFrameMaterial.opacity = 0.2;
        const progressFrame = new THREE.Mesh(progressFrameGeometry, progressFrameMaterial);
        progressBar.add(progressFrame);

        const progressValueGeometry = new THREE.PlaneGeometry((myObjectScale.x * 2 / 100), 0.05);
        const progressValueMaterial = new THREE.MeshBasicMaterial({color:0xff0000, side:THREE.DoubleSide});
        const progressValue = new THREE.Mesh(progressValueGeometry, progressValueMaterial);
        progressValue.scale.x = 0;
        progressValue.translateX(-myObjectScale.x);
        progressBar.add(progressValue);

        addObject3DComponent(world, progressBarEid, progressBar);

        progressBar.position.set(0, -myObjectScale.z, 0.01);
        mediaFrame.add(progressBar);

        addObject3DComponent(world, viewFrameEid, mediaFrame);

        mediaFrame.position.set(myObjectPosition.x, myObjectPosition.y, myObjectPosition.z);
        world.scene.add(mediaFrame);

        if (mediaType == "video") {
            mediaFrame.children[1].visible = true;
        } else {
            mediaFrame.children[1].visible = false;
        }

        const controlButtonEid = addEntity(world);

        const baseRoundedRectangleInfo = {
            text : "제어하기",
            fontSize : 20,
            fontWeight : "bolder",
            transparent : true,
            autoHeight : true
        }
        ControlButton = creatorRoundedRectangle(baseRoundedRectangleInfo);
	ControlButton.position.set(myObjectPosition.x - (myObjectScale.x + 0.70), myObjectPosition.y + myObjectScale.z + 0.24, myObjectPosition.z + 0.1);
	//ControlButton.scale.set(0.9, 0.9, 0.9);

        addObject3DComponent(world, controlButtonEid, ControlButton);

        addComponent(world, TFCMultipleMediaLink, controlButtonEid);
        mediaFrameObjectRef = viewFrameEid;
        TFCMultipleMediaLink.type[controlButtonEid] = APP.getSid("control");
	TFCMultipleMediaLink.url[controlButtonEid] = APP.getSid("");
	TFCMultipleMediaLink.info[controlButtonEid] = APP.getSid("");

        addComponent(world, CursorRaycastable, controlButtonEid); // Raycast
        addComponent(world, RemoteHoverTarget, controlButtonEid); // Hover
        addComponent(world, SingleActionButton, controlButtonEid); // Click

        world.scene.add(ControlButton);
        
        // MenuControls
        TFLMenuControls = new TFL_MenuControls(world, mediaInfo.videos.title, 1.2, 0.1, true, true, 0.5, 24, "#FFFFFF", "bolder", 0xFFFFFF, 0x000000, 0xFFFFFF);

        for (let index1 = 0; index1 < mediaInfo.videos.menus.length; index1++) {
            const videoInfo = mediaInfo.videos.menus[index1];
            const menu = TFLMenuControls.addMenu(videoInfo.title);
            for (let index2 = 0; index2 < videoInfo.links.length; index2++) {
                const videoItemInfo = videoInfo.links[index2];
                const videoItem = menu.addSubMenu(videoItemInfo.title);
                addComponent(world, TFCMultipleMediaLink, videoItem.subMenuEid);
                TFCMultipleMediaLink.type[videoItem.subMenuEid] = APP.getSid(videoItemInfo.type);
		TFCMultipleMediaLink.url[videoItem.subMenuEid] = APP.getSid(videoItemInfo.url);
		TFCMultipleMediaLink.info[videoItem.subMenuEid] = APP.getSid("");
            }

            if (index1 == 0) {
                menu.open();
            }
        }

        TFLMenuControls.initLayout();
        TFLMenuControls.performLayout();

	TFLMenuControls.getMesh().position.set(myObjectPosition.x - (myObjectScale.x + 1.7), myObjectPosition.y + myObjectScale.z, myObjectPosition.z + 0.1);
	//TFLMenuControls.getMesh().scale.set(0.9, 0.9, 0.9);
	world.scene.add(TFLMenuControls.getMesh());

        // MenuPopControls
        TFLMenuPopControls = new TFL_MenuPopControls(world, mediaInfo.questions.title, 1, 0.1, true, 0.5, 24, "#FFFFFF", "bolder", 0xFFFFFF, 0x000000, 0xFFFFFF);

        for (let index1 = 0; index1 < mediaInfo.questions.menus.length; index1++) {
            const questionInfo = mediaInfo.questions.menus[index1];
            const menu = TFLMenuPopControls.addMenu(questionInfo.title);
            for (let index2 = 0; index2 < questionInfo.links.length; index2++) {
                const questionItemInfo = questionInfo.links[index2];
                const questionItem = menu.addSubMenu(questionItemInfo.title);
                addComponent(world, TFCMultipleMediaLink, questionItem.subMenuEid);
                TFCMultipleMediaLink.type[questionItem.subMenuEid] = APP.getSid(questionItemInfo.type);
		TFCMultipleMediaLink.url[questionItem.subMenuEid] = APP.getSid(questionItemInfo.url);
		TFCMultipleMediaLink.info[questionItem.subMenuEid] = APP.getSid("");
            }
        }

        TFLMenuPopControls.initLayout();
        TFLMenuPopControls.performLayout();

	TFLMenuPopControls.getMesh().position.set(myObjectPosition.x + (myObjectScale.x + 0.2), myObjectPosition.y + myObjectScale.z, myObjectPosition.z + 0.1);
	//TFLMenuPopControls.getMesh().scale.set(0.9, 0.9, 0.9);
        world.scene.add(TFLMenuPopControls.getMesh());
    });

    TFCNetworkedMultipleMediaExitQuery(world).forEach((eid: number) => {
        console.log("Exit TFC Networked Multiple Media Component", eid);
        world.scene.remove(mediaFrame);
	world.scene.remove(ControlButton);
	TFLMenuControls.removeLayout();
	world.scene.remove(TFLMenuControls.getMesh());
	TFLMenuPopControls.removeLayout();
        world.scene.remove(TFLMenuPopControls.getMesh());

        const networkedEid = anyEntityWith(world, TFCNetworkedMediaData)!;
        if (networkedEid) {
            if (APP.getString(TFCNetworkedMediaData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedMediaData.clientId[networkedEid]) == NAF.clientId) {
                    TFCNetworkedMediaData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedMediaData.url[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.info[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.clientId[networkedEid] = APP.getSid("");
                }
            }
        }
    });

    TFCMultipleMediaLinkQuery(world).forEach((eid: number) => {
        if (clicked(world, eid)) {
            const networkedEid = anyEntityWith(world, TFCNetworkedMediaData)!;
            
            const type = APP.getString(TFCMultipleMediaLink.type[eid])!;
	    const url = APP.getString(TFCMultipleMediaLink.url[eid])!;
	    const info = APP.getString(TFCMultipleMediaLink.info[eid])!;

            if (type == "control" && url == "" && info == "") {
                if (networkedEid) {
                    takeOwnership(world, networkedEid);
                    TFCNetworkedMediaData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedMediaData.url[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.info[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                } else {
                    const nid = createNetworkedEntity(world, "tfc-networked-media-data", { type: type, url: url, control: "", info: "", clientId: NAF.clientId });
                }
            } else {
                if (networkedEid && networkClientId == NAF.clientId) {
                    TFCNetworkedMediaData.type[networkedEid] = APP.getSid(type);
		    TFCNetworkedMediaData.url[networkedEid] = APP.getSid(url);
		    TFCNetworkedMediaData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedMediaData.info[networkedEid] = APP.getSid(info);
                    TFCNetworkedMediaData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                }
            }
        }
    });

    TFCMultipleMediaFrameQuery(world).forEach((eid: number) => {
        const networkedEid = anyEntityWith(world, TFCNetworkedMediaData)!;
        if (networkedEid) {
            if (clicked(world, eid)) {
                if (networkClientId == NAF.clientId) {       
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused) {
                            TFCNetworkedMediaData.control[networkedEid] = APP.getSid("MediaVideoPlay");
                        } else {
                            TFCNetworkedMediaData.control[networkedEid] = APP.getSid("MediaVideoStop");
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

	    if (APP.getString(TFCNetworkedMediaData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedMediaData.clientId[networkedEid]) == NAF.clientId) {
                    ((ControlButton.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(0x5CB85C);
                } else {
                    ((ControlButton.children[0] as THREE.Mesh).material as THREE.MeshBasicMaterial).color.setHex(0x000000);
                }
                ControlButton.children[0].matrixNeedsUpdate = true;
                networkClientId = APP.getString(TFCNetworkedMediaData.clientId[networkedEid])!;
            }

            if (APP.getString(TFCNetworkedMediaData.type[networkedEid]) != "" &&
                APP.getString(TFCNetworkedMediaData.url[networkedEid]) != "") {
		if (APP.getString(TFCNetworkedMediaData.url[networkedEid]) != mediaURL) {
                    const mediaObject = world.eid2obj.get(mediaFrameObjectRef);
                    if (mediaObject) {
                        console.log("networkedEid", networkedEid);
                        removeMediaVideoTexture();

                        const type = APP.getString(TFCNetworkedMediaData.type[networkedEid])!;
                        const url = APP.getString(TFCNetworkedMediaData.url[networkedEid])!;

                        let texture = null;
                        if (type == "video") {
                            mediaObject.children[1].visible = true;
                            mediaObject.children[1].children[1].scale.x = 0;
                            mediaObject.children[1].children[1].matrixNeedsUpdate = true;
                            texture = getMediaVideoTexture(url);
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

                if (APP.getString(TFCNetworkedMediaData.control[networkedEid]) != mediaControlMode) {
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused && (APP.getString(TFCNetworkedMediaData.control[networkedEid]) == "MediaVideoPlay")) {
                            mediaVideoElement.play();
                        } else {
                            mediaVideoElement.pause();
		        }
			mediaControlMode = APP.getString(TFCNetworkedMediaData.control[networkedEid])!;
                    }
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
        //console.log("Enter TFL Menu Controls Menu", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateMenuHover(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuControlsMenuHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL Menu Controls Menu", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateMenuHoverOut(controlsMenuObject as THREE.Group);
            }
        }
    });

    TFLMenuControlsSubMenuHoveredEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFL Menu Controls SubMenu", eid);
        if (TFLMenuControls) {
            const controlsMenuObject = world.eid2obj.get(eid);
            if (controlsMenuObject) {
                TFLMenuControls.updateSubMenuHover(controlsMenuObject as THREE.Mesh);
            }
        }
    });

    TFLMenuControlsSubMenuHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFL Menu Controls SubMenu", eid);
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


