import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCLearningFrame } from "../bit-components";

export type TFCLearningFrameParams = {
  source: string;
};

const DEFAULTS: Required<TFCLearningFrameParams> = {
  source: ""
};

export function inflateTFCLearningFrame(world: HubsWorld, eid: number, params: TFCLearningFrameParams) {
  //console.log("inflating a TFC Learning Frame Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCLearningFrameParams>;
  addComponent(world, TFCLearningFrame, eid);
  TFCLearningFrame.source[eid] = APP.getSid(params.source);
}

