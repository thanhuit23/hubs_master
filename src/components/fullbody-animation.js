// Thanh add
import { AnimationClip } from 'three';
import { paths } from "../systems/userinput/paths";

export const ANIMATIONS = {
    IDLE: "Idle",
    WALKING_FORWARD: "Walking",
    WALKING_BACKWARD: "WalkingBackwards",
    WALKING_LEFT: "LeftStrafeWalk",
    WALKING_RIGHT: "RightStrafeWalk",
    RUNNING_FORWARD: "Running",
    RUNNING_BACKWARD: "RunningBackward",
    RUNNING_LEFT: "LeftStrafe",
    RUNNING_RIGHT: "RightStrafe",
};

const reactionAnimationNames = [
    "Happy", // Happy
    "Laugh", // Laugh
    "Clapping", // Clap
    "Heart", // Heart
    "Waving", // Wave
    "Anger", // Angry
    "Sad", // Sad
    "Victory", // Victory
    "Hiphop", // Hiphop
    "Salute", // Salute
    "WaveDance", // WaveDance
];

const reactionTimes = {
    "Happy": 2.3,
    "Laugh": 2.3,
    "Clapping": 1,
    "Heart": 2.3,
    "Waving": 2.3,
    "Anger": 2.3,
    "Sad": 2.3,
    "Victory": 2.3,
    "Hiphop": 2.3,
    "Salute": 2.3,
    "WaveDance": 2.3,
};

AFRAME.registerComponent("fullbody-animation-change", {
    userinput: null,

    currentAnimationName: ANIMATIONS.IDLE,
    currentThreads: [],

    init() {
        this.userinput = AFRAME.scenes[0].systems.userinput;
        // if user using mobile device
        if (AFRAME.utils.device.isMobile()) {
            this.el.addEventListener("position-update", (evt) => {
                this.displacement = evt.detail.displacement;
                this.isMoving = evt.detail.isMoving;
                if (this.isMoving) {
                    this.currentAnimationName = ANIMATIONS.IDLE;
                    this.setCurrentAnimation(ANIMATIONS.IDLE);
                    window.dispatchEvent(new CustomEvent("stop-risehand", { detail: { } }));
                }
            })
            this.el.addEventListener("rotation-update", (evt) => {
                this.isRotating = evt.detail.isRotating;
                this.rotateX = evt.detail.rotateX;
                this.rotateY = evt.detail.rotateY;
            })
        }

        window.addEventListener("start-animation", event => {
            this.currentAnimationName = event.detail.animationName;
            for (let i = 0; i < this.currentThreads.length; i++) {
                clearTimeout(this.currentThreads[i]);
            }

            // stop animation after 2.3 seconds
            if (reactionAnimationNames.includes(this.currentAnimationName)) {
                this.currentThreads.push(setTimeout(() => {
                    this.currentAnimationName = ANIMATIONS.IDLE;
                }, reactionTimes[event.detail.animationName] * 1000));
            }
        });

        window.addEventListener("loop-animation", event => {
            this.currentAnimationName = event.detail.animationName;
            for (let i = 0; i < this.currentThreads.length; i++) {
                clearTimeout(this.currentThreads[i]);
            }
        });

        window.addEventListener("stop-animation", event => {
            this.currentAnimationName = ANIMATIONS.IDLE;
            for (let i = 0; i < this.currentThreads.length; i++) {
                clearTimeout(this.currentThreads[i]);
            }
        });
    },

    tick() {
        if (AFRAME.utils.device.isMobile()) {
            if (this.isMoving) {
                if (Math.abs(this.displacement.z) < Math.abs(this.displacement.x)) {
                    if (this.displacement.x < 0) {
                        this.setCurrentAnimation(ANIMATIONS.WALKING_LEFT);
                    } else if (this.displacement.x > 0) {
                        this.setCurrentAnimation(ANIMATIONS.WALKING_RIGHT);
                    }
                } else {
                    if (this.displacement.z < 0) {
                        this.setCurrentAnimation(ANIMATIONS.WALKING_BACKWARD);
                    } else {
                        this.setCurrentAnimation(ANIMATIONS.WALKING_FORWARD);
                    }
                }
            } else {
                let animation_speed = 2.3;
                if (reactionAnimationNames.includes(this.currentAnimationName)) {
                    animation_speed = 1;
                }
                this.setCurrentAnimation(this.currentAnimationName, animation_speed)
            }
        }
        else {
            const vector = this.userinput.get(paths.actions.characterAcceleration);
            const boost = this.userinput.get(paths.actions.boost);

            if (vector) {
                const [right, front] = vector;
                const isRunning = boost || 1 < Math.abs(right) || 1 < Math.abs(front)

                if (front === 0 && right === 0) {
                    let animation_speed = 2.3;
                    if (reactionAnimationNames.includes(this.currentAnimationName)) {
                        animation_speed = 1;
                    }
                    this.setCurrentAnimation(this.currentAnimationName, animation_speed)
                } else {
                    this.currentAnimationName = ANIMATIONS.IDLE;
                    this.setCurrentAnimation(ANIMATIONS.IDLE);
                    window.dispatchEvent(new CustomEvent("stop-risehand", { detail: { } }));
                    if (Math.abs(front) < Math.abs(right)) {
                        if (0 < right) {
                            this.setCurrentAnimation(isRunning ? ANIMATIONS.RUNNING_RIGHT : ANIMATIONS.WALKING_RIGHT);
                        } else {
                            this.setCurrentAnimation(isRunning ? ANIMATIONS.RUNNING_LEFT : ANIMATIONS.WALKING_LEFT);
                        }
                    } else {
                        if (0 < front) {
                            this.setCurrentAnimation(isRunning ? ANIMATIONS.RUNNING_FORWARD : ANIMATIONS.WALKING_FORWARD);
                        } else {
                            this.setCurrentAnimation(isRunning ? ANIMATIONS.RUNNING_BACKWARD : ANIMATIONS.WALKING_BACKWARD);
                        }
                    }
                }
            }
        }

    },

    setCurrentAnimation(animationName, animation_speed = 2.3) {
        const attrs = this.el.getAttribute('networked-avatar')

        if (attrs.avatar_pose !== animationName) {
            this.el.setAttribute("networked-avatar", { avatar_pose: animationName, animation_speed: animation_speed });
        }
    },
});

