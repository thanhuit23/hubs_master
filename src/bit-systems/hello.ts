import { Hello, Interacted } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity } from "bitecs";
import type { EntityID } from "../utils/networking-types";
import { CylinderGeometry, MeshBasicMaterial, WireframeGeometry, LineSegments, LineBasicMaterial, Mesh, Group, DoubleSide, Vector3 } from "three";
import * as THREE from 'three';
import { addObject3DComponent } from "../utils/jsx-entity";

function clicked(world: HubsWorld, eid: EntityID) {
  return hasComponent(world, Interacted, eid);
}

const helloQuery = defineQuery([Hello]);
const helloEnterQuery = enterQuery(helloQuery);
const helloExitQuery = exitQuery(helloQuery);

let cylinderEid = 0;

export function helloSystem(world: HubsWorld) {
  helloQuery(world).forEach(eid => {
    if (clicked(world, eid)) {
      console.log("Hello Component was clicked", eid);
      alert(APP.getString(Hello.message[eid]));
    }

    const obj = world.eid2obj.get(cylinderEid)!;
    if (obj) {
      obj.rotation.x += Hello.rotationX[eid];
      obj.rotation.y += Hello.rotationY[eid];
      obj.rotation.z += Hello.rotationZ[eid];
      obj.matrixNeedsUpdate = true;
    }
  });

  helloEnterQuery(world).forEach(eid => {
    console.log("Enter Hello Component", eid);

    // 기존 객체 위치
    const obj = world.eid2obj.get(eid)!;
    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    //console.log("eid position", obj.position, pos);
    //obj.visible = false;

    // 원기둥 그룹
    const cylinder1Group = new THREE.Group();

    // 원기둥
    const newEid1 = addEntity(world);
    //console.log("new eid", newEid);

    const cylinderGeometry = new THREE.CylinderGeometry(1, 1, 3, 8, 3);
    const cylinder1Material = new THREE.MeshBasicMaterial({color: 0x156289, side: THREE.DoubleSide});
    const cylinder1 = new THREE.Mesh(cylinderGeometry, cylinder1Material);
    //cylinder1.position.set(obj.position.x + 5, obj.position.y + 3, obj.position.z);
    //cylinder1.position.copy(obj.position);
    addObject3DComponent(world, newEid1, cylinder1);
    //world.scene.add(cylinder1);
    cylinder1Group.add(cylinder1);

    // 와이어프레임
    const newEid2 = addEntity(world);
    const cylinderWireframeGeometry = new THREE.WireframeGeometry(cylinderGeometry);
    const cylinderLineMaterial = new THREE.LineBasicMaterial({color: 0xffffff, transparent: true, opacity: 0.5});
    const cylinder1WireframeLine = new THREE.LineSegments(cylinderWireframeGeometry, cylinderLineMaterial);
    //cylinder1WireframeLine.position.copy(cylinder1.position);
    addObject3DComponent(world, newEid2, cylinder1WireframeLine);
    //world.scene.add(sphere1WireframeLine);
    cylinder1Group.add(cylinder1WireframeLine);

    // 원기둥 그룹 위치 조정
    cylinder1Group.position.set(pos.x, pos.y + 3, pos.z);

    // 원기둥 그룹 추가
    cylinderEid = addEntity(world);
    addObject3DComponent(world, cylinderEid, cylinder1Group);

    world.scene.add(cylinder1Group);
  });

  helloExitQuery(world).forEach(eid => {
    console.log("Exit Hello Component", eid);
  });
};
