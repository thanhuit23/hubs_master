import { createNPCButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { Interacted, voiceButtonData } from "../bit-components";
import { hasComponent, addComponent, addEntity } from "bitecs";

AFRAME.registerComponent("npc-ai-communication", {
    schema: {
        height: { type: "number", default: 1.5 },
        width: { type: "number", default: 0.5 },
    },

    init: function () {
        this.eid = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.createOrUpdateUI("idle");
        this.toggleRecording();
        this.shouldTalk = true;
        this.currentText = "idle";
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

    },

    voiceProcess: async function () {
        // Delay 2 seconds to ensure the recording is saved
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const fileInput = document.getElementById('audioInput');

        if (!fileInput.files.length) {
            alert('Please select an audio file first!');
            return;
        }
        const file = fileInput.files[0];

        try {
            const transcriptionFormData = new FormData();
            transcriptionFormData.append('file', file, "test.webm"); // Use the original file directly
            // transcriptionFormData.append('type', 'audio/webm');

            // Using AI API
            const apiUrl = 'https://coastal-fails-warren-co.trycloudflare.com/process_audio';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                },
                body: transcriptionFormData,
            });

            if (response.ok && this.shouldTalk) {
                const voiceButton = APP.world.eid2obj.get(this.eid);
                this.el.object3D.remove(voiceButton);
                this.createOrUpdateUI("speak");
                try {
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
                        const voiceButton = APP.world.eid2obj.get(this.eid);
                        this.el.object3D.remove(voiceButton);
                        this.createOrUpdateUI("idle");
                    };
                } catch (error) {
                    const voiceButton = APP.world.eid2obj.get(this.eid);
                    this.el.object3D.remove(voiceButton);
                    this.createOrUpdateUI("idle");
                    console.error('Error playing audio:', error);
                }
            } else {
                npcAudio.pause();
                console.error('Error in TTS API:', response.status, response);
                const voiceButton = APP.world.eid2obj.get(this.eid);
                this.el.object3D.remove(voiceButton);
                this.createOrUpdateUI("idle");
            }
        } catch (error) {
            console.error('Error converting audio to text:', error);
            const voiceButton = APP.world.eid2obj.get(this.eid);
            this.el.object3D.remove(voiceButton);
            this.createOrUpdateUI("idle");
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
