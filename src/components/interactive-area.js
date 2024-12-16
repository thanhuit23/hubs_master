// Thanh add
import { isLocalHubsUrl, isHubsRoomUrl } from "../utils/media-url-utils";
import { changeHub } from "../change-hub";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";
import { findAncestorWithComponent } from "../utils/scene-graph";

AFRAME.registerComponent("interactive-area", {
    schema: {
        triggerType: { type: "string", default: "" },
        triggerTarget: { type: "string", default: "" },
        isTriggered: { type: "boolean", default: false },
    },

    init: function () {
        this.initialScale = this.el.object3D.scale.x;
        this.initialPosition = this.el.object3D.position;
        this.player = document.querySelector("#avatar-pov-node");
        this.portalEntity = null;
        this.enablePortal = false;
    },

    update: function () {
    },

    playAnimation(mixerEl, animationName, animationType, targetClassName) {
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

        if (animationType === "play") {
            clipAction.reset();
            clipAction.setLoop(THREE.LoopOnce, 1);
            clipAction.play();
        }
        if (animationType === "stop") {
            clipAction.stop();
        }
        if (animationType === "loop") {
            clipAction.reset();
            clipAction.setLoop(THREE.LoopRepeat, Infinity);
            clipAction.play();
        }
    },

    tick: function () {
        if (!this.player) return;

        const avatarPov = document.querySelector("#avatar-pov-node").object3D;
        const playerPosition = new THREE.Vector3();
        avatarPov.getWorldPosition(playerPosition);

        const distance = this.el.object3D.position.distanceTo(playerPosition);
        if (distance < this.initialScale && !this.data.isTriggered) {
            this.data.isTriggered = true;
            this.triggerFuction(true);
        } else if (distance > this.initialScale && this.data.isTriggered) {
            this.data.isTriggered = false;
            this.triggerFuction(false);
        }
    },

    triggerFuction: function (state) {
        console.log(`You are ${state ? "entering" : "leaving"} the interactive area`);
        console.log(`Trigger type: ${this.data.triggerType}`);
        console.log(`Trigger target: ${this.data.triggerTarget}`);
        if (state) {
            if (this.data.triggerType === "npc") {
                this.enablePortal = true;
                this.onSpawnPortal();
                const mixerEl = findAncestorWithComponent(this.el.object3D.parent?.parent?.el, "animation-mixer");
                if (!mixerEl) {
                    return;
                }
                this.playAnimation(mixerEl, "Waving", "play", this.data.triggerTarget);
            } else if (this.data.triggerType === "teleport") {
                changeRoom(this.data.triggerTarget);
            }
        } else {
            if (this.data.triggerType === "npc") {
                // Remove the portal entity from the scene
                this.el.sceneEl.removeChild(this.portalEntity);
                this.enablePortal = false;
                const mixerEl = findAncestorWithComponent(this.el.object3D.parent?.parent?.el, "animation-mixer");
                if (!mixerEl) {
                    return;
                }
                this.playAnimation(mixerEl, "Waving", "stop", this.data.triggerTarget);
            }
        }
    },

    onSpawnPortal: function (event) {
        this.portalEntity = document.createElement("a-entity");
        this.portalEntity.setAttribute("npc-communication", { height: 0.5, width: 0.5 });
        // Set the position of the portal entity to the player's position
        this.portalEntity.object3D.position.set(this.initialPosition.x - 1, this.initialPosition.y, this.initialPosition.z);
        // Add the portal entity to the scene
        this.el.sceneEl.appendChild(this.portalEntity);
    },

    remove: function () {
        this.el.removeObject3D("interactive-area");
    }
});

async function changeRoom(linkUrl) {
    if (linkUrl == null || linkUrl == undefined) {
        return;
    }

    const currnetHubId = await isHubsRoomUrl(window.location.href);

    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => { }, true);

    let gotoHubId;
    if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
        const url = new URL(linkUrl);
        if (currnetHubId === gotoHubId && url.hash) {
            window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
        } else if (await isLocalHubsUrl(linkUrl)) {
            let waypoint = "";
            if (url.hash) {
                waypoint = url.hash.substring(1);
            }
            changeHub(gotoHubId, true, waypoint);
        } else {
            await exitImmersive();
            location.href = linkUrl;
        }
    }
}

