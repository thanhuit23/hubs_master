import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCGatewayLink } from "../bit-components";

export type TFCGatewayLinkParams = {
  visible: boolean;
  linkUrl: string;
};

const DEFAULTS: Required<TFCGatewayLinkParams> = {
  visible: true,
  linkUrl: ""
};

export function inflateTFCGatewayLink(world: HubsWorld, eid: number, params: TFCGatewayLinkParams) {
  //console.log("inflating a TFC Gateway Link Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCGatewayLinkParams>;
  addComponent(world, TFCGatewayLink, eid);
  TFCGatewayLink.visible[eid] = params.visible ? 1 : 0;
  TFCGatewayLink.linkUrl[eid] = APP.getSid(params.linkUrl);
}
