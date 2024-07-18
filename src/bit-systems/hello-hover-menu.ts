import { Hello, Interacted, HoveredRemoteRight, TFCMultipleHoverMenu, TFCMultipleHoverMenuItem } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, hasComponent } from "bitecs";
import { anyEntityWith } from "../utils/bit-utils";
import type { EntityID } from "../utils/networking-types";

function clicked(world: HubsWorld, eid: EntityID) {
  return hasComponent(world, Interacted, eid);
}

const hoveredQuery = defineQuery([HoveredRemoteRight, Hello]);
const hoveredEnterQuery = enterQuery(hoveredQuery);
const hoveredMenuItemQuery = defineQuery([HoveredRemoteRight, TFCMultipleHoverMenuItem]);

export function helloHoverMenuSystem(world: HubsWorld) {
  const menuEid = anyEntityWith(world, TFCMultipleHoverMenu)!;
  const menuObject = world.eid2obj.get(menuEid)!;
  if (menuObject != null) {
  hoveredEnterQuery(world).forEach((eid: number) => {
    console.log("Enter Hello Over Menu", eid);
    TFCMultipleHoverMenu.targetObjectRef[menuEid] = eid;
    const targetObject = world.eid2obj.get(eid)!;
    targetObject.add(menuObject);
  });

  const hovered = hoveredQuery(world).length > 0 || hoveredMenuItemQuery(world).length > 0;

  if (hovered) {
      menuObject.visible = true;
      const button1Obj = world.eid2obj.get(TFCMultipleHoverMenu.button1Ref[menuEid])!;
      button1Obj.visible = true;
      const button2Obj = world.eid2obj.get(TFCMultipleHoverMenu.button2Ref[menuEid])!;
      button2Obj.visible = true;
      const button3Obj = world.eid2obj.get(TFCMultipleHoverMenu.button3Ref[menuEid])!;
      button3Obj.visible = true;
      const button4Obj = world.eid2obj.get(TFCMultipleHoverMenu.button4Ref[menuEid])!;
      button4Obj.visible = true;
      const button5Obj = world.eid2obj.get(TFCMultipleHoverMenu.button5Ref[menuEid])!;
      button5Obj.visible = true;
      const button6Obj = world.eid2obj.get(TFCMultipleHoverMenu.button6Ref[menuEid])!;
      button6Obj.visible = true;
  } else {
      menuObject.visible = false;
      const button1Obj = world.eid2obj.get(TFCMultipleHoverMenu.button1Ref[menuEid])!;
      button1Obj.visible = false;
      const button2Obj = world.eid2obj.get(TFCMultipleHoverMenu.button2Ref[menuEid])!;
      button2Obj.visible = false;
      const button3Obj = world.eid2obj.get(TFCMultipleHoverMenu.button3Ref[menuEid])!;
      button3Obj.visible = false;
      const button4Obj = world.eid2obj.get(TFCMultipleHoverMenu.button4Ref[menuEid])!;
      button4Obj.visible = false;
      const button5Obj = world.eid2obj.get(TFCMultipleHoverMenu.button5Ref[menuEid])!;
      button5Obj.visible = false;
      const button6Obj = world.eid2obj.get(TFCMultipleHoverMenu.button6Ref[menuEid])!;
      button6Obj.visible = false;
      if (menuObject.parent !== null) {
          menuObject.parent.remove(menuObject);
      }
      TFCMultipleHoverMenu.targetObjectRef[menuEid] = 0;
  }

  if (clicked(world, TFCMultipleHoverMenu.button1Ref[menuEid])) {
    console.log("TFC over multiple menu 1 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationX[buttonEid] += 0.01;
    console.log("Hello.rotationX[buttonEid]", Hello.rotationX[buttonEid]);
  }

  if (clicked(world, TFCMultipleHoverMenu.button2Ref[menuEid])) {
    console.log("TFC over multiple menu 2 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationX[buttonEid] -= 0.01;
    console.log("Hello.rotationX[buttonEid]", Hello.rotationX[buttonEid]);
  }

  if (clicked(world, TFCMultipleHoverMenu.button3Ref[menuEid])) {
    console.log("TFC over multiple menu 3 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationY[buttonEid] += 0.01;
    console.log("Hello.rotationY[buttonEid]", Hello.rotationY[buttonEid]);
  }

  if (clicked(world, TFCMultipleHoverMenu.button4Ref[menuEid])) {
    console.log("TFC over multiple menu 4 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationY[buttonEid] -= 0.01;
    console.log("Hello.rotationY[buttonEid]", Hello.rotationY[buttonEid]);
  }

  if (clicked(world, TFCMultipleHoverMenu.button5Ref[menuEid])) {
    console.log("TFC over multiple menu 5 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationZ[buttonEid] += 0.01;
    console.log("Hello.rotationZ[buttonEid]", Hello.rotationZ[buttonEid]);
  }

  if (clicked(world, TFCMultipleHoverMenu.button6Ref[menuEid])) {
    console.log("TFC over multiple menu 6 was clicked", menuEid);
    const buttonEid = TFCMultipleHoverMenu.targetObjectRef[menuEid];
    Hello.rotationZ[buttonEid] -= 0.01;
    console.log("Hello.rotationZ[buttonEid]", Hello.rotationZ[buttonEid]);
  }
  }
};
