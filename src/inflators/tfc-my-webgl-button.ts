import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMyWebGLButton, CursorRaycastable, RemoteHoverTarget, SingleActionButton, Holdable, HoldableButton } from "../bit-components";

export type TFCMyWebGLButtonParams = {
    action: string;
    content: string;
};

const DEFAULTS: Required<TFCMyWebGLButtonParams> = {
    action: "0",
    content: "https://webglmulti.web.app/Milling1/"
};

export function inflateTFCMyWebGLButton(world: HubsWorld, eid: number, params: TFCMyWebGLButtonParams) {
    console.log("inflating a MyButton Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<TFCMyWebGLButtonParams>;
    addComponent(world, TFCMyWebGLButton, eid);
    TFCMyWebGLButton.action[eid] = APP.getSid(requiredParams.action);
    TFCMyWebGLButton.content[eid] = APP.getSid(requiredParams.content);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);    
}