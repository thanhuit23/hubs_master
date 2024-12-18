import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { Interacted, voiceButtonData } from "../bit-components";
import { hasComponent, addComponent, addEntity } from "bitecs";
import { findAncestorWithComponent } from "../utils/scene-graph";
import configs from "../utils/configs";

AFRAME.registerComponent("npc-communication", {
    schema: {
        height: { type: "number", default: 1.5 },
        width: { type: "number", default: 0.5 },
    },

    init: function () {
        this.eid = null;
        this.mediaRecorder = null;
        this.recordedChunks = [];
        this.createOrUpdateUI("Recording");
        this.openaiKey = configs.feature("default_openai_api_key");
        this.toggleRecording();
        this.waitingAnimationName = "Idle";
        this.thinkingAnimationName = "Sit";
        this.answerAnimationName = "Idle";
        this.byAnimationName = "Salute";
        this.shouldTalk = true;
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

            if (clickedState === "true") {
                // this.playAudio("stopRecording");
                this.stopRecording();
            } else {
                // this.playAudio("startRecording");
                this.toggleRecording();
            }

            const voiceButton = APP.world.eid2obj.get(this.eid);
            this.el.object3D.remove(voiceButton);
            // Add a new object 3D component to the entity
            this.createOrUpdateUI(buttonText);
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

            // Added code to detect silence
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const source = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            source.connect(analyser);
            analyser.fftSize = 512;
            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const silenceThreshold = 20;
            const silenceDuration = 1500;
            let silenceStart = null;
            let keepListening = true;

            const checkSilence = () => {
                if (keepListening) {
                    analyser.getByteFrequencyData(dataArray);
                    const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    if (average < silenceThreshold) {
                        if (!silenceStart) {
                            silenceStart = Date.now();
                        } else if (Date.now() - silenceStart > silenceDuration) {
                            this.stopRecording();
                            const voiceButton = APP.world.eid2obj.get(this.eid);
                            this.el.object3D.remove(voiceButton);
                            this.createOrUpdateUI("Record");
                            silenceStart = null;
                            cancelAnimationFrame(checkSilence);
                            keepListening = false;
                        }
                    } else {
                        silenceStart = null;
                    }
                    requestAnimationFrame(checkSilence);
                }
            };
            checkSilence();
        } catch (error) {
            console.error("Error starting recording:", error);
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

    stopRecording: function () {
        if (!this.mixerEl) {
            const environmentScene = document.querySelector("#environment-scene");
            const animationEntity = environmentScene.children[0];
            // convert the animationEntity to el
            const animationEl = animationEntity.object3D.el;
            this.mixerEl = findAncestorWithComponent(animationEl, "animation-mixer");
            if (!this.mixerEl) {
                return;
            }
        }
        this.playAnimation(this.mixerEl, this.thinkingAnimationName, "loop", "npc");
        this.mediaRecorder.stop();
        this.mediaRecorder.onstop = async () => {
            const audioBlob = new Blob(this.recordedChunks, { type: 'audio/webm' });
            if (audioBlob.size < 25000) { // Check if recording is too short
                console.log('Recording too short, skipping upload.');
                this.recordedChunks = [];
                this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                return;
            }
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
        const fileInput = document.getElementById('audioInput');
        const outputTextarea = document.getElementById('audioText');
        const apiKey = this.openaiKey;

        if (!fileInput.files.length) {
            alert('Please select an audio file first!');
            return;
        }
        const file = fileInput.files[0];

        try {
            const transcriptionFormData = new FormData();
            transcriptionFormData.append('file', file); // Use the original file directly
            transcriptionFormData.append('model', 'whisper-1');

            // Using OpenAI Whisper API
            const apiUrl = 'https://api.openai.com/v1/audio/transcriptions';
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${apiKey}`,
                },
                body: transcriptionFormData,
            });

            if (response.ok) {
                const data = await response.json();
                outputTextarea.value = data.text || 'No transcription available';

                const audioText = data.text;
                const npcResponseTextarea = document.getElementById('npcResponse');

                if (!audioText) {
                    console('Please transcribe audio first!');
                    return;
                }

                // Detect the text is too short
                if (audioText.length < 4) {
                    alert('The audio transcription is too short. Please try again.');
                    return;
                }

                try {
                    // OpenAI GPT API for NPC interaction
                    const apiUrl = 'https://api.openai.com/v1/chat/completions';
                    const response = await fetch(apiUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${apiKey}`,
                        },
                        body: JSON.stringify({
                            model: 'gpt-4',
                            messages: [
                                { role: 'system', content: 'You are a concise and knowledgeable NPC who only responds with accurate and brief answers. If you do not know the answer, clearly state that you are unsure or do not have the information.' },
                                { role: 'user', content: audioText }
                            ]
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        npcResponseTextarea.value = data.choices[0].message.content || 'No response from NPC';

                        const npcResponse = npcResponseTextarea.value;
                        const npcAudio = document.getElementById('npcAudio');

                        if (!npcResponse) {
                            alert('Please get a response from the NPC first!');
                            return;
                        }

                        try {
                            // Use a Text-to-Speech API
                            const apiUrl = 'https://api.openai.com/v1/audio/speech'; // Example endpoint, replace with actual TTS endpoint
                            const response = await fetch(apiUrl, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${apiKey}`,
                                },
                                body: JSON.stringify({
                                    model: 'tts-1',
                                    input: npcResponse,
                                    voice: 'alloy' // Example voice, replace with available options
                                }),
                            });

                            if (response.ok && this.shouldTalk) {
                                this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                                this.playAnimation(this.mixerEl, this.answerAnimationName, "loop", "npc");
                                const audioBlob = await response.blob();
                                const audioUrl = URL.createObjectURL(audioBlob);
                                npcAudio.src = audioUrl;
                                npcAudio.play();
                                npcAudio.onended = () => {
                                    this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                                    this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                                };
                            } else {
                                this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                                this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                                npcAudio.pause();
                                console.error('Error in TTS API:', response.statusText);
                            }
                        } catch (error) {
                            this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                            this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                            console.error('Error during text-to-audio conversion:', error);
                        }
                    } else {
                        this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                        this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                        console.error('Error in NPC API:', response.statusText);
                        npcResponseTextarea.value = 'Error in NPC response';
                    }
                } catch (error) {
                    this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                    this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                    console.error('Error during NPC interaction:', error);
                }
            } else {
                this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
                this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
                console.error('Error in transcription API:', response.statusText);
                outputTextarea.value = 'Error in transcription';
            }
        } catch (error) {
            this.playAnimation(this.mixerEl, this.answerAnimationName, "stop", "npc");
            this.playAnimation(this.mixerEl, this.thinkingAnimationName, "stop", "npc");
            console.error('Error converting audio to text:', error);
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
