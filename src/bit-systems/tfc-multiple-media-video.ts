import { TFCMultipleMediaVideo, TFCMultipleMediaVideoLink, Interacted, MediaVideo, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity, addComponent } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { createImageMesh } from "../utils/create-image-mesh";
import type { EntityID } from "../utils/networking-types";

function clicked(world: HubsWorld, eid: EntityID) {
  return hasComponent(world, Interacted, eid);
}

const TFCMultipleMediaVideoLinkQuery = defineQuery([TFCMultipleMediaVideoLink]);

const TFCMultipleMediaVideoQuery = defineQuery([TFCMultipleMediaVideo]);
const TFCMultipleMediaVideoEnterQuery = enterQuery(TFCMultipleMediaVideoQuery);
const TFCMultipleMediaVideoExitQuery = exitQuery(TFCMultipleMediaVideoQuery);

export function TFCMultipleMediaVideoSystem(world: HubsWorld) {
  TFCMultipleMediaVideoLinkQuery(world).forEach((eid: number) => {
    if (clicked(world, eid)) {
      const url = APP.getString(TFCMultipleMediaVideoLink.url[eid])!;

      const videoObjectId = TFCMultipleMediaVideoLink.targetObjectRef[eid];
      const videoObject = world.eid2obj.get(videoObjectId);
      if (videoObject) {
        const videoElement = document.getElementById("video_" + videoObjectId) as HTMLVideoElement;
        videoElement.src = url;

        /*
        const videoElement = document.createElement("video");
        videoElement.id = "video1";
        videoElement.autoplay = true;
        videoElement.loop = true;
        videoElement.preload = "auto";
        videoElement.crossOrigin = "anonymous";
        videoElement.src = url;

        //const sourceElement = document.createElement("source");
        //sourceElement.setAttribute("src", url);
        //sourceElement.setAttribute("type", "video/mp4");
        //videoElement.appendChild(sourceElement);
        */

        const texture = new THREE.VideoTexture(videoElement);
        texture.minFilter = THREE.LinearFilter;
        texture.encoding = THREE.sRGBEncoding;

        const videoMesh = videoObject as THREE.Mesh;
        videoMesh.material = new THREE.MeshBasicMaterial({map: texture,  side: THREE.DoubleSide});

        videoObject.matrixNeedsUpdate = true;
      }
    }
  });

  TFCMultipleMediaVideoQuery(world).forEach((eid: number) => {
  });

  TFCMultipleMediaVideoEnterQuery(world).forEach((eid: number) => {
    console.log("Enter TFC Multiple Media Video Component", eid);

    const source = APP.getString(TFCMultipleMediaVideo.source[eid])!;
    //console.log("Multiple Media Video URLs", source);
    const videoUrlList = JSON.parse(source);

    const myObject = world.eid2obj.get(eid)!;
    const myObjectPosition = new THREE.Vector3();
    myObject.getWorldPosition(myObjectPosition);
    //console.log("myObject World Position", myObjectPosition);

    const myObjectScale = new THREE.Vector3();
    myObject.getWorldScale(myObjectScale);
    //console.log("myObject World Scale", myObjectScale);

    myObject.visible = false;

    const newEid = addEntity(world);

    const videoElement = document.createElement("video");
    videoElement.id = "video_" + newEid;
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.preload = "auto";
    videoElement.crossOrigin = "anonymous";
    videoElement.width = 0;
    videoElement.height = 0;
    videoElement.src = videoUrlList.video[0].url;

    //const sourceElement = document.createElement("source");
    //sourceElement.setAttribute("src", "https://localhost:9090/assets/videos/SpokePromo-d2938564ef20e10abf757c09182a1056.mp4");
    //sourceElement.setAttribute("src", videoUrlList.video[0].url);
    //sourceElement.setAttribute("type", "video/mp4");

    //videoElement.appendChild(sourceElement);
    document.body.appendChild(videoElement);

    const texture = new THREE.VideoTexture(videoElement);
    texture.minFilter = THREE.LinearFilter;
    texture.encoding = THREE.sRGBEncoding;
    
    /*
    const videoMesh = createImageMesh(texture, 1);
    mesh.position.set(myObjectPosition.x, 3, myObjectPosition.z);
    */
  
    const planeGeometry = new THREE.PlaneGeometry(myObjectScale.x * 2, myObjectScale.z * 2);
    const planeMaterial = new THREE.MeshBasicMaterial({map: texture,  side: THREE.DoubleSide});
    const videoMesh = new THREE.Mesh(planeGeometry, planeMaterial);
    videoMesh.position.set(myObjectPosition.x, myObjectPosition.y, myObjectPosition.z);

    addObject3DComponent(world, newEid, videoMesh);

    world.scene.add(videoMesh);

    //
    for (let index = 0; index < videoUrlList.video.length; index++) {
      const circleGeometry = new THREE.CircleGeometry(0.1, 8);
      const circleColor = THREE.MathUtils.randInt(0, 0xffffff);
      const circleMaterial = new THREE.MeshBasicMaterial({color: circleColor}); 
      const circleMesh = new THREE.Mesh(circleGeometry, circleMaterial);
      circleMesh.position.set(myObjectPosition.x - (myObjectScale.x + 0.5), myObjectPosition.y + myObjectScale.z - (index * 0.4), myObjectPosition.z);
  
      const newEid2 = addEntity(world);
      addObject3DComponent(world, newEid2, circleMesh);
  
      const videoUrlItem = videoUrlList.video[index];
  
      addComponent(world, TFCMultipleMediaVideoLink, newEid2);
      TFCMultipleMediaVideoLink.targetObjectRef[newEid2] = newEid;
      TFCMultipleMediaVideoLink.url[newEid2] = APP.getSid(videoUrlItem.url);
  
      addComponent(world, CursorRaycastable, newEid2); // Raycast
      addComponent(world, RemoteHoverTarget, newEid2); // Hover
      addComponent(world, SingleActionButton, newEid2); // Click
  
      world.scene.add(circleMesh);
    }
  });

  TFCMultipleMediaVideoExitQuery(world).forEach((eid: number) => {
    console.log("Exit TFC Multiple Media Video Component", eid);
  });
};
