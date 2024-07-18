// Thanh add
import { HubsWorld } from "../app";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addEntity
} from "bitecs";
import { AElement } from "aframe";
import { Interacted, TFCKeyboardButton } from "../bit-components";
import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { anyEntityWith } from "../utils/bit-utils";
import { MeshBasicMaterial } from "three";
import { findAncestorWithComponent } from "../utils/scene-graph";
import { isLocalHubsUrl, isHubsRoomUrl } from "../utils/media-url-utils";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";

import { changeHub } from "../change-hub";
import { array } from "prop-types";

const TFCKeyboardButtonQuery = defineQuery([TFCKeyboardButton]);
const TFCKeyboardButtonEnterQuery = enterQuery(TFCKeyboardButtonQuery);
const TFCKeyboardButtonExitQuery = exitQuery(TFCKeyboardButtonQuery);

let currentValue = "";
let objectsInScene: THREE.Object3D[] = [];
let listKeyboardButton: THREE.Object3D[] = [];
let resultValue = "";
let notificationParent: THREE.Object3D;
let notificationScreen: THREE.Object3D;
let lockIcon: THREE.Object3D;
let gateObject: THREE.Object3D;
let notificationTime = 0; // seconds
let notificationTimeLimit = 1; // seconds
let notificationScreenOn = false;
let gateWaySceneUrl = '';
// const gatewayMap = new Map();
const temp: Array<number> = []
let gatewayData = {
    gatewayInit: true, // 초기화 여부
    gatewayRangeList: temp, // 객체 영역 리스트
    gatewayInOut: false, // 아바타가 객체안에 있는지 여부
    linkUrl: ''
};
let correct = false;


function clicked(world: HubsWorld, entity: number): boolean {
    return hasComponent(world, Interacted, entity);
}

function startStopAllAnimation(world: HubsWorld, entity: number, startOrStop: boolean) {
    if (world === undefined) {
        return;
    }
    if (world.eid2obj === undefined) {
        return;
    }
    if (!world.eid2obj.has(entity)) {
        return;
    }
    const object = world.eid2obj.get(entity);
    if (!object) {
        return;
    }
    const mixerEl = findAncestorWithComponent(object?.parent?.parent?.el, "animation-mixer");
    if (!mixerEl) {
        return;
    }
    const { mixer, animations } = mixerEl.components["animation-mixer"];
    if (!mixer) {
        return;
    }
    if (animations.length > 0) {
        for (let i = 0; i < animations.length; i++) {
            const clips = [animations[i]];
            for (let j = 0; j < clips.length; j++) {
                const clip = clips[j];
                if (!clip) {
                } else {
                    const action = mixer.clipAction(clip);
                    if (action) {
                        if (startOrStop) {
                            action.enabled = true;
                            action.setLoop(THREE.LoopOnce, 1);
                            action.clampWhenFinished = true;
                            action.play();
                            console.log("Starting action", action);
                        } else {
                            action.stop();
                            console.log("Stopping action", action);
                        }
                    }
                }
            }
        }
    }
}

