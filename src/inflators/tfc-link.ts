import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
//import { TFCLink, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { TFCLink, CursorRaycastable, RemoteHoverTarget } from "../bit-components";

export type TFCLinkParams = {
    linkUrl: string;
    layerPopup: boolean;
};

const DEFAULTS: Required<TFCLinkParams> = {
    linkUrl: "",
    layerPopup: true
};

export function inflateTFCLink(world: HubsWorld, eid: number, params: TFCLinkParams) {
  console.log("inflating a TFC Link Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCLinkParams>;
  addComponent(world, TFCLink, eid);
  TFCLink.linkUrl[eid] = APP.getSid(params.linkUrl);
  TFCLink.layerPopup[eid] = params.layerPopup ? 1 : 0;

  addComponent(world, CursorRaycastable, eid); // Raycast
  addComponent(world, RemoteHoverTarget, eid); // Hover
  //addComponent(world, SingleActionButton, eid); // Click
}
