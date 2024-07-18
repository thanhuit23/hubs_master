import { TFCMultipleImageLink, TFCLink, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, addEntity } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { addComponent } from "bitecs";

const TFCMultipleImageLinkQuery = defineQuery([TFCMultipleImageLink]);
const TFCMultipleImageLinkEnterQuery = enterQuery(TFCMultipleImageLinkQuery);
const TFCMultipleImageLinkExitQuery = exitQuery(TFCMultipleImageLinkQuery);

export function TFCMultipleImageLinkSystem(world: HubsWorld) {
    TFCMultipleImageLinkQuery(world).forEach((eid: number) => {
  });

  TFCMultipleImageLinkEnterQuery(world).forEach((eid: number) => {
    console.log("Enter TFC Multiple Image Link Component", eid);

    const horizontalBlocks = TFCMultipleImageLink.horizontalBlocks[eid];
    const verticalBlocks = TFCMultipleImageLink.verticalBlocks[eid];
    const blockWidth = TFCMultipleImageLink.blockWidth[eid];
    const blockHeight = TFCMultipleImageLink.blockHeight[eid];
    const blockInterval = TFCMultipleImageLink.blockInterval[eid];
    let bottomPadding = TFCMultipleImageLink.bottomPadding[eid];
    let showEmptyBlocks = TFCMultipleImageLink.showEmptyBlocks[eid];
    const imageLinkJSON = APP.getString(TFCMultipleImageLink.imageLinkJSON[eid])!;
    //console.log("Horizontal Block Count", horizontalBlocks);
    //console.log("Vertical Block Count", verticalBlocks);
    //console.log("Block Width", blockWidth);
    //console.log("Block Height", blockHeight);
    //console.log("Block Interval", blockInterval);
    //console.log("Bottom Padding", bottomPadding);
    //console.log("Show Empty Blocks", showEmptyBlocks);
    //console.log("Multiple Link Image Info", imageLinkJSON);

    const imageLinkInfo = JSON.parse(imageLinkJSON);
    //console.log("Multiple Link Image Info", imageLinkInfo);

    const obj1 = world.eid2obj.get(eid)!;
    const pos1 = new THREE.Vector3();
    obj1.getWorldPosition(pos1);
    console.log("pos1", pos1);

    obj1.visible = false;

    const planeWidth = blockWidth;
    const planeHeight = blockHeight;
    const interval = blockInterval;
    let josnIndex = 0;
    for (let indexY = 0; indexY < horizontalBlocks; indexY++) {
        for (let indexX = 0; indexX < verticalBlocks; indexX++) {
            //console.log("indexX, indexY", indexX, indexY);
            const imageLinkItem = imageLinkInfo.links[josnIndex]!;

            let linkImagesMaterial = null;
            if (imageLinkItem != null) {
                const linkImagesTexture = new THREE.TextureLoader().load(imageLinkItem.imageUrl);
                linkImagesMaterial = new THREE.MeshBasicMaterial({map:linkImagesTexture, side: THREE.DoubleSide});
            } else {
              if (showEmptyBlocks) {
                linkImagesMaterial = new THREE.MeshBasicMaterial({color:0xffffff, side: THREE.DoubleSide});
              }
            }

            if (linkImagesMaterial) {
              // 평면 객체 생성
              const newEid = addEntity(world);
              const planeGeometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
              const plane1 = new THREE.Mesh(planeGeometry, linkImagesMaterial);

              let positionX = pos1.x + (indexX * planeWidth);
              if (indexX < verticalBlocks) {
                positionX += (indexX * interval);
              }
              // 바닥을 기준으로 하기 때문에 pos1.y를 더하지 않음
              let positionY = (horizontalBlocks * planeHeight) - (indexY * planeHeight) + bottomPadding;
              if (indexY < horizontalBlocks) {
                positionY += (((horizontalBlocks - 1) * interval) - (indexY * interval));
              }
              let positionZ = pos1.z;
              plane1.position.set(positionX, positionY, positionZ);

              addObject3DComponent(world, newEid, plane1);

              world.scene.add(plane1);

              if (imageLinkItem != null) {
                  addComponent(world, TFCLink, newEid);
                  //console.log("linkUrl, layerPopup", imageLinkItem.linkUrl, imageLinkItem.layerPopup);
                  TFCLink.linkUrl[newEid] = APP.getSid(imageLinkItem.linkUrl);
                  TFCLink.layerPopup[newEid] = imageLinkItem.layerPopup ? 1 : 0;

                  addComponent(world, CursorRaycastable, newEid); // Raycast
                  addComponent(world, RemoteHoverTarget, newEid); // Hover
              }
            }
        
            josnIndex++;
        }
    }
  });

  TFCMultipleImageLinkExitQuery(world).forEach((eid: number) => {
    console.log("Exit TFC Multiple Image Link Component", eid);
  });
};
