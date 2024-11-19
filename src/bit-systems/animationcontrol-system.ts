import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { anyEntityWith } from "../hubs";
import { Interacted, animationControl, animationControlPlayUI, animationControlLoopUI, animationControlStopUI } from "../bit-components";
import { addObject3DComponent } from "../utils/jsx-entity";
import { findAncestorWithComponent } from "../utils/scene-graph";
import { createUIButton } from "../tfl-libs/tfl-button";

const animationcontrolQuery = defineQuery([animationControl]);
const animationcontrolEnterQuery = enterQuery(animationcontrolQuery);
const animationcontrolExitQuery = exitQuery(animationcontrolQuery);

const animationControlPlayUIQuery = defineQuery([animationControlPlayUI]);
const animationControlPlayUIExitQuery = exitQuery(animationControlPlayUIQuery);

const animationControlLoopUIQuery = defineQuery([animationControlLoopUI]);
const animationControlLoopUIExitQuery = exitQuery(animationControlLoopUIQuery);

const animationControlStopUIQuery = defineQuery([animationControlStopUI]);
const animationControlStopUIExitQuery = exitQuery(animationControlStopUIQuery);



// let controlMesh = new THREE.Mesh();
function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

function playAnimation(world: HubsWorld, parentEid: number, animationName: String, animationType: String): void {
    const parentObject = world.eid2obj.get(parentEid);

    if (!parentObject) {
        return;
    }
    const mixerEl = findAncestorWithComponent(parentObject?.parent?.parent?.el, "animation-mixer");

    if (!mixerEl) {
        return;
    }

    const { mixer, animations } = mixerEl.components["animation-mixer"];

    if (!mixer) {
        return;
    }

    if (!animations) {
        return;
    }

    for (let i = 0; i < animations.length; i++) {
        if (animations[i].name === animationName) {
            const action = mixer.clipAction(animations[i]);
            if (animationType === "Play") {
                action.reset();
                action.setLoop(THREE.LoopOnce, 1);
                // action.clampWhenFinished = true;
                action.play();
                // return;
            }
            if (animationType === "Stop") {
                action.stop();
                // return;
            }
            if (animationType === "Play Loop") {
                action.reset();
                action.setLoop(THREE.LoopRepeat, Infinity);
                // action.clampWhenFinished = true;
                action.play();
                // return;
            }
        }
    }

}

