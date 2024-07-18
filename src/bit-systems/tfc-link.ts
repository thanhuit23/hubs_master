import { TFCLink, Interacted } from "../bit-components";
import type { HubsWorld } from "../app";
//import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity } from "bitecs";
import { defineQuery, enterQuery, exitQuery } from "bitecs";
//import type { EntityID } from "../utils/networking-types";

/*
import "../components/custom-style.css";
import closeIconUrl from "../assets/images/close_btn.png";
*/

/*
function clicked(world: HubsWorld, eid: EntityID) {
  return hasComponent(world, Interacted, eid);
}
*/

const TFCLinkQuery = defineQuery([TFCLink]);
const TFCLinkEnterQuery = enterQuery(TFCLinkQuery);
const TFCLinkExitQuery = exitQuery(TFCLinkQuery);

/*
function layerPopupClose() {
  var layerpopup = document.getElementById("tfcLayerPopup")!;
  layerpopup.remove();
}
*/

export function TFCLinkSystem(world: HubsWorld) {
    TFCLinkQuery(world).forEach((eid: number) => {
    /*
    if (clicked(world, eid)) {
      console.log("TFC Link Component was clicked", eid);
      const linkUrl = APP.getString(TFCLink.linkUrl[eid])!;
      const layerPopup = TFCLink.layerPopup[eid]!;
      if (layerPopup) {
        const layer = document.createElement("div");
        layer.setAttribute("class", "tfc-layer-pop");
        layer.setAttribute("id", "tfcLayerPopup");

        const container = document.createElement("div");
        container.setAttribute("class", "pop-container");

        const topArea = document.createElement("div");
        topArea.setAttribute("class", "top-area");
        topArea.innerHTML = `<button type="button">X</button>`;
        //topArea.innerHTML = `<button type="button"><img src="${closeIconUrl}"></button>`;
        topArea.addEventListener("click", layerPopupClose);

        const viewArea = document.createElement("div");
        viewArea.setAttribute("class", "view-area");
        const viewContainer = document.createElement("div");
        viewContainer.setAttribute("class", "video-container");
        viewContainer.innerHTML = `<iframe src="${linkUrl}" width="auto" height="auto" allow="autoplay; fullscreen; camera; microphone; screen-wake-lock; encrypted-media; picture-in-picture;"></iframe>`;
        viewArea.appendChild(viewContainer);

        container.appendChild(topArea);
        container.appendChild(viewArea);

        layer.appendChild(container);

        document.body.appendChild(layer);
      } else {
        window.open(linkUrl);
      }
    }
    */
  });

  TFCLinkEnterQuery(world).forEach((eid: number) => {
    console.log("Enter TFC Link Component", eid);
    console.log(APP.getString(TFCLink.linkUrl[eid])!, TFCLink.layerPopup[eid]!);
  });

  TFCLinkExitQuery(world).forEach((eid: number) => {
    console.log("Exit TFC Link Component", eid);
  });
};
