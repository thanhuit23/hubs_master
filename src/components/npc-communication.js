import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { Interacted, voiceButtonData } from "../bit-components";
import { hasComponent, addComponent, addEntity } from "bitecs";

AFRAME.registerComponent("npc-communication", {
    schema: {
        height: { type: "number", default: 1.5 },
        width: { type: "number", default: 0.5 },
    },

    init: function () {
        this.eid = null;
        // this.audioMap = {}; // Map to store audio objects
        // this.loadAudioFiles(); // Preload audio files
        this.createOrUpdateUI("Record");
    },

    // Preload audio files
    loadAudioFiles: function () {
        const audioLoader = new THREE.AudioLoader();
        const listener = new THREE.AudioListener();
        this.el.object3D.add(listener);

        this.audioMap.startRecording = new THREE.Audio(listener);
        this.audioMap.stopRecording = new THREE.Audio(listener);

        audioLoader.load("path-to-start-recording.mp3", (buffer) => {
            this.audioMap.startRecording.setBuffer(buffer);
        });

        audioLoader.load("path-to-stop-recording.mp3", (buffer) => {
            this.audioMap.stopRecording.setBuffer(buffer);
        });
    },

    // Play audio by key
    playAudio: function (key) {
        if (this.audioMap[key] && !this.audioMap[key].isPlaying) {
            this.audioMap[key].play();
        }
    },

    // Stop all playing audio
    stopAllAudio: function () {
        Object.values(this.audioMap).forEach((audio) => {
            if (audio.isPlaying) {
                audio.stop();
            }
        });
    },

    clicked: function (world, entity) {
        return hasComponent(world, Interacted, entity);
    },

    createOrUpdateUI: function (buttonText) {
        const BUTTON_CONFIG = {
            width: 0.5,
            height: 0.5,
            backgroundColor: "Play Button",
            textColor: "#000000",
            fontSize: 16,
            font: "Arial",
        };

        this.eid = addEntity(APP.world);

        // Create button UI
        this.voiceButton = createUIButton({
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
        voiceButtonData.clicked[this.eid] = APP.getSid(buttonText === "Record" ? "false" : "true");
    },

    tick: function () {
        if (this.clicked(APP.world, this.eid)) {
            const clickedState = APP.getString(voiceButtonData.clicked[this.eid]);
            const buttonText = clickedState === "true" ? "Record" : "Recording";

            // if (clickedState === "true") {
            //     this.playAudio("stopRecording");
            // } else {
            //     this.playAudio("startRecording");
            // }

            const voiceButton = APP.world.eid2obj.get(this.eid);
            this.el.object3D.remove(voiceButton);
            // Add a new object 3D component to the entity
            this.createOrUpdateUI(buttonText);
        }
    },

    remove: function () {
        if (this.eid) {
            const voiceButton = APP.world.eid2obj.get(this.eid);
            if (voiceButton) {
                this.el.object3D.remove(voiceButton);
                console.log("Removing UI");
            }
        }

        // Stop all playing audio
        // this.stopAllAudio();
    },
});