export function TFCKeyboardButtonSystem(world: HubsWorld) {
    const myButtonEid = anyEntityWith(world, TFCKeyboardButton);

    if (myButtonEid !== null) {
        if (notificationScreenOn) {
            notificationTime += 1;
            if (notificationTime >= notificationTimeLimit * 30) {
                notificationTime = 0;
                notificationScreenOn = false;
                world.scene.remove(notificationScreen);
            }
        } else {
            if (notificationScreen) {
                world.scene.remove(notificationScreen);
            }
        }

        const entered = TFCKeyboardButtonEnterQuery(world);

        entered.forEach((eid) => {
            const action = APP.getString(TFCKeyboardButton.action[eid]);
            const myButton = world.eid2obj.get(eid)!;
            const buttonChildrent = myButton?.parent?.parent?.children!;

            let buttonImage = '';
            let buttonLink = '';
            let buttonText = '';
            if (buttonChildrent.length > 2) {
                for (let i = 0; i < buttonChildrent.length; i++) {
                    const buttonChild = buttonChildrent[i];
                    if (buttonChild.children[0] === undefined) {
                        continue;
                    }

                    const buttonData = buttonChild.children[0].userData;

                    if (buttonChild.name.includes('image')) {
                        buttonImage = buttonData.gltfExtensions.MOZ_hubs_components.image.src;
                        TFCKeyboardButton.buttonImage[eid] = APP.getSid(buttonImage);
                    }
                    if (buttonChild.name.includes('link')) {
                        buttonLink = buttonData.gltfExtensions.MOZ_hubs_components.link.href;
                        TFCKeyboardButton.buttonLink[eid] = APP.getSid(buttonLink);
                    }
                    if (buttonChild.name.includes('text')) {
                        buttonText = buttonData.gltfExtensions.MOZ_hubs_components.text.value;
                        TFCKeyboardButton.buttonText[eid] = APP.getSid(buttonText);
                    }
                    if (buttonChild.name.includes('gate')) {
                        gateObject = buttonChild;
                    }
                }
            }

            if (myButton) {
                const myButtonPosition = new THREE.Vector3();
                myButton.getWorldPosition(myButtonPosition);

                // Get the world rotation of myButton object
                const myButtonRotation = new THREE.Quaternion();
                myButton.getWorldQuaternion(myButtonRotation);

                // Get the world scale of myButton object
                const myButtonScale = new THREE.Vector3();
                myButton.getWorldScale(myButtonScale);

                (myButton.children[0] as THREE.Mesh).material = new MeshBasicMaterial({ color: 0x00ff00, side: THREE.DoubleSide, transparent: true, opacity: 0.0 });

                let value = "0";
                let background_img_src = 'https://localhost:4000/files/3c0d1ba0-d65f-4e87-a157-045bd4a40116.png'
                let btn_width = 1.6;
                let btn_height = 0.4;
                let text_color = "#000000";
                let font_size = 14;

                if (action === '0' || action === '1' || action === '2') {// Number                
                    value = buttonText;
                    btn_width = 0.16;
                    btn_height = 0.16;
                    background_img_src = "#ffffff";
                }

                if (action === '3') {// Function
                    btn_width = 0.16;
                    btn_height = 0.16;
                    background_img_src = "#007AB8";
                    text_color = "#ffffff";
                    font_size = 16;
                    value = buttonText;
                    if (buttonText === 'enter') {
                        value = "⏎";
                    }
                    if (buttonText === 'clear') {
                        value = "C";
                    }
                    if (buttonText === 'del') {
                        value = "⌫";
                        font_size = 12;
                    }
                }

                if (action === '4') {// screen
                    btn_width = 0.68;
                    btn_height = 0.16;
                    background_img_src = "#ffffff";
                    value = '';
                    if (buttonText.includes('notification')) {
                        background_img_src = "#008000";
                        resultValue = buttonText.split('_')[1];
                        notificationParent = myButton;
                    }
                }

                if (action === '5') {
                    const gatewayObject = world.eid2obj.get(eid)!;
                    const gatewayObjectPosition = new THREE.Vector3();
                    gatewayObject.getWorldPosition(gatewayObjectPosition);
                    //console.log("Gateway Position", gatewayObjectPosition);

                    // 객체 크기
                    const gatewayObjectScale = new THREE.Vector3();
                    gatewayObject.getWorldScale(gatewayObjectScale);
                    //console.log("Gateway Scale)", gatewayObjectScale);

                    gatewayObject.visible = false;

                    // 객체 영역 리스트(left, right, top, bottom)
                    const gatewayRangeList: Array<number> = [];
                    gatewayRangeList.push(gatewayObjectPosition.x - ((gatewayObjectScale.x * 2) / 2)); // left
                    gatewayRangeList.push(gatewayObjectPosition.x + ((gatewayObjectScale.x * 2) / 2)); // right
                    gatewayRangeList.push(gatewayObjectPosition.z - ((gatewayObjectScale.z * 2) / 2)); // top
                    gatewayRangeList.push(gatewayObjectPosition.z + ((gatewayObjectScale.z * 2) / 2)); // bottom

                    gatewayData = {
                        gatewayInit: true, // 초기화 여부
                        gatewayRangeList: gatewayRangeList, // 객체 영역 리스트
                        gatewayInOut: false, // 아바타가 객체안에 있는지 여부
                        linkUrl: buttonLink
                    };
                    // gatewayMap.set(eid, gatewayData);
                    gateWaySceneUrl = buttonText;
                    value = "lock";
                    font_size = 20;
                    btn_width = 0.6;
                    btn_height = 0.4;
                    lockIcon = myButton;
                }

                if (!buttonText.includes('notification')) {
                    const myKeyboardButton = createUIButton({
                        width: btn_width,
                        height: btn_height,
                        backgroundColor: background_img_src,
                        textColor: text_color,
                        text: value,
                        fontSize: font_size,
                        font: "Arial"
                    });

                    myKeyboardButton.position.copy(myButtonPosition);

                    myKeyboardButton.position.z += action === '1' ? 0.001 : 0.01;
                    if (action === '5') {
                        myKeyboardButton.position.y += 1.8;
                        myKeyboardButton.position.z -= 0.13;
                        // myKeyboardButton.rotateY(Math.PI / 2);
                        lockIcon = myKeyboardButton;
                    } else {
                        // myKeyboardButton.rotateY(Math.PI / 2);
                    }
                    myKeyboardButton.quaternion.copy(myButtonRotation);
                    const myKeyboardButtonEid = addEntity(world);
                    addObject3DComponent(world, myKeyboardButtonEid, myKeyboardButton);
                    world.scene.add(myKeyboardButton);
                    if (action !== '5') {
                        listKeyboardButton.push(myKeyboardButton);
                    }
                    objectsInScene.push(myKeyboardButton);
                }
            }
        });
    }

    const exited = TFCKeyboardButtonExitQuery(world);
    exited.forEach((eid) => {
        objectsInScene.forEach(object => world.scene.remove(object));
        objectsInScene.length = 0;
        listKeyboardButton.forEach(object => world.scene.remove(object));
        listKeyboardButton.length = 0;
        // gatewayMap.delete(eid);
        currentValue = "";
        correct = false;
        console.log('Out the room');
        notificationScreenOn = false;

        currentValue = "";
        objectsInScene = [];
        listKeyboardButton = [];
        resultValue = "";
        world.scene.remove(notificationParent);
        world.scene.remove(notificationScreen);
        world.scene.remove(lockIcon);
        world.scene.remove(gateObject);
        notificationTime = 0; // seconds
        notificationTimeLimit = 1; // seconds
        notificationScreenOn = false;
        gateWaySceneUrl = '';
        correct = false;
        gatewayData = {
            gatewayInit: true, // 초기화 여부
            gatewayRangeList: temp, // 객체 영역 리스트
            gatewayInOut: false, // 아바타가 객체안에 있는지 여부
            linkUrl: ''
        };
    });

    const entities = TFCKeyboardButtonQuery(world);
    entities.forEach((eid) => {
        if (clicked(world, eid)) {
            const myButton = world.eid2obj.get(eid)!;
            const action = APP.getString(TFCKeyboardButton.action[eid]);
            const value = APP.getString(TFCKeyboardButton.value[eid])!;
            const buttonImage = APP.getString(TFCKeyboardButton.buttonImage[eid]);
            const buttonLink = APP.getString(TFCKeyboardButton.buttonLink[eid])!;
            const buttonText = APP.getString(TFCKeyboardButton.buttonText[eid])!;
            // Merge the value to the current value
            if (action === '0') { // Number
                if (currentValue.length >= 5) {
                    createNotificationScreen(world, '5자 이내 입력.')
                    return;
                }
                currentValue += buttonText;
                updateScreen(world);
            } else if (action === '1') { // Character
                if (currentValue.length >= 5) {
                    createNotificationScreen(world, '5자 이내 입력.')
                    return;
                }
                currentValue += buttonText;
                updateScreen(world);
            } else if (action === '2') { // Operator
                switch (buttonText) {
                    case '&plus;':
                        currentValue += '+';
                        break;
                    case '&minus;':
                        currentValue += '-';
                        break;
                    case '&times;':
                        currentValue += '*';
                        break;
                    case '&divide;':
                        currentValue += '/';
                        break;
                    case '&equals;':
                        currentValue += '=';
                        break;
                    case '&ne;':
                        currentValue += '!=';
                        break;
                    case '&lt;':
                        currentValue += '<';
                        break;
                    case '&gt;':
                        currentValue += '>';
                        break;
                    case '&le;':
                        currentValue += '<=';
                        break;
                    case '&ge;':
                        currentValue += '>=';
                        break;
                    case '&infin;':
                        currentValue += 'Infinity';
                        break;
                    case '&pi;':
                        currentValue += 'Math.PI';
                        break;
                    case '&radic;':
                        currentValue += 'Math.sqrt';
                        break;
                    case '&perp;':
                        currentValue += 'Math.pow';
                        break;
                    case '&ang;':
                        currentValue += 'angle';
                        break;
                    case '&deg;':
                        currentValue += 'degree';
                        break;
                }
            } else if (action === '3') { // Function
                switch (buttonText) {
                    case 'del':
                        // Remove the last character
                        currentValue = currentValue.substring(0, currentValue.length - 1);
                        updateScreen(world);
                        break;
                    case 'clear':
                        currentValue = '';
                        updateScreen(world);
                        break;
                    case 'enter':
                        if (currentValue.trim() === resultValue.trim()) {
                            createNotificationScreen(world, "정답입니다.")
                            correct = true;
                            if (lockIcon) {
                                world.scene.remove(lockIcon);
                                startStopAllAnimation(world, eid, true);

                            }
                        } else {
                            createNotificationScreen(world, "오답입니다.")
                            correct = false;
                        }
                }
            }

        }

        // const gatewayData = gatewayMap.get(eid)!;
        if (gatewayData != null && correct) {
            if (gatewayData.gatewayInit) {
                const avatarPov = (document.querySelector("#avatar-pov-node")! as AElement).object3D;
                const avatarPos = new THREE.Vector3();
                avatarPov.getWorldPosition(avatarPos);
                //console.log("Gateway avatarPov : ", avatarPos);

                let inOut: boolean = false;
                if (gatewayData.gatewayRangeList[0] <= avatarPos.x && avatarPos.x <= gatewayData.gatewayRangeList[1]) {
                    if (gatewayData.gatewayRangeList[2] <= avatarPos.z && avatarPos.z <= gatewayData.gatewayRangeList[3]) {
                        inOut = true;
                        //console.log("in", avatarPos.x, avatarPos.z, gatewayRangeList[0], gatewayRangeList[1], gatewayRangeList[2], gatewayRangeList[3]);
                    }
                }

                if (gatewayData.gatewayInOut != inOut) {
                    gatewayData.gatewayInOut = inOut;
                    // gatewayMap.set(eid, gatewayData);
                    //console.log("Gateway State(In:true/Out:false)", gatewayInOut);
                    if (gatewayData.gatewayInOut) {
                        changeRoom(gatewayData.linkUrl);
                    }
                }
            }
        }
    });

}

