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

function playAnimation(world: HubsWorld, parentEid: number, animationName: string, animationType: string, targetClassName: string): void {
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

    if (!targetClassName || targetClassName === "") {
        return;
    }    

    if (!animationName || animationName === "") {
        return;
    }

    if (!animationType || animationType === "") {
        return;
    }

    // Try to start the animation on the robot object instead of all the objects
    const targetObject = document.getElementsByClassName(targetClassName)[0];
    if (!targetObject) {
        return;
    }
    // Get all clip names from the loop-animation component on the robot object
    const targetObjectLoopAnimation = findAncestorWithComponent(targetObject, "loop-animation");
    const targetObjectLoopAnimationComponent = targetObjectLoopAnimation.components["loop-animation"];
    if (!targetObjectLoopAnimationComponent) {
        return;
    }
    const clipNames = targetObjectLoopAnimationComponent.data.allClipNames;
    if (!clipNames) {
        return;
    }
    const clipIndices = targetObjectLoopAnimationComponent.data.allClipIndices;
    if (!clipIndices) {
        return;
    }
    // Index of the animation to play
    let animationIndex = -1;
    for (let i = 0; i < clipNames.length; i++) {
        if (clipNames[i] === animationName) {
            animationIndex = i;
            break;
        }
    }
    if (animationIndex === -1) {
        return;
    }
    const clipAction = mixer.clipAction(animations[clipIndices[animationIndex]]);

    if (animationType === "Play") {
        clipAction.reset();
        clipAction.setLoop(THREE.LoopOnce, 1);
        clipAction.play();
    }
    if (animationType === "Stop") {
        clipAction.stop();
    }
    if (animationType === "Play Loop") {
        clipAction.reset();
        clipAction.setLoop(THREE.LoopRepeat, Infinity);
        clipAction.play();
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
        const animationTarget = APP.getString(animationControl.animationTarget[entity]);
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
            playButton.quaternion.copy(controlRotation);
            playButton.scale.copy(controlScale);

            addObject3DComponent(world, playButtonEid, playButton);
            addComponent(world, animationControlPlayUI, playButtonEid);
            animationControlPlayUI.animationName[playButtonEid] = APP.getSid(animationName ? animationName : "");
            animationControlPlayUI.animationTarget[playButtonEid] = APP.getSid(animationTarget ? animationTarget.replace('.', '') : "");
            animationControlPlayUI.animationType[playButtonEid] = APP.getSid("Play");
            animationControlPlayUI.parentNode[playButtonEid] = entity;
            // Add mouse events to the mesh
            addComponent(world, CursorRaycastable, playButtonEid); // Raycast
            addComponent(world, RemoteHoverTarget, playButtonEid); // Hover
            addComponent(world, SingleActionButton, playButtonEid); // Click
            world.scene.add(playButton);
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
        // Get the entity with the animation control component using entitiesUIPlay[i]
        // const networkedEid = anyEntityWith(world, animationControlPlayUI)!;
        const networkedEid = entitiesUIPlay[i];
        if (networkedEid) {
            const animationName = APP.getString(animationControlPlayUI.animationName[networkedEid]);
            const animationTarget = APP.getString(animationControlPlayUI.animationTarget[networkedEid]);
            const animationType = APP.getString(animationControlPlayUI.animationType[networkedEid]);
            const parentEid = animationControlPlayUI.parentNode[networkedEid];
            if (clicked(world, networkedEid)) {
                if (animationName && animationName !== "") {
                    playAnimation(world, parentEid, animationName ? animationName : "", animationType ? animationType : "", animationTarget ? animationTarget : "");
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
}