// Thanh create
import { HubsWorld } from "../app";
import { TFCMyThreeJS, TFCMyThreeJSButton, TFCNetworkedContentData, TFCNetworkedSyncButton, TFCMYThreeJSSliderBar } from "../bit-components";
import { Interacted, CursorRaycastable, RemoteHoverTarget, SingleActionButton, HoveredRemoteRight } from "../bit-components";
import { defineQuery, enterQuery, exitQuery, hasComponent, addEntity, addComponent } from "bitecs";
import { paths } from "../systems/userinput/paths";
import { addObject3DComponent } from "../utils/jsx-entity";
import { anyEntityWith } from "../utils/bit-utils";
import { createNetworkedEntity } from "../utils/create-networked-entity";
import { takeOwnership } from "../utils/take-ownership";
import type { EntityID } from "../utils/networking-types";
import { createMyThreeJSTrans01 } from "../tfl-libs/tfl-trans-01";
import { createMyThreeJSTrans06 } from "../tfl-libs/tlf-trans-06";
import { createMyThreeJSCons01 } from "../tfl-libs/tfl-cons-01";
import { createUIButton } from "../tfl-libs/tfl-button";
import { drawBox as create3DBox } from "../tfl-libs/tfl-geo";
import { Mesh, MathUtils, Object3D, Plane, Ray, Vector3 } from "three";
import { createUISlider } from "../tfl-libs/tfl-slider-bar";



function clicked(world: HubsWorld, eid: EntityID) {
    return hasComponent(world, Interacted, eid);
}

const TFCMyThreeJSQuery = defineQuery([TFCMyThreeJS]);
const TFCMyThreeJSEnterQuery = enterQuery(TFCMyThreeJSQuery);
const TFCMyThreeJSExitQuery = exitQuery(TFCMyThreeJSQuery);

const TFCMyThreeJSButtonQuery = defineQuery([TFCMyThreeJSButton]);

const TFCNetworkedSyncButtonQuery = defineQuery([TFCNetworkedSyncButton]);

const TFCMYThreeJSSliderBarQuery = defineQuery([TFCMYThreeJSSliderBar]);
const TFCMyThreeJSSliderBarHoveredQuery = defineQuery([HoveredRemoteRight, TFCMYThreeJSSliderBar]);
const TFCMyThreeJSSliderBarHoveredEnterQuery = enterQuery(TFCMyThreeJSSliderBarHoveredQuery);
const TFCMyThreeJSSliderBarHoveredExitQuery = exitQuery(TFCMyThreeJSSliderBarHoveredQuery);

let networkClientId: string = "";
let category: string = "";
let unit: string = "";
let myThreeJSNextButtonEid = -1;
let myThreeJSBackButtonEid = -1;
let myThreeJSSyncButtonEid = -1;
let myThreeJSContentEid = -1;

let objectPosition = new THREE.Vector3();
let objectRotation = new THREE.Quaternion();
let objectScale = new THREE.Vector3();
let currentSteps = 36;
let myThreeJSSyncButton: THREE.Mesh;
let contentObjectRef: number = 0;
const objectsInScene: THREE.Object3D[] = [];
let myThreeJSObject = new THREE.Group();
let myThreeJSProgressBar = new THREE.Mesh();
let myThreeJSNextButton = new THREE.Mesh();
let myThreeJSBackButton = new THREE.Mesh();
let maxSteps = 100;
let increaseSteps = 1;
let clickedOnSlider = false;
const progressBarWidth = 5;
let sliderPadding = 4;
let initSteps = 0;

