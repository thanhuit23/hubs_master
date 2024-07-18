import { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, Not, entityExists, addComponent, addEntity, removeComponent } from "bitecs";
import { Interacted, TFCMyWebGLButton, Holdable, HoldableButton, TFCNetworkedSyncButton, TFCNetworkedContentData } from "../bit-components";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight } from "../bit-components";

import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { anyEntityWith } from "../utils/bit-utils";
import { findAncestorWithComponent } from "../utils/scene-graph";
import { takeOwnership } from "../utils/take-ownership";


import UIRoot from "../react-components/ui-root";
import { createNetworkedEntity } from "../utils/create-networked-entity";
import SceneEntryManager from "../scene-entry-manager";

const TFCNetworkedSyncButtonQuery = defineQuery([TFCNetworkedSyncButton]);

const TFCMyWebGLButtonQuery = defineQuery([TFCMyWebGLButton]);
const TFCMyWebGLButtonEnterQuery = enterQuery(TFCMyWebGLButtonQuery);
const TFCMyWebGLButtonExitQuery = exitQuery(TFCMyWebGLButtonQuery);

let myThreeJSSyncButtonEid = -1;
let myThreeJSSyncButton: THREE.Mesh;
let currentSteps = 0;

const objectsInScene: THREE.Object3D[] = [];
const listCNCButton: THREE.Object3D[] = [];
const listCNCEid: number[] = [];

const clickedEntities: number[] = [];

function clicked(world: HubsWorld, entity: number) {
    return hasComponent(world, Interacted, entity);
}
const startTime = 0;
const endTime = 480 / 30;
let isPlaying = false;
let currentTime = 0;
let nextStepNumber = -1;
let screenObject = new THREE.Object3D();
const machineStartAudio = 'https://meta2.teacherville.co.kr/assets/rooms/audios/machine3.mp3'
const audioList = [
    ['https://meta2.teacherville.co.kr/assets/rooms/audios/D_1.mp3', 'https://meta2.teacherville.co.kr/assets/rooms/audios/D_2.mp3'],
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_3.mp3',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_4.mp3',
    '',
    '',
    '',
    '',
    '',
    '',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_5.mp3',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_6.mp3',
    machineStartAudio,
    ['https://meta2.teacherville.co.kr/assets/rooms/audios/D_7.mp3', 'https://meta2.teacherville.co.kr/assets/rooms/audios/D_8.mp3'],
    '',
    '',
    '',
    '',
    '',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_9.mp3',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_10.mp3',
    'https://meta2.teacherville.co.kr/assets/rooms/audios/D_11.mp3',
];


let currentAudio = new Audio(audioList[0][0]);
let isAudioPlaying = false;
function playAudioString(audioUrl: string) {
    currentAudio.pause();
    currentAudio = new Audio(audioUrl);
    currentAudio.play();
}
function playAudio(audioIndex: number) {
    const audio_url = audioList[audioIndex];
    // Check if audio_url is a list
    if (Array.isArray(audio_url)) {
        playAudioString(audio_url[0])
        // add callback when currentAudio is ended
        currentAudio.onended = function () {
            playAudioString(audio_url[1])
        }

    } else {
        if (audio_url === '') {
            return;
        }
        playAudioString(audio_url);

        const last_audio = audioList[audioList.length - 1];
        if (audioIndex === 20) {
            const machineAudio = new Audio(machineStartAudio);
            machineAudio.play();
            // currentAudio.onended = function () {
            //     if (!Array.isArray(last_audio)) {
            //         playAudioString(last_audio)
            //     }
            // }
        }
    }
}



