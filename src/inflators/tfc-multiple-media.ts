import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMultipleMedia } from "../bit-components";

export type TFCMultipleMediaParams = {
  source: string;
};

const DEFAULTS: Required<TFCMultipleMediaParams> = {
  source: ""
};

export function inflateTFCMultipleMedia(world: HubsWorld, eid: number, params: TFCMultipleMediaParams) {
  console.log("inflating a TFC Multiple Media Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCMultipleMediaParams>;
  addComponent(world, TFCMultipleMedia, eid);
  TFCMultipleMedia.source[eid] = APP.getSid(params.source);
}