export function animationcontrolSystem(world: HubsWorld) {
    const myanimationcontrolEid = anyEntityWith(world, animationControl);
    if (myanimationcontrolEid === null) {
        return;
    }

    const entered = animationcontrolEnterQuery(world);

    for (let i = 0; i < entered.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = entered[i];
        const controlObject = world.eid2obj.get(entity);
        const animationName = APP.getString(animationControl.animationName[entity]);
        console.log('entered', { entity, animationName });
        if (controlObject) {
            const controlPosition = new THREE.Vector3();
            controlObject.getWorldPosition(controlPosition);
            const controlRotation = new THREE.Quaternion();
            controlObject.getWorldQuaternion(controlRotation);
            const controlScale = new THREE.Vector3();
            controlObject.getWorldScale(controlScale);

            controlObject.visible = true;

            let btn_width = 0.6;
            let btn_height = 0.4;
            let text_color = "#000000";
            let bg_color = "#ffffff";
            let font_size = 16;
            let playButtonText = "Play";
            let font = "Arial";

            const playButtonEid = addEntity(world);
            const playButton = createUIButton({
                width: btn_width,
                height: btn_height,
                backgroundColor: bg_color,
                textColor: text_color,
                text: playButtonText,
                fontSize: font_size,
                font: font,
            });

            playButton.position.copy(controlPosition);
            playButton.position.x -= 0.7;
            playButton.quaternion.copy(controlRotation);

            addObject3DComponent(world, playButtonEid, playButton);
            addComponent(world, animationControlPlayUI, playButtonEid);
            animationControlPlayUI.animationName[playButtonEid] = APP.getSid(animationName ? animationName : "");
            animationControlPlayUI.parentNode[playButtonEid] = entity;
            // Add mouse events to the mesh
            addComponent(world, CursorRaycastable, playButtonEid); // Raycast
            addComponent(world, RemoteHoverTarget, playButtonEid); // Hover
            addComponent(world, SingleActionButton, playButtonEid); // Click
            world.scene.add(playButton);

            const playLoopButtonEid = addEntity(world);
            const playLoopText = "Loop";
            const playLoopButton = createUIButton({
                width: btn_width,
                height: btn_height,
                backgroundColor: bg_color,
                textColor: text_color,
                text: playLoopText,
                fontSize: font_size,
                font: font,
            });

            playLoopButton.position.copy(controlPosition);
            playLoopButton.position.x += 0.7;
            playLoopButton.quaternion.copy(controlRotation);

            addObject3DComponent(world, playLoopButtonEid, playLoopButton);
            addComponent(world, animationControlLoopUI, playLoopButtonEid);
            animationControlLoopUI.animationName[playLoopButtonEid] = APP.getSid(animationName ? animationName : "");
            animationControlLoopUI.parentNode[playLoopButtonEid] = entity;
            // Add mouse events to the mesh
            addComponent(world, CursorRaycastable, playLoopButtonEid); // Raycast
            addComponent(world, RemoteHoverTarget, playLoopButtonEid); // Hover
            addComponent(world, SingleActionButton, playLoopButtonEid); // Click
            world.scene.add(playLoopButton);

            const stopButtonEid = addEntity(world);
            const stopText = "Stop";
            const stopButton = createUIButton({
                width: btn_width,
                height: btn_height,
                backgroundColor: bg_color,
                textColor: text_color,
                text: stopText,
                fontSize: font_size,
                font: font,
            });

            stopButton.position.copy(controlPosition);
            stopButton.quaternion.copy(controlRotation);

            addObject3DComponent(world, stopButtonEid, stopButton);
            addComponent(world, animationControlStopUI, stopButtonEid);
            animationControlStopUI.animationName[stopButtonEid] = APP.getSid(animationName ? animationName : "");
            animationControlStopUI.parentNode[stopButtonEid] = entity;
            // Add mouse events to the mesh
            addComponent(world, CursorRaycastable, stopButtonEid); // Raycast
            addComponent(world, RemoteHoverTarget, stopButtonEid); // Hover
            addComponent(world, SingleActionButton, stopButtonEid); // Click
            world.scene.add(stopButton);
        }

    }

    const exited = animationcontrolExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exited[i];
        const controlObject = world.eid2obj.get(entity);

        const animationName = APP.getString(animationControl.animationName[entity]);
        console.log('exited', { entity, animationName });
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const entities = animationcontrolQuery(world);

    for (let i = 0; i < entities.length; i++) {
        const networkedEid = anyEntityWith(world, animationControl)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControl.animationName[networkedEid]);
            if (clicked(world, networkedEid)) {
                console.log('clicked', { networkedEid, animationName });
            }
        }
    }

    const entitiesUIPlay = animationControlPlayUIQuery(world);
    for (let i = 0; i < entitiesUIPlay.length; i++) {
        const networkedEid = anyEntityWith(world, animationControlPlayUI)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControlPlayUI.animationName[networkedEid]);
            const parentEid = animationControlPlayUI.parentNode[networkedEid];
            if (clicked(world, networkedEid)) {
                if (animationName && animationName !== "") {
                    playAnimation(world, parentEid, animationName ? animationName : "", "Play");
                }
            }
        }
    }

    const exitedUIPlay = animationControlPlayUIExitQuery(world);
    for (let i = 0; i < exitedUIPlay.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exitedUIPlay[i];
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const entitiesUILoop = animationControlLoopUIQuery(world);
    for (let i = 0; i < entitiesUILoop.length; i++) {
        const networkedEid = anyEntityWith(world, animationControlLoopUI)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControlLoopUI.animationName[networkedEid]);
            const parentEid = animationControlLoopUI.parentNode[networkedEid];
            if (clicked(world, networkedEid)) {
                if (animationName && animationName !== "") {
                    playAnimation(world, parentEid, animationName ? animationName : "", "Play Loop");
                }
            }
        }
    }
    const exitedUILoop = animationControlLoopUIExitQuery(world);
    for (let i = 0; i < exitedUILoop.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exitedUILoop[i];
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }

    const entitiesUIStop = animationControlStopUIQuery(world);
    for (let i = 0; i < entitiesUIStop.length; i++) {
        const networkedEid = anyEntityWith(world, animationControlStopUI)!;
        if (networkedEid) {
            const animationName = APP.getString(animationControlStopUI.animationName[networkedEid]);
            const parentEid = animationControlStopUI.parentNode[networkedEid];
            if (clicked(world, networkedEid)) {
                if (animationName && animationName !== "") {
                    playAnimation(world, parentEid, animationName ? animationName : "", "Stop");
                }
            }
        }
    }

    const exitedUIStop = animationControlStopUIExitQuery(world);
    for (let i = 0; i < exitedUIStop.length; i++) {
        console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
        const entity = exitedUIStop[i];
        const controlObject = world.eid2obj.get(entity);
        if (controlObject) {
            world.scene.remove(controlObject);
        }
    }
}