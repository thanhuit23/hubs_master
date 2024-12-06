// Thanh add
import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { interactiveArea } from "../bit-components";

export type interactiveAreaParams = {
    triggerType: string;
    triggerTarget: string;
};

const DEFAULTS: Required<interactiveAreaParams> = {
    triggerTarget: "",
    triggerType: "",
};

export function inflateInteractiveArea(world: HubsWorld, eid: number, params: interactiveAreaParams) {
    console.log("inflating an interactive area Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<interactiveAreaParams>;
    addComponent(world, interactiveArea, eid);
    interactiveArea.triggerType[eid] = APP.getSid(requiredParams.triggerType);
    interactiveArea.triggerTarget[eid] = APP.getSid(requiredParams.triggerTarget);
    return eid;
}
