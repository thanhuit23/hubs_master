import { TFCLink, Interacted, HoveredRemoteRight, TFCLinkHoverMenu, TFCLinkHoverMenuItem } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, hasComponent, entityExists } from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";
import type { EntityID } from "../utils/networking-types";

import "../components/custom-style.css";

function clicked(world: HubsWorld, eid: EntityID) {
    return hasComponent(world, Interacted, eid);
  }

const hoveredQuery = defineQuery([HoveredRemoteRight, TFCLink]);
const hoveredEnterQuery = enterQuery(hoveredQuery);
const hoveredMenuItemQuery = defineQuery([HoveredRemoteRight, TFCLinkHoverMenuItem]);

function layerPopupClose() {
    var layerpopup = document.getElementById("tfcLayerPopup")!;
    layerpopup.remove();
}

export function TFCLinkHoverMenuSystem(world: HubsWorld) {
    const menuEid = anyEntityWith(world, TFCLinkHoverMenu)!;
    //console.log("Enter TFC Link Over Menu Eid", menuEid);
    const menuObject = world.eid2obj.get(menuEid)!;
    //console.log("Enter TFC Link Over Menu Object", menuObject);

    if (menuObject != null) {
    hoveredEnterQuery(world).forEach((eid: number) => {
        console.log("Enter TFC Link Over Menu", eid);
        //console.log("TFCLink linkUrl : ", APP.getString(TFCLink.linkUrl[eid])!);

        TFCLinkHoverMenu.targetObjectRef[menuEid] = eid;
        const targetObject = world.eid2obj.get(eid)!;
        targetObject.add(menuObject);
    });

    const hovered = hoveredQuery(world).length > 0 || hoveredMenuItemQuery(world).length > 0;

    if (hovered) {
        menuObject.visible = true;
        const buttonObj = world.eid2obj.get(TFCLinkHoverMenu.linkButtonRef[menuEid])!;
        buttonObj.visible = true;
    } else {
        menuObject.visible = false;
        const buttonObj = world.eid2obj.get(TFCLinkHoverMenu.linkButtonRef[menuEid])!;
        buttonObj.visible = false;
        if (menuObject.parent !== null) {
            menuObject.parent.remove(menuObject);
        }
        TFCLinkHoverMenu.targetObjectRef[menuEid] = 0;
    }

    if (clicked(world, TFCLinkHoverMenu.linkButtonRef[menuEid])) {
        console.log("TFC Link over menu was clicked", menuEid);
        const linkEid = TFCLinkHoverMenu.targetObjectRef[menuEid];
        if (entityExists(world, linkEid)) {
            console.log("TFCLink linkUrl : ", APP.getString(TFCLink.linkUrl[linkEid])!);
            const linkUrl = APP.getString(TFCLink.linkUrl[linkEid])!;
            const layerPopup = TFCLink.layerPopup[linkEid]!;
            if (layerPopup) {
                const layer = document.createElement("div");
                layer.setAttribute("class", "tfc-layer-pop");
                layer.setAttribute("id", "tfcLayerPopup");

                const container = document.createElement("div");
                container.setAttribute("class", "pop-container");

                const topArea = document.createElement("div");
                topArea.setAttribute("class", "top-area");
                topArea.innerHTML = `<button type="button">X</button>`;
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
    }
    }
};
