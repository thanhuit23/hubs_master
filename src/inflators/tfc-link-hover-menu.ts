import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCLinkHoverMenu, TFCLinkHoverMenuItem } from "../bit-components";

export type TFCLinkHoverMenuParams = {
    targetObjectRef: number;
    linkButtonRef: number;
};

const DEFAULTS: Required<TFCLinkHoverMenuParams> = {
    targetObjectRef: 0,
    linkButtonRef: 0
};

export function inflateTFCLinkHoverMenu(world: HubsWorld, eid: number, params: TFCLinkHoverMenuParams) {
  console.log("inflating a TFC Link Hover Menu Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCLinkHoverMenuParams>;
  addComponent(world, TFCLinkHoverMenu, eid);
  TFCLinkHoverMenu.targetObjectRef[eid] = params.targetObjectRef;
  TFCLinkHoverMenu.linkButtonRef[eid] = params.linkButtonRef;
}

export function inflateTFCLinkHoverMenuItem(world: HubsWorld, eid: number) {
  console.log("inflating a TFC Link Hover Menu Item Component ", {eid});
  addComponent(world, TFCLinkHoverMenuItem, eid);
}
