import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCGateway } from "../bit-components";

export type TFCGatewayParams = {
  linkUrl: string;
};

const DEFAULTS: Required<TFCGatewayParams> = {
  linkUrl: ""
};

export function inflateTFCGateway(world: HubsWorld, eid: number, params: TFCGatewayParams) {
  //console.log("inflating a TFC Gateway Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCGatewayParams>;
  addComponent(world, TFCGateway, eid);
  TFCGateway.linkUrl[eid] = APP.getSid(params.linkUrl);
}

