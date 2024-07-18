import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCNetworkedMediaData } from "../bit-components";

export type TFCNetworkedMediaDataParams = {
    type: string;
    url: string;
    control: string;
    info: string;
    clientId: string;
};

const DEFAULTS: Required<TFCNetworkedMediaDataParams> = {
    type: "",
    url: "",
    control: "",
    info: "",
    clientId: ""
};

export function inflateTFCNetworkedMediaData(world: HubsWorld, eid: number, params: TFCNetworkedMediaDataParams) {
  console.log("inflating a TFC Networked Media Data Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCNetworkedMediaDataParams>;
  addComponent(world, TFCNetworkedMediaData, eid);
  TFCNetworkedMediaData.type[eid] = APP.getSid(params.type);
  TFCNetworkedMediaData.url[eid] = APP.getSid(params.url);
  TFCNetworkedMediaData.control[eid] = APP.getSid(params.control);
  TFCNetworkedMediaData.info[eid] = APP.getSid(params.info);
  TFCNetworkedMediaData.clientId[eid] = APP.getSid(params.clientId);
}
