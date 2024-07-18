import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMagicButton, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";

export type TFCMagicButtonParams = {
    action: string;
    content: string;
};

const DEFAULTS: Required<TFCMagicButtonParams> = {
    action: "0",
    content: "https://webglmulti.web.app/Milling1/"
};

export function inflateTFCMagicButton(world: HubsWorld, eid: number, params: TFCMagicButtonParams) {
    console.log("inflating a MyButton Component ", { eid, params });
    const requiredParams = Object.assign({}, DEFAULTS, params) as Required<TFCMagicButtonParams>;
    addComponent(world, TFCMagicButton, eid);
    TFCMagicButton.action[eid] = APP.getSid(requiredParams.action);
    TFCMagicButton.content[eid] = APP.getSid(requiredParams.content);
    addComponent(world, CursorRaycastable, eid);
    addComponent(world, RemoteHoverTarget, eid);
    addComponent(world, SingleActionButton, eid);
}