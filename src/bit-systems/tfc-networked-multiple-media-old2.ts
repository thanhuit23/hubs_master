import { TFCNetworkedMultipleMedia, TFCMultipleMediaFrame, TFCMultipleMediaLink, TFCNetworkedMediaData, Interacted, CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight, TFCControlsFolderHover, TFCControlsItemHover } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import type { EntityID } from "../utils/networking-types";
import { anyEntityWith } from "../utils/bit-utils";
import { createNetworkedEntity } from "../utils/create-networked-entity";
import { takeOwnership } from "../utils/take-ownership";
import { TFL_Controls } from "../tfl-libs/tfl-controls";

function clicked(world: HubsWorld, eid: EntityID) {
    return hasComponent(world, Interacted, eid);
}

const TFCNetworkedMultipleMediaQuery = defineQuery([TFCNetworkedMultipleMedia]);
const TFCNetworkedMultipleMediaEnterQuery = enterQuery(TFCNetworkedMultipleMediaQuery);
const TFCNetworkedMultipleMediaExitQuery = exitQuery(TFCNetworkedMultipleMediaQuery);

const TFCMultipleMediaLinkQuery = defineQuery([TFCMultipleMediaLink]);

const TFCMultipleMediaFrameQuery = defineQuery([TFCMultipleMediaFrame]);

const TFCControlsFolderHoveredQuery = defineQuery([HoveredRemoteRight, TFCControlsFolderHover]);
const TFCControlsFolderHoveredEnterQuery = enterQuery(TFCControlsFolderHoveredQuery);
const TFCControlsFolderHoveredExitQuery = exitQuery(TFCControlsFolderHoveredQuery);

const TFCControlsItemHoveredQuery = defineQuery([HoveredRemoteRight, TFCControlsItemHover]);
const TFCControlsItemHoveredEnterQuery = enterQuery(TFCControlsItemHoveredQuery);
const TFCControlsItemHoveredExitQuery = exitQuery(TFCControlsItemHoveredQuery);

let mediaType : string = "";
let mediaFrameObjectRef : number = 0;
let mediaVideoElement : HTMLVideoElement;
let mediaVideoPlay : string = "0";

let TFCControls1 : TFL_Controls;

