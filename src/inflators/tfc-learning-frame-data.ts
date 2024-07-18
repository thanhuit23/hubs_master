import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCNetworkedLearningFrameData } from "../bit-components";

export type TFCNetworkedLearningFrameDataParams = {
    type: string;
    url: string;
    control: string;
    info: string;
    clientId: string;
};

const DEFAULTS: Required<TFCNetworkedLearningFrameDataParams> = {
    type: "",
    url: "",
    control: "",
    info: "",
    clientId: ""
};

export function inflateTFCNetworkedLearningFrameData(world: HubsWorld, eid: number, params: TFCNetworkedLearningFrameDataParams) {
  console.log("inflating a TFC Networked Learning Frame Data Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCNetworkedLearningFrameDataParams>;
  addComponent(world, TFCNetworkedLearningFrameData, eid);
  TFCNetworkedLearningFrameData.type[eid] = APP.getSid(params.type);
  TFCNetworkedLearningFrameData.url[eid] = APP.getSid(params.url);
  TFCNetworkedLearningFrameData.control[eid] = APP.getSid(params.control);
  TFCNetworkedLearningFrameData.info[eid] = APP.getSid(params.info);
  TFCNetworkedLearningFrameData.clientId[eid] = APP.getSid(params.clientId);
}

