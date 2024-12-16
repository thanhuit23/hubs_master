import { createUIButton } from "../tfl-libs/tfl-button";
import { addObject3DComponent } from "../utils/jsx-entity";
import { CursorRaycastable, RemoteHoverTarget, SingleActionButton } from "../bit-components";
import {
    defineQuery, enterQuery, exitQuery, hasComponent, addComponent, addEntity
} from "bitecs";

AFRAME.registerComponent('npc-communication', {
    schema: {
        height: { type: 'number', default: 1.5 },
        width: { type: 'number', default: 0.5 },
    },

    init: function () {
        this.createUI();
    },

    createUI: function () {
        console.log('Creating UI');

        const btn_width = 0.5;
        const btn_height = 0.5;
        const text_color = "#000000";
        const bg_color = "Play Button";
        const font_size = 16;
        const buttonText = "Play";
        const font = "Arial";

        const eid = addEntity(APP.world);
        const playButton = createUIButton({
            width: btn_width,
            height: btn_height,
            backgroundColor: bg_color,
            textColor: text_color,
            text: buttonText,
            fontSize: font_size,
            font: font,
        });

        addObject3DComponent(APP.world, eid, playButton);
        // Add mouse events to the mesh
        addComponent(APP.world, CursorRaycastable, eid); // Raycast
        addComponent(APP.world, RemoteHoverTarget, eid); // Hover
        addComponent(APP.world, SingleActionButton, eid); // Click
        this.el.object3D.add(playButton);
    },

    tick: function () {
    },
});