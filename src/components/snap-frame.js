// Thanh add
import { isLocalHubsUrl, isHubsRoomUrl } from "../utils/media-url-utils";
import { changeHub } from "../change-hub";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";
import { findAncestorWithComponent } from "../utils/scene-graph";

AFRAME.registerComponent("snap-frame", {
    schema: {
        snapCondition: { type: "string", default: "" },
        snapConditionData: { type: "string", default: "" },
        snapAction: { type: "string", default: "" },
        snapData: { type: "string", default: "" },
    },

    init: function () {
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.el.addEventListener('mouseup', this.handleMouseUp);
        this.el.addEventListener('mousedown', this.handleMouseDown);
    },

    handleMouseUp: function (event) {
        // Handle mouse up event
        console.log("handleMouseUp");
    },

    handleMouseDown: function (event) {
        // Handle mouse down event
        console.log("handleMouseDown");
    },

    update: function () {
    },

    tick: function () {
        if (!this.player) return;
    },

    remove: function () {
        this.el.removeEventListener('mouseup', this.handleMouseUp);
        this.el.removeEventListener('mousedown', this.handleMouseDown);
        this.el.removeObject3D("snap-frame");
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