function updateScreen(world: HubsWorld) {
    // Get the last object from listKeyboardButton
    const lastObject = listKeyboardButton[listKeyboardButton.length - 1];
    const lastObjectPosition = lastObject.position;
    // Remove the last object from the scene
    world.scene.remove(lastObject);
    // Remove the last object from the list
    listKeyboardButton.pop();
    const btn_width = 0.68;
    const btn_height = 0.16;
    const background_img_src = "#ffffff";
    const value = currentValue;

    const myKeyboardButton = createUIButton({
        width: btn_width,
        height: btn_height,
        backgroundColor: background_img_src,
        textColor: '#000000',
        text: value,
        fontSize: 14,
        font: "Arial"
    });

    myKeyboardButton.position.copy(lastObjectPosition);

    myKeyboardButton.position.z += 0.001;
    // myKeyboardButton.rotateY(Math.PI / 2);
    myKeyboardButton.quaternion.copy(lastObject.quaternion);
    const myKeyboardButtonEid = addEntity(world);
    addObject3DComponent(world, myKeyboardButtonEid, myKeyboardButton);
    world.scene.add(myKeyboardButton);
    listKeyboardButton.push(myKeyboardButton);
}

function createNotificationScreen(world: HubsWorld, content: string) {
    if (notificationScreen) {
        world.scene.remove(notificationScreen);
    }
    const btn_width = 0.68;
    const btn_height = 0.16;
    const background_img_src = "#008000";
    const value = content;
    notificationScreen = createUIButton({
        width: btn_width,
        height: btn_height,
        backgroundColor: background_img_src,
        textColor: '#ffffff',
        text: value,
        fontSize: 9,
        font: "Arial"
    });

    const myButtonPosition = new THREE.Vector3();
    notificationParent.getWorldPosition(myButtonPosition);

    // Get the world rotation of myButton object
    const myButtonRotation = new THREE.Quaternion();
    notificationParent.getWorldQuaternion(myButtonRotation);

    // Get the world scale of myButton object
    const myButtonScale = new THREE.Vector3();
    notificationParent.getWorldScale(myButtonScale);

    notificationScreen.position.copy(myButtonPosition);
    notificationScreen.position.z += 0.01;
    notificationScreen.quaternion.copy(myButtonRotation);
    // notificationScreen.rotateY(Math.PI / 2);
    world.scene.add(notificationScreen);
    notificationScreenOn = true;
    notificationTime = 0;
}

async function changeRoom(linkUrl: string) {
    linkUrl = gateWaySceneUrl;
    if (linkUrl == null || linkUrl == undefined) {
        return;
    }

    
    // Clear the current room
    const currnetHubId = await isHubsRoomUrl(window.location.href);
    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => { }, true);

    changeHub('Mission02');
    let gotoHubId;
    if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
        const url = new URL(linkUrl);
        if (currnetHubId === gotoHubId && url.hash) {
            window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
        } else if (await isLocalHubsUrl(linkUrl)) {
            let waypoint = "";
            if (url.hash) {
                waypoint = url.hash.substring(1);
                console.log("Waypoint", waypoint);
                changeHub(gotoHubId, true, waypoint);
            } else {
                changeHub(gotoHubId);
            }
        } else {
            await exitImmersive();
            location.href = linkUrl;
        }
    }
}