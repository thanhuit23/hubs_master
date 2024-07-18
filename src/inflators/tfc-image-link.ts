import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCImageLink } from "../bit-components";

export type TFCImageLinkParams = {
    imageUrl: string;
    linkUrl: string;
    layerPopup: boolean;
};

const DEFAULTS: Required<TFCImageLinkParams> = {
  imageUrl: "",
  linkUrl: "",
  layerPopup: false
};

export function inflateTFCImageLink(world: HubsWorld, eid: number, params: TFCImageLinkParams) {
  console.log("inflating a TFC Image Link Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCImageLinkParams>;
  addComponent(world, TFCImageLink, eid);
  TFCImageLink.imageUrl[eid] = APP.getSid(params.imageUrl);
  TFCImageLink.linkUrl[eid] = APP.getSid(params.linkUrl);
  TFCImageLink.layerPopup[eid] = params.layerPopup ? 1 : 0;
}