AFRAME.registerComponent("fullbody-animation-play", {
    animations: null,
    clock: null,
    mixer: null,

    init() {
        this.playAnimation = this.playAnimation.bind(this);
        this.animations = this.findAnimations();
        // Update the animation time
        for (let i = 0; i < this.animations.length; i++) {
            if (reactionAnimationNames.includes(this.animations[i].name)) {
                reactionTimes[this.animations[i].name] = this.animations[i].duration;
            }
        }
        this.avatarRoot = this.findAvatarRoot();
        this.networkedAvatar = this.findNetworkAvatarEl(this.el);
        this.mixer = new THREE.AnimationMixer(this.avatarRoot);
        this.mixer.addEventListener('finished', () => {
            this.playAnimation('Idle')
        });
    },

    remove() {
        if (this.mixer) {
            this.mixer.stopAllAction()

            if (this.avatarRoot) {
                this.mixer.uncacheRoot(this.avatarRoot)
            }
        }
    },

    findNetworkAvatarEl() {
        let currentObject = this.el

        while (!(currentObject.components && currentObject.components["networked-avatar"])) {
            currentObject = currentObject.parentEl

            if (!currentObject) {
                return null;
            }
        }

        return currentObject;
    },

    findAvatarRoot() {
        let currentObject = this.el.object3D

        while (currentObject.name !== 'AvatarRoot') {
            currentObject = currentObject.parent

            if (!currentObject) {
                return null;
            }
        }

        return currentObject;
    },

    findAnimations() {
        let currentObject = this.el.object3D

        while (currentObject.animations.length === 0) {
            currentObject = currentObject.parent

            if (!currentObject) {
                return [];
            }
        }

        return currentObject.animations;
    },

    playAnimation(animationName, clamp = true, loop = true, times_scale = 2.3) {
        if (this.currentClip) {
            this.mixer.stopAllAction()
            this.mixer.uncacheClip(this.currentClip)
        }

        this.currentClip = AnimationClip.findByName(this.animations, animationName)

        if (this.currentClip) {
            this.mixer.stopAllAction()

            const action = this.mixer.clipAction(this.currentClip)
            action.clampWhenFinished = true
            if (!clamp) {
                action.clampWhenFinished = false
            }
            if (!loop) {
                action.setLoop(THREE.LoopOnce)
            }
            /**
             * 2.3 is an arbitrary value that takes into account how fast
             * the avatar is moving and adjusts the speed of the animation accordingly.
             */
            action.timeScale = times_scale

            if (animationName === 'Idle') {
                action.paused = true
            }

            action.play()
            return true
        } else {
            return false
        }
    },

    tick(t, dt) {
        this.mixer && this.mixer.update(dt / 1000)

        const attrs = this.networkedAvatar.getAttribute('networked-avatar')

        if (this.currentAnimationName !== attrs.avatar_pose) {
            this.playAnimation(attrs.avatar_pose, true, true, attrs.animation_speed)
            this.currentAnimationName = attrs.avatar_pose
        }
    },
});