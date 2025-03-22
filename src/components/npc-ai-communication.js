import { createNPCButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { Interacted, voiceButtonData } from "../bit-components";
import { hasComponent, addComponent, addEntity } from "bitecs";
import { findAncestorWithComponent } from "../utils/scene-graph";

AFRAME.registerComponent("npc-ai-communication", {
    schema: {
        height: { type: "number", default: 1.5 },
        width: { type: "number", default: 0.5 },
        api: { type: "string", default: "https://coastal-fails-warren-co.trycloudflare.com/process_audio" },
    },

    init: function () {
        this.eid = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.createOrUpdateUI("idle");
        this.toggleRecording();
        this.shouldTalk = true;
        this.currentText = "idle";
        this.waitingAnimationName = "idle";
        this.thinkingAnimationName = "think";
        this.answerAnimationName = "talk";
        // this.thinkingAnimationName = "texting";
        // this.answerAnimationName = "talking";
    },

    clicked: function (world, entity) {
        return hasComponent(world, Interacted, entity);
    },

    createOrUpdateUI: function (buttonText) {
        const BUTTON_CONFIG = {
            width: 1.0,
            height: 1.0,
            backgroundColor: "Play Button",
            textColor: "#000000",
            fontSize: 16,
            font: "Arial",
        };

        this.eid = addEntity(APP.world);

        // Create button UI
        this.voiceButton = createNPCButton({
            ...BUTTON_CONFIG,
            text: buttonText,
        });

        // Add object3D and ECS components
        addObject3DComponent(APP.world, this.eid, this.voiceButton);
        addComponent(APP.world, voiceButtonData, this.eid);
        addComponent(APP.world, CursorRaycastable, this.eid); // Raycast
        addComponent(APP.world, RemoteHoverTarget, this.eid); // Hover
        addComponent(APP.world, SingleActionButton, this.eid); // Click

        // Attach the button to the entity
        this.el.object3D.add(this.voiceButton);
        voiceButtonData.clicked[this.eid] = APP.getSid(buttonText === "idle" ? "false" : "true");
        this.currentText = buttonText;
    },

    tick: function () {
        if (this.clicked(APP.world, this.eid)) {
            const currentClickedState = APP.getString(voiceButtonData.clicked[this.eid]);
            const nextButtonText = currentClickedState === "true" ? "idle" : "send";


            if (currentClickedState === "true" && this.currentText === "send") {
                this.stopRecording();
            }
            if (currentClickedState === "false" && this.currentText === "idle") {
                this.toggleRecording();
                // Add a new object 3D component to the entity
                const voiceButton = APP.world.eid2obj.get(this.eid);
                this.el.object3D.remove(voiceButton);
                this.createOrUpdateUI(nextButtonText);
            }
        }
    },
    toggleRecording: async function () {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);

            this.mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    this.recordedChunks.push(event.data);
                }
            };

            this.mediaRecorder.start();
        } catch (error) {
            console.error("Error starting recording:", error);
        }
    },


    stopRecording: function () {
        const voiceButton = APP.world.eid2obj.get(this.eid);
        this.el.object3D.remove(voiceButton);
        this.createOrUpdateUI("wait");
        this.mediaRecorder.stop();
        this.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            this.recordedChunks = []; // Clear chunks
            // Convert to a file object for upload
            const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
            const dataTransfer = new DataTransfer();
            dataTransfer.items.add(audioFile);
            document.getElementById('audioInput').files = dataTransfer.files;
            await this.voiceProcess();
        };
        if (!this.mixerEl) {
            const environmentScene = document.querySelector("#environment-scene");
            const animationEntity = environmentScene.children[0];
            // convert the animationEntity to el
            const animationEl = animationEntity.object3D.el;
            this.mixerEl = findAncestorWithComponent(animationEl, "animation-mixer");
            if (!this.mixerEl) {
                this.stopNPCSection();
                console.error("No animation mixer found");
                return;
            }
        }
        this.playAnimation(this.mixerEl, this.waitingAnimationName, "stop", "npc");
        this.playAnimation(this.mixerEl, this.thinkingAnimationName, "loop", "npc");
    },

    stopNPCSection: function () {
        this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
        this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
        this.playAnimation(this.mixerEl, this.waitingAnimationName, "loop", "npc");
        const npcAudio = document.getElementById('npcAudio');
        npcAudio.pause();
        const voiceButton = APP.world.eid2obj.get(this.eid);
        this.el.object3D.remove(voiceButton);
        this.createOrUpdateUI("idle");
    },

    async fetchWithTimeout(resource, options = {}) {
        const { timeout = 8000 } = options;

        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(resource, {
            ...options,
            signal: controller.signal
        });
        clearTimeout(id);

        return response;
    },

    voiceProcess: async function () {
        // Delay 2 seconds to ensure the recording is saved
        await new Promise((resolve) => setTimeout(resolve, 4000));

        const fileInput = document.getElementById('audioInput');

        if (!fileInput.files.length) {
            this.stopNPCSection();
            console.error('No file selected');
            return;
        }
        const file = fileInput.files[0];

        try {
            const transcriptionFormData = new FormData();
            transcriptionFormData.append('file', file, "test.webm"); // Use the original file directly
            // transcriptionFormData.append('type', 'audio/webm');

            // Using AI API
            const apiUrl = this.data.api;
            console.log('API URL:', apiUrl);
            try {
                const response = await fetch(apiUrl, {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                    },
                    body: transcriptionFormData,
                });

                if (response.ok && this.shouldTalk) {
                    const npcAudio = document.getElementById('npcAudio');
                    const voiceButton = APP.world.eid2obj.get(this.eid);
                    this.el.object3D.remove(voiceButton);
                    this.createOrUpdateUI("speak");
                    try {
                        this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                        this.playAnimation(this.mixerEl, this.answerAnimationName, "loop", "npc");
                        const responseJSON = await response.json();
                        console.log('Audio blob:', responseJSON["blob"]);
                        const base64Audio = responseJSON["blob"];
                        // Remove the "data:audio/mpeg;base64," prefix to get the pure Base64 string
                        const base64String = base64Audio.split(",")[1];

                        // Convert Base64 to binary data
                        const binaryData = atob(base64String);
                        const byteArray = new Uint8Array(binaryData.length);
                        for (let i = 0; i < binaryData.length; i++) {
                            byteArray[i] = binaryData.charCodeAt(i);
                        }

                        // Create a Blob from the binary data
                        const audioBlob = new Blob([byteArray], { type: "audio/mpeg" });

                        // Create an Object URL for the Blob
                        const audioUrl = URL.createObjectURL(audioBlob);
                        npcAudio.src = audioUrl;
                        npcAudio.play();
                        npcAudio.onended = () => {
                            this.stopNPCSection();
                            console.log('Audio ended');
                        };
                    } catch (error) {
                        this.stopNPCSection();
                        console.error('Error playing audio:', error);
                        return;
                    }
                } else {
                    this.stopNPCSection();
                    console.error('Error in TTS API:', response.status, response);
                    return;
                }
            } catch (error) {
                this.stopNPCSection();
                console.error('Timeout in TTS API:', error);
                return;
            }
        } catch (error) {
            this.stopNPCSection();
            console.error('Error converting audio to text:', error);
            return;
        }
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

    remove: function () {
        if (this.eid) {
            const voiceButton = APP.world.eid2obj.get(this.eid);
            if (voiceButton) {
                this.el.object3D.remove(voiceButton);
                const npcAudio = document.getElementById('npcAudio');
                npcAudio.pause();
                this.shouldTalk = false;
            }
        }
    },
});
