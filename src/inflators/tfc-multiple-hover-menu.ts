import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMultipleHoverMenu, TFCMultipleHoverMenuItem } from "../bit-components";

export type TFCMultipleHoverMenuParams = {
    targetObjectRef: number;
    button1Ref: number;
    button2Ref: number;
    button3Ref: number;
    button4Ref: number;
    button5Ref: number;
    button6Ref: number;
};

const DEFAULTS: Required<TFCMultipleHoverMenuParams> = {
    targetObjectRef: 0,
    button1Ref: 0,
    button2Ref: 0,
    button3Ref: 0,
    button4Ref: 0,
    button5Ref: 0,
    button6Ref: 0
};

export function inflateTFCMultipleHoverMenu(world: HubsWorld, eid: number, params: TFCMultipleHoverMenuParams) {
  console.log("inflating a TFC Multiple Hover Menu Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCMultipleHoverMenuParams>;
  addComponent(world, TFCMultipleHoverMenu, eid);
  TFCMultipleHoverMenu.targetObjectRef[eid] = params.targetObjectRef;
  TFCMultipleHoverMenu.button1Ref[eid] = params.button1Ref;
  TFCMultipleHoverMenu.button2Ref[eid] = params.button2Ref;
  TFCMultipleHoverMenu.button3Ref[eid] = params.button3Ref;
  TFCMultipleHoverMenu.button4Ref[eid] = params.button4Ref;
  TFCMultipleHoverMenu.button5Ref[eid] = params.button5Ref;
  TFCMultipleHoverMenu.button6Ref[eid] = params.button6Ref;
}

export function inflateTFCMultipleHoverMenuItem(world: HubsWorld, eid: number) {
  console.log("inflating a TFC Multiple Hover Menu Item Component ", {eid});
  addComponent(world, TFCMultipleHoverMenuItem, eid);
}
