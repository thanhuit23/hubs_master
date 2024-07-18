import { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, hasComponent, Not, entityExists, addComponent, addEntity } from "bitecs";
import { Interacted, TFCMagicButton } from "../bit-components";
import { addObject3DComponent } from "../utils/jsx-entity";
import { anyEntityWith } from "../utils/bit-utils";
import { AnimationClip, Object3D } from "three";
import { findAncestorWithComponent } from "../utils/scene-graph";

const TFCMagicButtonQuery = defineQuery([TFCMagicButton]);
const TFCMagicButtonEnterQuery = enterQuery(TFCMagicButtonQuery);
const TFCMagicButtonExitQuery = exitQuery(TFCMagicButtonQuery);

const objectsInScene: THREE.Object3D[] = [];

function clicked(world: HubsWorld, entity: number) {
    return hasComponent(world, Interacted, entity);
}

export function TFCMagicButtonSystem(world: HubsWorld) {
    const myButtonEid = anyEntityWith(world, TFCMagicButton);
    if (myButtonEid !== null) {
        const entered = TFCMagicButtonEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            console.log('~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~');
            const entity = entered[i];
            const action = APP.getString(TFCMagicButton.action[entity]);
            console.log('TFCMagicButton action', action);
            const content = APP.getString(TFCMagicButton.content[entity])!;
            console.log('TFCMagicButton content', content);
            const myButton = world.eid2obj.get(entity);
            const buttonChildrent = myButton?.parent?.parent?.children!;
            let buttonImage = '';
            let buttonLink = '';
            let buttonText = '';
            if (buttonChildrent.length > 2) {
                for (let i = 0; i < buttonChildrent.length; i++) {
                    const buttonChild = buttonChildrent[i];
                    console.log(buttonChild.name);
                    // check buttonChild name contains "image", "link", "text" text


                    if (buttonChild.name.includes('image')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata 
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> image
                        buttonImage = buttonData.gltfExtensions.MOZ_hubs_components.image.src;
                        // console.log('buttonImage', buttonImage);
                        TFCMagicButton.buttonImage[entity] = APP.getSid(buttonImage);
                    }
                    if (buttonChild.name.includes('link')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> link
                        buttonLink = buttonData.gltfExtensions.MOZ_hubs_components.link.href;
                        // console.log('buttonLink', buttonLink);
                        TFCMagicButton.buttonLink[entity] = APP.getSid(buttonLink);
                    }
                    if (buttonChild.name.includes('text')) {
                        const buttonData = buttonChild.children[0].userData;
                        // Query the data inside the buttondata
                        // buttonData -> gltfExtension -> MOZ_hubs_components -> text
                        console.log(buttonData);
                        buttonText = buttonData.gltfExtensions.MOZ_hubs_components.text.value;
                        // console.log('buttonText', buttonText);
                        TFCMagicButton.buttonText[entity] = APP.getSid(buttonText);
                    }
                }
            }
        }
    }
}