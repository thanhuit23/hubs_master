import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMultipleMediaVideo } from "../bit-components";

export type TFCMultipleMediaVideoParams = {
    source: string;
};

const DEFAULTS: Required<TFCMultipleMediaVideoParams> = {
  source: ""
};

export function inflateTFCMultipleMediaVideo(world: HubsWorld, eid: number, params: TFCMultipleMediaVideoParams) {
  console.log("inflating a TFC Multiple Media Video Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCMultipleMediaVideoParams>;
  addComponent(world, TFCMultipleMediaVideo, eid);
  TFCMultipleMediaVideo.source[eid] = APP.getSid(params.source);
}