function startStopAllAnimation(world: HubsWorld, entity: number, startOrStop: boolean) {
    const object = world.eid2obj.get(entity);
    const mixerEl = findAncestorWithComponent(object?.parent?.parent?.el, "animation-mixer");
    const { mixer, animations } = mixerEl.components["animation-mixer"];
    if (animations.length > 0) {
        for (let i = 0; i < animations.length; i++) {
            const clips = [animations[i]];
            console.log('clips', clips);
            for (let j = 0; j < clips.length; j++) {
                const clip = clips[j];
                if (!clip) {
                } else {
                    const action = mixer.clipAction(clip);
                    if (action) {
                        if (startOrStop) {
                            if (nextStepNumber > 11) {
                                action.time = 6.6666666;
                                action.paused = false;
                                console.log("Paused action", action);
                            } else {
                                action.enabled = true;
                                // action.time = 6.6666666;
                                action.setLoop(THREE.LoopOnce, 1);
                                action.clampWhenFinished = true;
                                action.play();
                                isPlaying = true;
                                console.log("Starting action", action);
                            }

                        } else {
                            if (nextStepNumber === 11) {
                                action.paused = true;
                                console.log("Paused action", action);

                            } else {
                                action.enabled = false;
                                action.stop();
                                console.log("Stopping action", action);
                                if (mixer !== null) {
                                    mixer.uncacheAction(action);
                                }
                            }

                        }
                    }
                }
            }
        }
    }
}


