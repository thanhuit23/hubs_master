import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { Hello, CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";

export type HelloParams = {
  message: string;
  rotationX: number;
  rotationY: number;
  rotationZ: number;
};

const DEFAULTS: Required<HelloParams> = {
  message: 'hello!',
  rotationX: 0.01,
  rotationY: 0.01,
  rotationZ: 0.01
};

export function inflateHello(world: HubsWorld, eid: number, params: HelloParams) {
  console.log("inflating a Hello Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<HelloParams>;
  addComponent(world, Hello, eid);
  Hello.message[eid] = APP.getSid(params.message);
  Hello.rotationX[eid] = params.rotationX;
  Hello.rotationY[eid] = params.rotationY;
  Hello.rotationZ[eid] = params.rotationZ;

  addComponent(world, CursorRaycastable, eid); // Raycast
  addComponent(world, RemoteHoverTarget, eid); // Hover
  addComponent(world, SingleActionButton, eid); // Click
}