function getMediaVideoTexture(url: string) {
    if (!mediaVideoElement) {
        mediaVideoElement = document.createElement("video");
        mediaVideoElement.autoplay = false;
        mediaVideoElement.loop = true;
        mediaVideoElement.preload = "auto";
        mediaVideoElement.crossOrigin = "anonymous";
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

function getMediaButtonMesh(text: string) {
    const fontWeight = "bolder"; // normal
    const fontSize = 16;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d')!;
    context.font = fontWeight + " " + fontSize + "px Gulim";
  
    // width of the text
    const metrics = context.measureText(text);
    const textWidth = metrics.width;
    const textHeight = fontSize;
  
    canvas.width = textWidth;
    canvas.height = textHeight;
    context.font = fontWeight + " " + fontSize + "px Gulim";
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillStyle = "#ffffff";
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.fillText(text, textWidth/2, textHeight/2);
  
    const texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
  
    canvas.remove();
  
    const buttonTextMaterial = new THREE.MeshBasicMaterial({map: texture, color: 0xffffff, transparent: true, side: THREE.DoubleSide});

    const linkButton = new THREE.Group();

    const buttonGeometry = new THREE.BoxGeometry((textWidth + 20) / 100, (textHeight + 10) / 100, 0.05);
    //const buttonColor = THREE.MathUtils.randInt(0, 0xffffff);
    const buttonMaterial = new THREE.MeshBasicMaterial({color: 0x6d14b8, side:THREE.DoubleSide});
    const buttonMesh = new THREE.Mesh(buttonGeometry, buttonMaterial);
    linkButton.add(buttonMesh);

    const buttonTextMesh = new THREE.Mesh(new THREE.PlaneGeometry(textWidth / 140, textHeight / 140), buttonTextMaterial);
    buttonTextMesh.position.z = 0.026;
    linkButton.add(buttonTextMesh);

    return linkButton;
}

export function TFCNetworkedMultipleMediaSystem(world: HubsWorld) {
    TFCNetworkedMultipleMediaEnterQuery(world).forEach((eid: number) => {
        console.log("Enter TFC Networked Multiple Media Component", eid);

        const source = APP.getString(TFCNetworkedMultipleMedia.source[eid])!;
        //console.log("Networked Multiple Media Source", source);
        const mediaInfoList = JSON.parse(source);

        const myObject = world.eid2obj.get(eid)!;
        const myObjectPosition = new THREE.Vector3();
        myObject.getWorldPosition(myObjectPosition);
        //console.log("myObject World Position", myObjectPosition);

        const myObjectScale = new THREE.Vector3();
        myObject.getWorldScale(myObjectScale);
        //console.log("myObject World Scale", myObjectScale);

        myObject.visible = false;

        mediaType = mediaInfoList.folders[0].links[0].type;
        let texture = null;
        if (mediaType == "video") {
            texture = getMediaVideoTexture(mediaInfoList.folders[0].links[0].url);
        } else if (mediaType == "image") {
            texture = getMediaImageTexture(mediaInfoList.folders[0].links[0].url);
        }

        // ViewFrame
        const viewFrameEid = addEntity(world);
        const mediaFrame = new THREE.Group();

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
            
        const controlButtonMesh = getMediaButtonMesh("제어하기");
        const controlBoxMesh = controlButtonMesh.children[0] as THREE.Mesh;
        const controlBox = controlBoxMesh.geometry as THREE.BoxGeometry;
        controlButtonMesh.position.set(myObjectPosition.x - (myObjectScale.x + 0.2) - (controlBox.parameters.width / 2), myObjectPosition.y + myObjectScale.z + controlBox.parameters.height, myObjectPosition.z + 0.4);

        addObject3DComponent(world, controlButtonEid, controlButtonMesh);

        addComponent(world, TFCMultipleMediaLink, controlButtonEid);
        mediaFrameObjectRef = viewFrameEid;
        TFCMultipleMediaLink.type[controlButtonEid] = APP.getSid("control");
        TFCMultipleMediaLink.url[controlButtonEid] = APP.getSid("");

        addComponent(world, CursorRaycastable, controlButtonEid); // Raycast
        addComponent(world, RemoteHoverTarget, controlButtonEid); // Hover
        addComponent(world, SingleActionButton, controlButtonEid); // Click

        world.scene.add(controlButtonMesh);
        
        //
        TFCControls1 = new TFL_Controls(world, 2, true);

        for (let index1 = 0; index1 < mediaInfoList.folders.length; index1++) {
            const mediaFolderInfo = mediaInfoList.folders[index1];

            const mediaFolder = TFCControls1.addFolder(mediaFolderInfo.title);

            for (let index2 = 0; index2 < mediaFolderInfo.links.length; index2++) {
                const mediaItemInfo = mediaFolderInfo.links[index2];

                const mediaItem = mediaFolder.addItem(mediaItemInfo.title);

                addComponent(world, TFCMultipleMediaLink, mediaItem.itemEid);
                TFCMultipleMediaLink.type[mediaItem.itemEid] = APP.getSid(mediaItemInfo.type);
                TFCMultipleMediaLink.url[mediaItem.itemEid] = APP.getSid(mediaItemInfo.url);
            }

            if (index1 == 0) {
                mediaFolder.open();
            }
        }

	TFCControls1.getMesh().position.set(myObjectPosition.x - (myObjectScale.x + 1.1), myObjectPosition.y + myObjectScale.z, myObjectPosition.z + 0.4);
	TFCControls1.getMesh().scale.set(0.5, 0.5, 0.5);
        world.scene.add(TFCControls1.getMesh());
    });

    TFCNetworkedMultipleMediaExitQuery(world).forEach((eid: number) => {
        console.log("Exit TFC Networked Multiple Media Component", eid);
    });

    TFCMultipleMediaLinkQuery(world).forEach((eid: number) => {
        if (clicked(world, eid)) {
            const networkedEid = anyEntityWith(world, TFCNetworkedMediaData)!;
            
            const type = APP.getString(TFCMultipleMediaLink.type[eid])!;
            const url = APP.getString(TFCMultipleMediaLink.url[eid])!;

            if (type == "control" && url == "") {
                if (networkedEid) {
                    takeOwnership(world, networkedEid);
                } else {
                    const nid = createNetworkedEntity(world, "tfc-networked-media-data", { type: type, url: url, constrol: 0 });
                }
            } else {
                if (networkedEid) {
                    TFCNetworkedMediaData.type[networkedEid] = APP.getSid(type);
                    TFCNetworkedMediaData.url[networkedEid] = APP.getSid(url);
                }
            }
        }
    });

    TFCMultipleMediaFrameQuery(world).forEach((eid: number) => {
        const networkedEid = anyEntityWith(world, TFCNetworkedMediaData)!;
        if (networkedEid) {
            if (clicked(world, eid)) {
                //takeOwnership(world, networkedEid);
                //console.log("clientId", NAF.clientId);                
                if (mediaType == "video") {
                    if (mediaVideoElement && mediaVideoElement.paused) {
                        TFCNetworkedMediaData.control[networkedEid] = 1;
                    } else {
                        TFCNetworkedMediaData.control[networkedEid] = 0;
                    }
                }
            }

            if (APP.getString(TFCNetworkedMediaData.type[networkedEid]) != "" &&
                APP.getString(TFCNetworkedMediaData.url[networkedEid]) != "") {
                if (APP.getString(TFCNetworkedMediaData.type[networkedEid]) != mediaType) {
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
                        mediaVideoPlay = "0";
                        mediaType = type;

                        const mediaMesh = mediaObject.children[0] as THREE.Mesh;
                        mediaMesh.material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});
        
                        mediaMesh.matrixNeedsUpdate = true;
                    }
                }

                if (APP.getString(TFCNetworkedMediaData.control[networkedEid]) != mediaVideoPlay) {
                    if (mediaType == "video") {
                        if (mediaVideoElement && mediaVideoElement.paused && (APP.getString(TFCNetworkedMediaData.control[networkedEid]) == "1")) {
                            mediaVideoElement.play();
                        } else {
                            mediaVideoElement.pause();
                        }
                        mediaVideoPlay = APP.getString(TFCNetworkedMediaData.control[networkedEid])!;
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

    TFCControlsFolderHoveredEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFC Controls Folder Over Folder", eid);
        if (TFCControls1) {
            const controlsFolderObject = world.eid2obj.get(eid);
            if (controlsFolderObject) {
                TFCControls1.updateFolderHover(controlsFolderObject as THREE.Group);
            }
        }
    });

    TFCControlsFolderHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFC Controls Folder Over Folder", eid);
        if (TFCControls1) {
            const controlsFolderObject = world.eid2obj.get(eid);
            if (controlsFolderObject) {
                TFCControls1.updateFolderHoverOut(controlsFolderObject as THREE.Group);
            }
        }
    });

    TFCControlsFolderHoveredQuery(world).forEach((eid: number) => {
        if (TFCControls1) {
            if (clicked(world, eid)) {
                const controlsFolderObject = world.eid2obj.get(eid);
                if (controlsFolderObject) {
                    //console.log("TFC Controls Folder Over Folder was clicked", eid);
                    TFCControls1.toggle(controlsFolderObject as THREE.Group);
                }
            }
        }
    });

    TFCControlsItemHoveredEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFC Controls Item Over Folder", eid);
    });

    TFCControlsItemHoveredExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFC Controls Item Over Folder", eid);
    });
};


