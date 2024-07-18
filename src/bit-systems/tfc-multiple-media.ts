import { TFCMultipleMedia, TFCMultipleMediaLink, TFCMultipleMediaFrame, Interacted, CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import type { EntityID } from "../utils/networking-types";

function clicked(world: HubsWorld, eid: EntityID) {
    return hasComponent(world, Interacted, eid);
}

const TFCMultipleMediaLinkQuery = defineQuery([TFCMultipleMediaLink]);

const TFCMultipleMediaQuery = defineQuery([TFCMultipleMedia]);
const TFCMultipleMediaEnterQuery = enterQuery(TFCMultipleMediaQuery);
const TFCMultipleMediaExitQuery = exitQuery(TFCMultipleMediaQuery);

const TFCMultipleMediaFrameQuery = defineQuery([TFCMultipleMediaFrame]);
const TFCMultipleMediaFrameEnterQuery = enterQuery(TFCMultipleMediaFrameQuery);

let mediaType : string = "";
let mediaVideoElement : HTMLVideoElement;
let mediaFrameScale : THREE.Vector3;

function getMediaVideoTexture(url: string) {
    if (!mediaVideoElement) {
        mediaVideoElement = document.createElement("video");
        mediaVideoElement.autoplay = false;
        mediaVideoElement.loop = true;
        mediaVideoElement.preload = "auto";
        mediaVideoElement.crossOrigin = "anonymous";
        mediaVideoElement.width = 0;
        mediaVideoElement.height = 0;

        mediaVideoElement.addEventListener('timeupdate', videoProgress);
    }
    mediaVideoElement.src = url;

    const texture = new THREE.VideoTexture(mediaVideoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;

    return texture;
}

function videoProgress() {
    if (mediaType == "video") {
        if (mediaVideoElement && !mediaVideoElement.paused) {
            //console.log("currentTime", mediaVideoElement.currentTime, mediaVideoElement.duration, (mediaVideoElement.currentTime / mediaVideoElement.duration) * 100);
        }
    }
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

export function TFCMultipleMediaSystem(world: HubsWorld) {
    TFCMultipleMediaLinkQuery(world).forEach((eid: number) => {
        if (clicked(world, eid)) {
            const mediaObjectId = TFCMultipleMediaLink.targetObjectRef[eid];
            const mediaObject = world.eid2obj.get(mediaObjectId);
            if (mediaObject) {
                removeMediaVideoTexture();

                mediaType = APP.getString(TFCMultipleMediaLink.type[eid])!;
                const url = APP.getString(TFCMultipleMediaLink.url[eid])!;

                let texture = null;
                if (mediaType == "video") {
                    mediaObject.children[1].visible = true;
                    mediaObject.children[1].children[1].scale.x = 0;
                    mediaObject.children[1].children[1].matrixNeedsUpdate = true;
                    texture = getMediaVideoTexture(url);
                } else if (mediaType == "image") {
                    mediaObject.children[1].visible = false;
                    texture = getMediaImageTexture(url);
                }

                const mediaMesh = mediaObject.children[0] as THREE.Mesh;
                mediaMesh.material = new THREE.MeshBasicMaterial({map: texture, side: THREE.DoubleSide});

                mediaMesh.matrixNeedsUpdate = true;
            }
        }
    });

    TFCMultipleMediaEnterQuery(world).forEach((eid: number) => {
        //console.log("Enter TFC Multiple Media Component", eid);

        const source = APP.getString(TFCMultipleMedia.source[eid])!;
        //console.log("Multiple Media URLs", source);
        const mediaUrlList = JSON.parse(source);

        const myObject = world.eid2obj.get(eid)!;
        const myObjectPosition = new THREE.Vector3();
        myObject.getWorldPosition(myObjectPosition);
        //console.log("myObject World Position", myObjectPosition);

        const myObjectScale = new THREE.Vector3();
        myObject.getWorldScale(myObjectScale);
        //console.log("myObject World Scale", myObjectScale);
        mediaFrameScale = myObjectScale;

        myObject.visible = false;

        mediaType = mediaUrlList.links[0].type;
        let texture = null;
        if (mediaType == "video") {
            texture = getMediaVideoTexture(mediaUrlList.links[0].url);
        } else if (mediaType == "image") {
            texture = getMediaImageTexture(mediaUrlList.links[0].url);
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

	//mediaFrame.rotateY(-Math.PI / 2);

        if (mediaType == "video") {
            mediaFrame.children[1].visible = true;
        } else {
            mediaFrame.children[1].visible = false;
        }

        //
        for (let index = 0; index < mediaUrlList.links.length; index++) {
            const circleGeometry = new THREE.CircleGeometry(0.1, 8);
            const circleColor = THREE.MathUtils.randInt(0, 0xffffff);
            const circleMaterial = new THREE.MeshBasicMaterial({color: circleColor}); 
            const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
            circleMesh.position.set(myObjectPosition.x - (myObjectScale.x + 0.3), myObjectPosition.y + myObjectScale.z - 0.1 - (index * 0.3), myObjectPosition.z + 0.2);

            const newEid2 = addEntity(world);
            addObject3DComponent(world, newEid2, circleMesh);

            const mediaUrlItem = mediaUrlList.links[index];

            addComponent(world, TFCMultipleMediaLink, newEid2);
            TFCMultipleMediaLink.targetObjectRef[newEid2] = viewFrameEid;
            TFCMultipleMediaLink.type[newEid2] = APP.getSid(mediaUrlItem.type);
            TFCMultipleMediaLink.url[newEid2] = APP.getSid(mediaUrlItem.url);

            addComponent(world, CursorRaycastable, newEid2); // Raycast
            addComponent(world, RemoteHoverTarget, newEid2); // Hover
            addComponent(world, SingleActionButton, newEid2); // Click

	    //circleMesh.rotateY(-Math.PI / 2);
            world.scene.add(circleMesh);
        }
    });

    TFCMultipleMediaExitQuery(world).forEach((eid: number) => {
        console.log("Exit TFC Multiple Media Component", eid);
    });

    TFCMultipleMediaFrameEnterQuery(world).forEach((eid: number) => {
    });

    TFCMultipleMediaFrameQuery(world).forEach((eid: number) => {
        if (clicked(world, eid)) {
            if (mediaType == "video") {
                if (mediaVideoElement && mediaVideoElement.paused) {
                    mediaVideoElement.play();
                } else {
                    mediaVideoElement.pause();
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
                    videoProgressObject.children[1].position.x = ((videoProgressWidth/2) * (progress/100)) - (videoProgressWidth / 2);
                    videoProgressObject.children[1].matrixNeedsUpdate = true;
                    //videoProgressObject.matrixNeedsUpdate = true;
                }
            }
        }
    });
};
