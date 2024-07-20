import { TFCImageLink, TFCLink, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, addEntity } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { addComponent } from "bitecs";

const TFCImageLinkQuery = defineQuery([TFCImageLink]);
const TFCImageLinkEnterQuery = enterQuery(TFCImageLinkQuery);
const TFCImageLinkExitQuery = exitQuery(TFCImageLinkQuery);

export function TFCImageLinkSystem(world: HubsWorld) {
  TFCImageLinkQuery(world).forEach((eid: number) => {
  });

  TFCImageLinkEnterQuery(world).forEach((eid: number) => {
    console.log("Enter TFC Image Link Component", eid);
    const linkImageUrl = APP.getString(TFCImageLink.imageUrl[eid])!;
    const linkImagesTexture = new THREE.TextureLoader().load(linkImageUrl);
    const linkImagesMaterial = new THREE.MeshBasicMaterial({map:linkImagesTexture ,side:THREE.DoubleSide});

    const obj1 = world.eid2obj.get(eid)!;
    const pos1 = new THREE.Vector3();
    obj1.getWorldPosition(pos1);

    obj1.visible = false;

    // 평면 객체 생성
    const newEid = addEntity(world);
    const plane1Geometry = new THREE.PlaneGeometry(1, 1);
    const plane1 = new THREE.Mesh(plane1Geometry, linkImagesMaterial);
    plane1.position.set(pos1.x, pos1.y, pos1.z);

    addObject3DComponent(world, newEid, plane1);

    world.scene.add(plane1);

    addComponent(world, TFCLink, newEid);
    TFCLink.linkUrl[newEid] = TFCImageLink.linkUrl[eid]!;
    TFCLink.layerPopup[newEid] = TFCImageLink.layerPopup[eid]!;

    addComponent(world, CursorRaycastable, newEid); // Raycast
    addComponent(world, RemoteHoverTarget, newEid); // Hover
    addComponent(world, SingleActionButton, newEid); // Click
  });

  TFCImageLinkExitQuery(world).forEach((eid: number) => {
    console.log("Exit TFC Image Link Component", eid);
  });
};
