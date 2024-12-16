import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import { Interacted, voiceButtonData } from "../bit-components";
import {hasComponent, addComponent, addEntity} from "bitecs";

AFRAME.registerComponent('npc-communication', {
    schema: {
        height: { type: 'number', default: 1.5 },
        width: { type: 'number', default: 0.5 },
    },

    init: function () {
        this.createUI("Record");
    },

    clicked: function(world, entity) {
        return hasComponent(world, Interacted, entity);
    },

    createUI: function (buttonText) {
        console.log('Creating UI');

        const btn_width = 0.5;
        const btn_height = 0.5;
        const text_color = "#000000";
        const bg_color = "Play Button";
        const font_size = 16;
        const font = "Arial";

        this.eid = addEntity(APP.world);
        const voiceButton = createUIButton({
            width: btn_width,
            height: btn_height,
            backgroundColor: bg_color,
            textColor: text_color,
            text: buttonText,
            fontSize: font_size,
            font: font,
        });

        addObject3DComponent(APP.world, this.eid, voiceButton);
        addComponent(APP.world, voiceButtonData, this.eid);
        if (buttonText === "Record") {
            voiceButtonData.clicked[this.eid] = APP.getSid("false");
        } else {
            voiceButtonData.clicked[this.eid] = APP.getSid("true");
        }
        // Add mouse events to the mesh
        addComponent(APP.world, CursorRaycastable, this.eid); // Raycast
        addComponent(APP.world, RemoteHoverTarget, this.eid); // Hover
        addComponent(APP.world, SingleActionButton, this.eid); // Click
        this.el.object3D.add(voiceButton);
    },

    tick: function () {
        // Check clicked state
        if (this.clicked(APP.world, this.eid)) {
            const clicked = APP.getString(voiceButtonData.clicked[this.eid]);
            // Get object 3D component from the entity
            const voiceButton = APP.world.eid2obj.get(this.eid);
            if (clicked === "true") {
                voiceButtonData.clicked[this.eid] = APP.getSid("false");
                // Remove the object 3D component from the entity
                this.el.object3D.remove(voiceButton);
                // Add a new object 3D component to the entity
                this.createUI("Record");
            } else {
                voiceButtonData.clicked[this.eid] = APP.getSid("true");
                this.el.object3D.remove(voiceButton);
                this.createUI("Recording");
            }
            
        }   
    },

    remove: function () {
        // Remove the object 3D component from the entity
        const voiceButton = APP.world.eid2obj.get(this.eid);
        this.el.object3D.remove(voiceButton);
        console.log('Removing UI');
    }
});