export function TFCMyThreeJSSystem(world: HubsWorld, userinput: any) {
    const myThreeJSEid = anyEntityWith(world, TFCMyThreeJS);
    if (myThreeJSEid !== null) {

        const entered = TFCMyThreeJSEnterQuery(world);
        for (let i = 0; i < entered.length; i++) {
            if (clickedOnSlider) {
                clickedOnSlider = false;
            }
            const eid = entered[i];
            console.log("My ThreeJS entered", eid);
            category = APP.getString(TFCMyThreeJS.category[eid])!;
            unit = APP.getString(TFCMyThreeJS.unit[eid])!;
            console.log("Category: ", category);
            console.log("Unit: ", unit);
            const myThreeJS = world.eid2obj.get(eid);
            // if myThreeJS is not a networked entity, create a networked entity        
            if (myThreeJS) {
                // create a position, rotation, and scale component
                // then copy the position, rotation, and scale from myThreeJS to the components
                const myThreeJSPosition = new THREE.Vector3();
                myThreeJS.getWorldPosition(myThreeJSPosition);
                objectPosition = myThreeJSPosition;
                const myThreeJSRotation = new THREE.Quaternion();
                myThreeJS.getWorldQuaternion(myThreeJSRotation);
                objectRotation = myThreeJSRotation;
                const myThreeJSScale = new THREE.Vector3();
                myThreeJS.getWorldScale(myThreeJSScale);
                objectScale = myThreeJSScale;
                myThreeJS.visible = false;

                const myThreeJSContentEid = addEntity(world);

                let outputSteps = 0;
                if (category === "Transformation") {
                    currentSteps = 0;
                    const myThreeJSProps = {
                        category: category,
                        unit: 6,
                        position: myThreeJSPosition,
                        rotation: myThreeJSRotation,
                        scale: myThreeJSScale,
                        steps: currentSteps
                    }
                    if (unit === "1") {
                        [myThreeJSObject, outputSteps] = createMyThreeJSTrans01(myThreeJSProps);
                        myThreeJSObject.position.x += 0.7;
                        myThreeJSObject.position.z -= 0.1;
                        myThreeJSObject.position.y += 1.3;
                        myThreeJSObject.rotation.z += 1.57;
                        myThreeJSObject.scale.set(0.3, 0.3, 0.3);
                    }
                    if (unit === "6") {
                        [myThreeJSObject, outputSteps] = createMyThreeJSTrans06(myThreeJSProps);
                    }
                    increaseSteps = 1;
                    maxSteps = 37;
                    sliderPadding = 2

                } else if (category === "Geometry") {
                    // convert unit to number
                    const unitNumber = parseInt(unit);
                    const myThreeJSModel3DProps = {
                        type: unitNumber,
                        angle: 0,
                        position: myThreeJSPosition,
                        rotation: myThreeJSRotation,
                        scale: myThreeJSScale
                    };
                    [myThreeJSObject, maxSteps] = create3DBox(myThreeJSModel3DProps); // Create a 3D box object
                    myThreeJSObject.position.copy(myThreeJSPosition);
                    myThreeJSObject.position.x -= 1;
                    currentSteps = 0;
                    increaseSteps = 5;
                } else if (category === "Construction") {
                    sliderPadding = 0;
                    currentSteps = 4;
                    initSteps = 4;
                    const myThreeJSModel3DProps = {
                        position: myThreeJSPosition,
                        steps: currentSteps
                    };
                    // Create a construction object
                    [myThreeJSObject, outputSteps, maxSteps] = createMyThreeJSCons01(myThreeJSModel3DProps.position, myThreeJSModel3DProps.steps);
                    currentSteps = 4;
                    increaseSteps = 1;
                    
                }

                addObject3DComponent(world, myThreeJSContentEid, myThreeJSObject);
                contentObjectRef = myThreeJSContentEid;
                world.scene.add(myThreeJSObject);
                objectsInScene.push(myThreeJSObject);


                myThreeJSNextButtonEid = addEntity(world);
                myThreeJSNextButton = createUIButton({
                    width: 2,
                    height: 1,
                    backgroundColor: '#007bff',
                    textColor: '#ffffff',
                    text: 'Next',
                    fontSize: 32,
                    font: 'Arial',
                });
                myThreeJSNextButton.position.copy(myThreeJSPosition);
                myThreeJSNextButton.position.x += 3;
                myThreeJSNextButton.position.y -= 0.5;

                addObject3DComponent(world, myThreeJSNextButtonEid, myThreeJSNextButton);
                addComponent(world, TFCMyThreeJSButton, myThreeJSNextButtonEid);
                TFCMyThreeJSButton.name[myThreeJSNextButtonEid] = APP.getSid("Next");
                TFCMyThreeJSButton.targetObjectRef[myThreeJSNextButtonEid] = myThreeJSContentEid;
                addComponent(world, RemoteHoverTarget, myThreeJSNextButtonEid);
                addComponent(world, CursorRaycastable, myThreeJSNextButtonEid);
                addComponent(world, SingleActionButton, myThreeJSNextButtonEid);
                myThreeJSNextButton.scale.set(0.4, 0.4, 0.4);
                world.scene.add(myThreeJSNextButton);
                objectsInScene.push(myThreeJSNextButton);


                myThreeJSBackButtonEid = addEntity(world);
                myThreeJSBackButton = createUIButton({
                    width: 2,
                    height: 1,
                    backgroundColor: '#007bff',
                    textColor: '#ffffff',
                    text: 'Back',
                    fontSize: 32,
                    font: 'Arial',
                });
                myThreeJSBackButton.position.copy(myThreeJSPosition);
                myThreeJSBackButton.position.x += 2;
                myThreeJSBackButton.position.y -= 0.5;

                addObject3DComponent(world, myThreeJSBackButtonEid, myThreeJSBackButton);
                addComponent(world, TFCMyThreeJSButton, myThreeJSBackButtonEid);
                TFCMyThreeJSButton.name[myThreeJSBackButtonEid] = APP.getSid("Back");
                TFCMyThreeJSButton.targetObjectRef[myThreeJSBackButtonEid] = myThreeJSContentEid;
                addComponent(world, RemoteHoverTarget, myThreeJSBackButtonEid);
                addComponent(world, CursorRaycastable, myThreeJSBackButtonEid);
                addComponent(world, SingleActionButton, myThreeJSBackButtonEid);
                myThreeJSBackButton.scale.set(0.4, 0.4, 0.4);

                world.scene.add(myThreeJSBackButton);
                objectsInScene.push(myThreeJSBackButton);


                myThreeJSSyncButtonEid = addEntity(world);
                const syncButtonText = 'Sync ' + category + ' - ' + unit;
                myThreeJSSyncButton = createUIButton({
                    width: 2,
                    height: 1,
                    backgroundColor: '#007bff',
                    textColor: '#ffffff',
                    text: 'Sync ',
                    fontSize: 32,
                    font: 'Arial',
                });
                myThreeJSSyncButton.position.copy(myThreeJSPosition);
                myThreeJSSyncButton.position.x += 2.5;
                myThreeJSSyncButton.position.y += 0.5;

                addObject3DComponent(world, myThreeJSSyncButtonEid, myThreeJSSyncButton);
                addComponent(world, TFCNetworkedSyncButton, myThreeJSSyncButtonEid);
                TFCNetworkedSyncButton.type[myThreeJSSyncButtonEid] = APP.getSid("control");
                TFCNetworkedSyncButton.control[myThreeJSSyncButtonEid] = APP.getSid("control");
                TFCNetworkedSyncButton.steps[myThreeJSSyncButtonEid] = APP.getSid(currentSteps.toString());
                TFCNetworkedSyncButton.targetObjectRef[myThreeJSSyncButtonEid] = myThreeJSContentEid;
                addComponent(world, RemoteHoverTarget, myThreeJSSyncButtonEid);
                addComponent(world, CursorRaycastable, myThreeJSSyncButtonEid);
                addComponent(world, SingleActionButton, myThreeJSSyncButtonEid);
                myThreeJSSyncButton.scale.set(0.4, 0.4, 0.4);

                world.scene.add(myThreeJSSyncButton);
                objectsInScene.push(myThreeJSSyncButton);


                // const myThreeJSBannerButtonEid = addEntity(world);
                // const bannerText = "Category: " + category + " - " + unit;
                // const myThreeJSBannerButton = createUIButton({
                //     width: 5,
                //     height: 1,
                //     backgroundColor: '#007bff',
                //     textColor: '#ffffff',
                //     text: bannerText,
                //     fontSize: 32,
                //     font: 'Arial',
                // });
                // myThreeJSBannerButton.position.copy(myThreeJSPosition);
                // myThreeJSBannerButton.position.x += 2.5;
                // myThreeJSBannerButton.position.y += 1;
                // addObject3DComponent(world, myThreeJSBannerButtonEid, myThreeJSBannerButton);
                // myThreeJSBannerButton.scale.set(0.4, 0.4, 0.4);

                // world.scene.add(myThreeJSBannerButton);
                // objectsInScene.push(myThreeJSBannerButton);

                // Create a progress bar
                const myThreeJSProgressBarEid = addEntity(world);
                myThreeJSProgressBar = createUISlider({
                    width: progressBarWidth,
                    height: 0.5,
                    currentSteps: currentSteps,
                    minSteps: -(sliderPadding / 2),
                    maxSteps: (maxSteps + sliderPadding / 2),
                });
                // Set the position of the progress bar
                myThreeJSProgressBar.position.copy(myThreeJSPosition);
                myThreeJSProgressBar.position.x += 4;
                // myThreeJSProgressBar.position.y += 1.5;

                // Add the progress bar object to the world
                addObject3DComponent(world, myThreeJSProgressBarEid, myThreeJSProgressBar);
                // Add the TFCMYThreeJSSliderBar component to the progress bar entity
                addComponent(world, TFCMYThreeJSSliderBar, myThreeJSProgressBarEid);
                // Set the name of the progress bar entity
                TFCMYThreeJSSliderBar.name[myThreeJSProgressBarEid] = APP.getSid("SliderBar");
                // Set the target object reference of the progress bar entity
                TFCMYThreeJSSliderBar.targetObjectRef[myThreeJSProgressBarEid] = myThreeJSContentEid;
                // Add the RemoteHoverTarget component to the progress bar entity
                addComponent(world, RemoteHoverTarget, myThreeJSProgressBarEid);
                // Add the CursorRaycastable component to the progress bar entity
                addComponent(world, CursorRaycastable, myThreeJSProgressBarEid);
                // Add the SingleActionButton component to the progress bar entity
                addComponent(world, SingleActionButton, myThreeJSProgressBarEid);
                // Add the progress bar to the scene
                world.scene.add(myThreeJSProgressBar);
                // Add the progress bar to the objects in scene array
                objectsInScene.push(myThreeJSProgressBar);
            }
        }
    }

    const exited = TFCMyThreeJSExitQuery(world);
    for (let i = 0; i < exited.length; i++) {
        if (clickedOnSlider) {
            clickedOnSlider = false;
        }
        const eid = exited[i];
        console.log("My ThreeJS exited", eid);
        for (let i = 0; i < objectsInScene.length; i++) {
            console.log("Removing object from scene: " + objectsInScene[i].name);
            world.scene.remove(objectsInScene[i]);
        }
        world.scene.remove(myThreeJSObject);
        world.scene.remove(myThreeJSNextButton);
        world.scene.remove(myThreeJSBackButton);
        world.scene.remove(myThreeJSSyncButton);
        world.scene.remove(myThreeJSProgressBar);
        objectsInScene.length = 0;
        const networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
        if (networkedEid) {
            if (APP.getString(TFCNetworkedContentData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedContentData.clientId[networkedEid]) == NAF.clientId) {
                    TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.clientId[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.steps[networkedEid] = 4;
                }
            }
        }
        networkClientId = "";
        category = "";
        unit = "";
        myThreeJSNextButtonEid = -1;
        myThreeJSBackButtonEid = -1;
        myThreeJSSyncButtonEid = -1;
        myThreeJSContentEid = -1;
        objectPosition = new THREE.Vector3();
        objectRotation = new THREE.Quaternion();
        objectScale = new THREE.Vector3();
        currentSteps = initSteps;

        contentObjectRef = 0;
        myThreeJSObject = new THREE.Group();
        myThreeJSProgressBar = new THREE.Mesh();
        myThreeJSNextButton = new THREE.Mesh();
        myThreeJSBackButton = new THREE.Mesh();
        myThreeJSSyncButton: THREE.Mesh;
        maxSteps = 100;
        increaseSteps = 1;
        clickedOnSlider = false;
        sliderPadding = 4;
    }

    const query = TFCMyThreeJSQuery(world);
    for (let i = 0; i < query.length; i++) {
        const eid = query[i];
        if (clicked(world, eid)) {
            if (clickedOnSlider) {
                clickedOnSlider = false;
            }
            console.log("My ThreeJS clicked", eid);
        }
    }

    // Handle the case when the cursor hovers over the slider bar
    TFCMyThreeJSSliderBarHoveredQuery(world).forEach((eid: number) => {
        const networkedEid = anyEntityWith(world, TFCNetworkedContentData)!; // Get the networked entity ID
        // Check if the networked entity exists
        if (networkedEid) {
            // Check if the slider bar is clicked
            if (clickedOnSlider) {
                // Set clickedOnSlider flag to false
                const progressBar = world.eid2obj.get(eid);

                // Get the position and direction of the cursor from user input
                const { position, direction } = userinput.get(paths.actions.cursor.right.pose);

                // Create a plane and a ray for intersection calculation
                const plane = new Plane();
                const ray = new Ray();
                ray.set(position, direction);

                // Set the normal and constant values of the plane
                plane.normal.set(0, 0, 1);
                plane.constant = 0;

                // Apply the world matrix of the progressBar to the plane
                if (progressBar) {
                    plane.applyMatrix4(progressBar.matrixWorld);
                }

                // Calculate the intersection point between the ray and the plane
                let intersectionPoint = new Vector3();
                ray.intersectPlane(plane, intersectionPoint);

                // Check if the intersection point is valid
                if (intersectionPoint) {
                    // Set clickedOnSlider flag to true
                    clickedOnSlider = true;

                    let sliderPercent = 0;
                    if (progressBar) {
                        // Calculate the percentage of the slider based on the intersection point
                        sliderPercent = (intersectionPoint.x - (progressBar.position.x - progressBarWidth / 2)) / 5
                    }
                    // Round the slider percentage to 2 decimal places
                    const roundedSliderPercent = Math.round(sliderPercent * (maxSteps + sliderPadding)) - sliderPadding / 2;

                    // Check if the rounded slider percentage is equal to the current steps
                    if (roundedSliderPercent == currentSteps) {
                        return; // Exit the function if the slider percentage hasn't changed
                    }

                    if (progressBar) {
                        world.scene.remove(progressBar); // Remove the old progress bar from the scene
                    }

                    // Update the currentSteps variable with the roundedSliderPercent value
                    currentSteps = roundedSliderPercent;
                    // Call the update function with the myThreeJSObject and networkedEid parameters
                    update(myThreeJSObject, networkedEid);

                }
            }
        }
    });

    TFCMyThreeJSSliderBarHoveredEnterQuery(world).forEach((eid: number) => {
        // clickedOnSlider = true;
    });

    TFCMyThreeJSSliderBarHoveredExitQuery(world).forEach((eid: number) => {
        // clickedOnSlider = false;
    });

    TFCMYThreeJSSliderBarQuery(world).forEach(eid => {
        const networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
        if (networkedEid) {
            if (clicked(world, eid)) {
                if (clickedOnSlider) {
                    clickedOnSlider = false;
                    return;
                }
                console.log("My ThreeJS Slider Bar clicked", eid); // Print the ID of the clicked slider bar for debugging purposes
                const targetObjectRef = TFCMYThreeJSSliderBar.targetObjectRef[eid]; // Get the reference to the target object associated with the slider bar
                const targetObject = world.eid2obj.get(targetObjectRef); // Get the actual target object from the reference
                const buttonName = APP.getString(TFCMYThreeJSSliderBar.name[eid]); // Get the name of the slider bar button
                let buttonClicked = false; // Initialize a flag to track if the button is clicked
                if (buttonName === "SliderBar") { // Check if the button name is "SliderBar"
                    console.log("SliderBar clicked"); // Print a message indicating that the slider bar is clicked
                    buttonClicked = true; // Set the buttonClicked flag to true
                } else {
                    // Handle other button types if needed
                }
                // Check if the button is clicked
                if (buttonClicked) {
                    // Get the position and direction of the cursor
                    if (targetObject) {
                        const progressBar = world.eid2obj.get(eid); // Get the progress bar object using the entity ID

                        const { position, direction } = userinput.get(paths.actions.cursor.right.pose); // Get the position and direction of the cursor
                        const plane = new Plane(); // Create a new plane object
                        const ray = new Ray(); // Create a new ray object
                        ray.set(position, direction); // Set the position and direction of the ray
                        plane.normal.set(0, 0, 1); // Set the normal of the plane to (0, 0, 1)
                        plane.constant = 0; // Set the constant of the plane to 0
                        if (progressBar) {
                            plane.applyMatrix4(progressBar.matrixWorld); // Apply the world matrix of the progress bar to the plane
                        }

                        let intersectionPoint = new Vector3(); // Create a new vector to store the intersection point
                        ray.intersectPlane(plane, intersectionPoint); // Calculate the intersection point between the ray and the plane

                        // Check if the intersection point is valid
                        if (intersectionPoint) {
                            // Set clickedOnSlider flag to true
                            clickedOnSlider = true;
                            // Calculate the slider percent based on the intersection point
                            let sliderPercent = 0;
                            if (progressBar) {
                                sliderPercent = (intersectionPoint.x - (progressBar.position.x - progressBarWidth / 2)) / 5;
                            }
                            // Round the slider percent to 2 decimal places
                            const roundedSliderPercent = Math.round(sliderPercent * (maxSteps + sliderPadding)) - sliderPadding / 2;

                            // Remove the progress bar from the scene if it exists
                            if (progressBar) {
                                world.scene.remove(progressBar);
                            }

                            // Update the current steps value
                            currentSteps = roundedSliderPercent;
                            // Update the target object
                            update(myThreeJSObject, networkedEid);

                        }
                    }
                }
            }
        }
    });

    TFCNetworkedSyncButtonQuery(world).forEach(eid => {
        if (clicked(world, eid)) {
            if (clickedOnSlider) {
                clickedOnSlider = false; // Reset the clickedOnSlider flag
            }
            let networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;

            const type = APP.getString(TFCNetworkedSyncButton.type[eid])!;
            const steps = TFCNetworkedSyncButton.steps[eid]!;

            if (type == "control") {
                if (networkedEid) {
                    takeOwnership(world, networkedEid);
                    TFCNetworkedContentData.type[networkedEid] = APP.getSid("control");
                    TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                    TFCNetworkedContentData.clientId[networkedEid] = APP.getSid(NAF.clientId);

                } else {
                    const nid = createNetworkedEntity(world, "tfc-networked-content-data", { type: type, steps: steps, control: "", clientId: NAF.clientId });
                    networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
                    TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                }
            } else {
                if (networkedEid && networkClientId == NAF.clientId) {
                    TFCNetworkedContentData.type[networkedEid] = APP.getSid(type);
                    TFCNetworkedContentData.control[networkedEid] = APP.getSid("");
                    TFCNetworkedContentData.steps[networkedEid] = currentSteps;
                    TFCNetworkedContentData.clientId[networkedEid] = APP.getSid(NAF.clientId);
                }
            }
        }
    });

    TFCMyThreeJSButtonQuery(world).forEach(eid => {
        const networkedEid = anyEntityWith(world, TFCNetworkedContentData)!;
        if (networkedEid) {
            if (clicked(world, eid)) {
                if (clickedOnSlider) {
                    clickedOnSlider = false; // Reset the clickedOnSlider flag
                }
                console.log("My ThreeJS Button clicked", eid);
                const targetObjectRef = TFCMyThreeJSButton.targetObjectRef[eid];
                const targetObject = world.eid2obj.get(targetObjectRef);
                const buttonName = APP.getString(TFCMyThreeJSButton.name[eid]);
                let nextStep = true;
                let buttonClicked = false;
                if (buttonName === "Next") {
                    console.log("Next button clicked");
                    nextStep = true;
                    buttonClicked = true;
                } else if (buttonName === "Back") {
                    console.log("Back button clicked");
                    nextStep = false;
                    buttonClicked = true;
                }

                if (buttonClicked) {
                    if (myThreeJSObject) {
                        console.log("Target Object: ", myThreeJSObject);
                        console.log("Current Steps: ", currentSteps);
                        if (nextStep) {
                            console.log("Next Step");
                            currentSteps += increaseSteps;
                        } else {
                            console.log("Previous Step");
                            currentSteps -= increaseSteps;
                        }

                        console.log("After click -> Steps: ", currentSteps);

                        update(myThreeJSObject, networkedEid);
                    }
                }
            }

            if (APP.getString(TFCNetworkedContentData.type[networkedEid]) == "control") {
                if (APP.getString(TFCNetworkedContentData.clientId[networkedEid]) == NAF.clientId) {
                    // If the current client owns the control, highlight the button.
                    (myThreeJSSyncButton.material as THREE.MeshBasicMaterial).color.setHex(0x5CB85C);
                } else {
                    // If another client owns the control, revert the button color.
                    (myThreeJSSyncButton.material as THREE.MeshBasicMaterial).color.setHex(0x000000);
                }
                networkClientId = APP.getString(TFCNetworkedContentData.clientId[networkedEid])!;
            } else {
            }

            if (APP.getString(TFCNetworkedContentData.type[networkedEid]) != "" &&
                APP.getString(TFCNetworkedContentData.steps[networkedEid]) != "") {
                if (TFCNetworkedContentData.steps[networkedEid] != currentSteps) {
                    console.log("update: ", currentSteps);
                    console.log(TFCNetworkedContentData.steps[networkedEid]);
                    const contentObject = world.eid2obj.get(contentObjectRef);
                    if (contentObject) {
                        currentSteps = TFCNetworkedContentData.steps[networkedEid]!;
                        update(contentObject, networkedEid);
                    }
                }
            }
        }
    });

    function update(targetObject: THREE.Object3D, networkedEid: number) {

        if (currentSteps < 0) {
            currentSteps = 0; // Ensure currentSteps is not negative
        }
        if (currentSteps > maxSteps) {
            currentSteps = maxSteps; // Ensure currentSteps is not greater than maxSteps
        }

        world.scene.remove(targetObject);
        const myNewThreeJSProps = {
            category: category,
            unit: unit,
            position: objectPosition,
            rotation: objectRotation,
            scale: objectScale,
            steps: currentSteps
        }
        // Create a new ThreeJS object based on the category and unit values
        const myNewThreeJSContentEid = addEntity(world);
        // Create a new ThreeJS object based on the category and unit values
        let outputSteps = 0;

        if (category === "Transformation") {
            switch (unit) {
                case "1":
                    [myThreeJSObject, outputSteps] = createMyThreeJSTrans01(myNewThreeJSProps);
                    myThreeJSObject.position.x += 0.7;
                    myThreeJSObject.position.z -= 0.1;
                    myThreeJSObject.position.y += 1.3;
                    myThreeJSObject.rotation.z += 1.57;
                    myThreeJSObject.scale.set(0.3, 0.3, 0.3);
                    break;
                case "6":
                    [myThreeJSObject, outputSteps] = createMyThreeJSTrans06(myNewThreeJSProps);

                    break;
            }
        } else if (category === "Geometry") {
            const unitNumber = parseInt(unit); // Convert the 'unit' variable to an integer
            if (currentSteps > 90) { // Check if 'currentSteps' is greater than 90
                currentSteps = 90; // Set 'currentSteps' to 90
            }
            if (currentSteps < 0) {
                currentSteps = 0;
            }
            if (currentSteps % 5 != 0) { // Check if 'currentSteps' is not divisible by 5
                currentSteps = Math.round(currentSteps / 5) * 5; // Round 'currentSteps' to the nearest multiple of 5
            }
            const myThreeJSModel3DProps = {
                type: unitNumber,
                angle: currentSteps,
                position: objectPosition,
                rotation: objectRotation,
                scale: objectScale
            };
            // Create a 3D box object based on the myThreeJSModel3DProps
            [myThreeJSObject, maxSteps] = create3DBox(myThreeJSModel3DProps);
            myThreeJSObject.position.copy(objectPosition);
            myThreeJSObject.position.x -= 1;
            // Set the outputSteps to the currentSteps
            outputSteps = currentSteps;
        } else if (category === "Construction") {
            const myThreeJSModel3DProps = {
                position: objectPosition,
                steps: currentSteps
            };
            // Create a construction object
            [myThreeJSObject, outputSteps, maxSteps] = createMyThreeJSCons01(myThreeJSModel3DProps.position, myThreeJSModel3DProps.steps);
        }

        addObject3DComponent(world, myNewThreeJSContentEid, myThreeJSObject);
        contentObjectRef = myNewThreeJSContentEid;
        world.scene.add(myThreeJSObject);
        objectsInScene.push(myThreeJSObject);

        currentSteps = outputSteps;
        TFCMyThreeJSButton.targetObjectRef[myThreeJSNextButtonEid] = myNewThreeJSContentEid;
        TFCMyThreeJSButton.targetObjectRef[myThreeJSBackButtonEid] = myNewThreeJSContentEid;
        TFCNetworkedContentData.steps[networkedEid] = currentSteps;

        world.scene.remove(myThreeJSProgressBar); // Remove the progress bar from the scene
        // Create a new entity for the myThreeJSProgressBar
        const myThreeJSProgressBarEid = addEntity(world);

        // Create a UI slider for the progress bar
        myThreeJSProgressBar = createUISlider({
            width: progressBarWidth,
            height: 0.5,
            currentSteps: currentSteps,
            minSteps: -(sliderPadding / 2),
            maxSteps: (maxSteps + sliderPadding / 2),
        });

        // Set the position of the progress bar
        myThreeJSProgressBar.position.copy(objectPosition);
        myThreeJSProgressBar.position.x += 4;
        // myThreeJSProgressBar.position.y += 1.5;


        // Add the Object3D component to the progress bar entity
        addObject3DComponent(world, myThreeJSProgressBarEid, myThreeJSProgressBar);

        // Add the TFCMYThreeJSSliderBar component to the progress bar entity
        addComponent(world, TFCMYThreeJSSliderBar, myThreeJSProgressBarEid);

        // Set the name and targetObjectRef properties of the TFCMYThreeJSSliderBar component
        TFCMYThreeJSSliderBar.name[myThreeJSProgressBarEid] = APP.getSid("SliderBar");
        TFCMYThreeJSSliderBar.targetObjectRef[myThreeJSProgressBarEid] = myNewThreeJSContentEid;

        // Add additional components to the progress bar entity
        addComponent(world, RemoteHoverTarget, myThreeJSProgressBarEid);
        addComponent(world, CursorRaycastable, myThreeJSProgressBarEid);
        addComponent(world, SingleActionButton, myThreeJSProgressBarEid);

        // Add the progress bar to the scene and objectsInScene array
        world.scene.add(myThreeJSProgressBar);
        objectsInScene.push(myThreeJSProgressBar);

        // Update the myThreeJSContentEid with the new entity ID
        myThreeJSContentEid = myNewThreeJSContentEid;
    }
}