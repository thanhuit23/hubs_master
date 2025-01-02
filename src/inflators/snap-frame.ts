import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { snapFrame, CursorRaycastable,  RemoteHoverTarget, SingleActionButton  } from "../bit-components";

export type snapFrameParams = {
    snap_condition: string;
    snap_condition_data: string;
    snap_action: string;
    snap_data: string;
};

const DEFAULTS: Required<snapFrameParams> = {
    snap_condition: "",
    snap_condition_data: "",
    snap_action: "",
    snap_data: ""
};

export function inflateSnapFrame(world: HubsWorld, eid: number, params: snapFrameParams) {
    console.log("inflating an animationcontrol Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<snapFrameParams>;
    addComponent(world, snapFrame, eid);
    snapFrame.snapCondition[eid] = APP.getSid(requiredParams.snap_condition);
    snapFrame.snapConditionData[eid] = APP.getSid(requiredParams.snap_condition_data);
    snapFrame.snapAction[eid] = APP.getSid(requiredParams.snap_action);
    snapFrame.snapData[eid] = APP.getSid(requiredParams.snap_data);
    
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}