export function TFCMyWebGLButtonSystem(world: HubsWorld) {

    // if (window.APP.entryManager?.hasEntered) {
    //     // Bump stored entry count after 30s
    //     setTimeout(() => {
    //         if (isAudioPlaying === false) {
    //             playAudio(0);
    //             isAudioPlaying = true;
    //         }
    //     }, 3000);
    // }
    
    const myButtonEid = anyEntityWith(world, TFCMyWebGLButton);
    if (myButtonEid !== null) {
        if (window.APP.entryManager?.hasEntered) {
            // get url of the current scene
            const url = window.location.href;
            // check if the current url has engineer engineering3
            if (url.includes("engineering3")) {
                // play audio
                // Bump stored entry count after 30s
                setTimeout(() => {
                    if (isAudioPlaying === false) {
                        playAudio(0);
                        isAudioPlaying = true;
                    }
                }, 3000);
            }
        }
        if (isPlaying) {
            currentTime += 1;
            if (currentTime > endTime * 30) {
                currentTime = 0;
                startStopAllAnimation(world, myButtonEid, false);
                isPlaying = false;
                console.log("Animation is stopped");
                if (nextStepNumber === 11) {
                    const nextButtonEid = addEntity(world);
                    const nextButton = listCNCButton[nextStepNumber];
                    addObject3DComponent(world, nextButtonEid, nextButton);
                    world.scene.add(nextButton);

                    // currentSteps = nextStepNumber;
                    // const type = "control"!;
                    // const steps = currentSteps.toString();
                    // let networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
                    // if (networkedEid) {
                    //     takeOwnership(world, networkedEid);
                    //     TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    //     TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    //     TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                    //     TFCNetworkedContentData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                    // } else {
                    //     const nid = createNetworkedEntity(world, "tfc-networked-content-data", { type: type, steps: steps, control: "", clientId: NAF.clientId });
                    //     networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
                    //     TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    //     TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    //     TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                    // }
                }
            }
        }
        if (nextStepNumber === 2) {
            console.log("Enable screen");
            const screenObjectEid = addEntity(world);
            addObject3DComponent(world, screenObjectEid, screenObject);
            world.scene.add(screenObject);
        }
        const entered = TFCMyWebGLButtonEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            const entity = entered[i];
            console.log('TFCMyWebGLButton entered', entity);
            // Get the entity's TFCMyWebGLButton component
            const action = APP.getString(TFCMyWebGLButton.action[entity]);
            console.log('TFCMyWebGLButton action', action);
            const content = APP.getString(TFCMyWebGLButton.content[entity])!;
            console.log('TFCMyWebGLButton content', content);
            const myButton = world.eid2obj.get(entity);

            const buttonChildrent = myButton?.parent?.parent?.children!;
            let buttonImage = '';
            let buttonLink = '';
            let buttonText = '';
            TFCMyWebGLButton.buttonImage[entity] = APP.getSid(buttonImage);
            TFCMyWebGLButton.buttonLink[entity] = APP.getSid(buttonLink);
            TFCMyWebGLButton.buttonText[entity] = APP.getSid(buttonText);
            if (buttonChildrent.length > 2) {
                for (let i = 0; i < buttonChildrent.length; i++) {
                    const buttonChild = buttonChildrent[i];
                    console.log(buttonChild.name);
                    // check buttonChild name contains "image", "link", "text" text
                    if (buttonChild.name.toLowerCase().includes('image')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata 
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> image
                        console.log(buttonData);
                        buttonImage = buttonData.gltfExtensions.MOZ_hubs_components.image.src;
                        // console.log('buttonImage', buttonImage);
                        TFCMyWebGLButton.buttonImage[entity] = APP.getSid(buttonImage);
                    }
                    if (buttonChild.name.toLowerCase().includes('link')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> link
                        console.log(buttonData);
                        buttonLink = buttonData.gltfExtensions.MOZ_hubs_components.link.href;
                        // console.log('buttonLink', buttonLink);
                        TFCMyWebGLButton.buttonLink[entity] = APP.getSid(buttonLink);
                    }

                    if (buttonChild.name.toLowerCase().includes('text')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> text
                        console.log(buttonData);
                        buttonText = buttonData.gltfExtensions.MOZ_hubs_components.text.value;
                        // console.log('buttonText', buttonText);
                        TFCMyWebGLButton.buttonText[entity] = APP.getSid(buttonText);
                    }
                }
            }

            if (myButton) {
                // Check if "_" in button text
                if (buttonText.includes("_")) {
                    const newMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
                    (myButton.children[0] as THREE.Mesh).material = newMaterial;
                } else {
                    // myButton.visible = false;
                    const myButtonPosition = new THREE.Vector3();
                    myButton.getWorldPosition(myButtonPosition);

                    // Get the world rotation of myButton object
                    const myButtonRotation = new THREE.Quaternion();
                    myButton.getWorldQuaternion(myButtonRotation);

                    // Get the world scale of myButton object
                    const myButtonScale = new THREE.Vector3();
                    myButton.getWorldScale(myButtonScale);

                    const myMilling01ButtonEid = addEntity(world);

                    // Change the material of the button
                    const newMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });
                    (myButton.children[0] as THREE.Mesh).material = newMaterial;

                    let content_type = content.split("_")[0];
                    let background_img_src = 'https://meta1.teacherville.co.kr/files/397ed740-0a76-4302-99cd-8c7706b87403.jpg'
                    let btn_width = 1.6;
                    let btn_height = 0.4;
                    // Check button has "step" in content
                    if (action === '1') {
                        content_type = "btn";
                        btn_width = 0.09;
                        btn_height = 0.09;
                        if (buttonText === '20') {
                            content_type = "screen";
                            btn_width = 0.186;
                            btn_height = 0.14;
                        }
                    }

                    if (buttonImage !== '') {
                        background_img_src = buttonImage;
                    }

                    const myMilling01Button = createUIButton({
                        width: btn_width,
                        height: btn_height,
                        backgroundColor: background_img_src,
                        textColor: '#ffffff',
                        text: content_type,
                        fontSize: 16,
                        font: 'Arial',
                    });

                    myMilling01Button.position.copy(myButtonPosition);
                    if (action === '1') {
                        myMilling01Button.position.z += 0.001;
                    } else {
                        myMilling01Button.position.z += 0.01;
                    }
                    if (action === '1') {
                        if (buttonText === '0') {
                            const myMilling01ButtonEid = addEntity(world);
                            addObject3DComponent(world, myMilling01ButtonEid, myMilling01Button);
                            world.scene.add(myMilling01Button);
                        }
                    } else {
                        const myMilling01ButtonEid = addEntity(world);
                        addObject3DComponent(world, myMilling01ButtonEid, myMilling01Button);
                        world.scene.add(myMilling01Button);
                    }
                    if (action === '1') {
                        if (buttonText === '20') {
                            screenObject = myMilling01Button;
                        } else {
                            listCNCButton.push(myMilling01Button);
                            listCNCEid.push(myMilling01ButtonEid);
                        }
                    } else {
                        objectsInScene.push(myMilling01Button);
                    }

                    // myThreeJSSyncButtonEid = addEntity(world);
                    // myThreeJSSyncButton = createUIButton({
                    //     width: 1,
                    //     height: 1,
                    //     backgroundColor: '#007bff',
                    //     textColor: '#ffffff',
                    //     text: 'Sync ',
                    //     fontSize: 32,
                    //     font: 'Arial',
                    // });
                    // myThreeJSSyncButton.position.copy(myButtonPosition);
                    // myThreeJSSyncButton.position.x += 1.5;
                    // myThreeJSSyncButton.position.y += 0.5;

                    // addObject3DComponent(world, myThreeJSSyncButtonEid, myThreeJSSyncButton);
                    // addComponent(world, TFCNetworkedSyncButton, myThreeJSSyncButtonEid);
                    // TFCNetworkedSyncButton.type[myThreeJSSyncButtonEid] = APP.getSid("control");
                    // TFCNetworkedSyncButton.control[myThreeJSSyncButtonEid] = APP.getSid("control");
                    // TFCNetworkedSyncButton.steps[myThreeJSSyncButtonEid] = APP.getSid(currentSteps.toString());
                    // TFCNetworkedSyncButton.targetObjectRef[myThreeJSSyncButtonEid] = APP.getSid(myMilling01Button.uuid);
                    // addComponent(world, RemoteHoverTarget, myThreeJSSyncButtonEid);
                    // addComponent(world, CursorRaycastable, myThreeJSSyncButtonEid);
                    // addComponent(world, SingleActionButton, myThreeJSSyncButtonEid);
                    // myThreeJSSyncButton.scale.set(0.4, 0.4, 0.4);

                    // world.scene.add(myThreeJSSyncButton);
                    // objectsInScene.push(myThreeJSSyncButton);

                }
            }
        }
    }

    const exited = TFCMyWebGLButtonExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        const entity = exited[i];
        console.log('TFCMyWebGLButton exited', entity)

        for (let j = 0; j < objectsInScene.length; j++) {
            const object = objectsInScene[j];
            console.log("Removing object from scene: " + object.name);
            world.scene.remove(object);
        }
        objectsInScene.length = 0;
    }

    const entities = TFCMyWebGLButtonQuery(world);
    for (let i = 0; i < entities.length; i++) {
        // const entity = entities[i];
        // if (clicked(world, entity)) {
        //     const scene = AFRAME.scenes[0];
        //     console.log("My Button clicked", entity);
        //     const action = APP.getString(TFCMyWebGLButton.action[entity]);
        //     console.log('TFCMyWebGLButton action', action);
        //     const content = APP.getString(TFCMyWebGLButton.content[entity]);
        //     console.log('TFCMyWebGLButton content', content);
        //     // Get component UIRoot     
        //     // scene.emit("action_toggle_wegbl");
        //     clickedEntities.push(entity);
        //     addComponent(world, Holdable, entity);
        //     addComponent(world, HoldableButton, entity);
        // } else {
        //     if (clickedEntities.includes(entity)) {
        //         clickedEntities.splice(clickedEntities.indexOf(entity), 1);
        //         console.log("My Button released", entity);
        //         const scene = AFRAME.scenes[0];
        //         scene.emit("action_toggle_wegbl");
        //         removeComponent(world, Holdable, entity);
        //         removeComponent(world, HoldableButton, entity);


        //     }
        // }

        const entity = entities[i];
        let networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
        if (clicked(world, entity)) {
            const scene = AFRAME.scenes[0];
            console.log("My Button clicked", entity);
            const action = APP.getString(TFCMyWebGLButton.action[entity]);
            console.log('TFCMyWebGLButton action', action);
            const content = APP.getString(TFCMyWebGLButton.content[entity])!;
            console.log('TFCMyWebGLButton content', content);
            const buttonImage = APP.getString(TFCMyWebGLButton.buttonImage[entity]);
            console.log('TFCMyWebGLButton buttonImage', buttonImage);
            const buttonLink = APP.getString(TFCMyWebGLButton.buttonLink[entity])!;
            console.log('TFCMyWebGLButton buttonLink', buttonLink);
            const buttonText = APP.getString(TFCMyWebGLButton.buttonText[entity])!;
            console.log('TFCMyWebGLButton buttonText', buttonText);
            let myButton = world.eid2obj.get(entity)!;

            if (action === '1') {
                console.log("current step", TFCNetworkedContentData.steps[networkedEid]);
                const currentStep = buttonText;
                // convert currentStep to integer
                const currentStepNumber = parseInt(currentStep);
                console.log("current step number", currentStepNumber);
                world.scene.remove(listCNCButton[currentStepNumber]);
                myButton.visible = false;
                world.scene.remove(myButton);
                // listCNCButton.splice(currentStepNumber, 1);
                if (nextStepNumber !== -1 && nextStepNumber !== currentStepNumber) {
                    return;
                }
                nextStepNumber = currentStepNumber + 1;
                if (nextStepNumber === 11) {
                    console.log("All steps are completed");
                    startStopAllAnimation(world, entity, true);

                } else
                    if (nextStepNumber === 20) {
                        console.log("All steps are completed");
                        startStopAllAnimation(world, entity, true);
                    } else {
                        const nextButtonEid = addEntity(world);
                        const nextButton = listCNCButton[nextStepNumber];
                        addObject3DComponent(world, nextButtonEid, nextButton);
                        world.scene.add(nextButton);
                    }
                currentSteps = nextStepNumber;
                const type = "control"!;
                const steps = currentSteps.toString();
                if (networkedEid) {
                    takeOwnership(world, networkedEid);
                    TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                    TFCNetworkedContentData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                } else {
                    const nid = createNetworkedEntity(world, "tfc-networked-content-data", { type: type, steps: steps, control: "", clientId: NAF.clientId });
                    networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
                    TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                }
                // Stop all current audios                    
                playAudio(nextStepNumber);

            }
            if (action === '0') {
                const content_type = content.split("_")[0];
                const content_number = content.split("_")[1];
                let action_string = "action_toggle_" + content_type + "_" + content_number;
                if (buttonText !== "") {
                    action_string = "action_toggle_" + buttonText.split("_")[0].toLowerCase();
                }
                scene.emit(action_string, { url: buttonLink });

            }
        }
        if (networkedEid) {
            if (APP.getString(TFCNetworkedContentData.type[networkedEid]) != "" &&
                TFCNetworkedContentData.steps[networkedEid] !== -1) {
                if (TFCNetworkedContentData.steps[networkedEid] !== currentSteps) {
                    currentSteps = TFCNetworkedContentData.steps[networkedEid];
                    console.log("Syncing button", currentSteps);
                    // convert currentStep to integer
                    const currentStepNumber = currentSteps;
                    for (let i = 0; i < listCNCButton.length; i++) {
                        world.scene.remove(listCNCButton[i]);
                        const cncButton = world.eid2obj.get(entity)!;
                        cncButton.visible = false;
                        world.scene.remove(cncButton);
                    }

                    // world.scene.remove(listCNCButton[currentStepNumber - 1]);
                    // myButton.visible = false;
                    // listCNCButton.splice(currentStepNumber, 1);
                    nextStepNumber = currentStepNumber;
                    if (nextStepNumber === 11) {
                        console.log("All steps are completed");
                        startStopAllAnimation(world, entity, true);
                    } else
                        if (nextStepNumber === 20) {
                            console.log("All steps are completed");
                            startStopAllAnimation(world, entity, true);
                        } else {
                            const nextButtonEid = addEntity(world);
                            const nextButton = listCNCButton[nextStepNumber];
                            addObject3DComponent(world, nextButtonEid, nextButton);
                            world.scene.add(nextButton);
                        }
                    // currentSteps = nextStepNumber;
                } else {

                }
            }
        }
    }
}