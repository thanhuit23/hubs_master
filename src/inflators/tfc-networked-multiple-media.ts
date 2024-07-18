import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCNetworkedMultipleMedia } from "../bit-components";

export type TFCNetworkedMultipleMediaParams = {
  source: string;
};

const DEFAULTS: Required<TFCNetworkedMultipleMediaParams> = {
  source: ""
};

export function inflateTFCNetworkedMultipleMedia(world: HubsWorld, eid: number, params: TFCNetworkedMultipleMediaParams) {
  console.log("inflating a TFC Networked Multiple Media Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCNetworkedMultipleMediaParams>;
  addComponent(world, TFCNetworkedMultipleMedia, eid);
  TFCNetworkedMultipleMedia.source[eid] = APP.getSid(params.source);
}
