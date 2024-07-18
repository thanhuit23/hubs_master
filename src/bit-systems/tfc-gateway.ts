import { TFCGateway } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, addEntity } from "bitecs";
import { AElement } from "aframe";
import { isLocalHubsUrl, isHubsRoomUrl } from "../utils/media-url-utils";
import { changeHub } from "../change-hub";
import { handleExitTo2DInterstitial } from "../utils/vr-interstitial";

const TFCGatewayQuery = defineQuery([TFCGateway]);
const TFCGatewayEnterQuery = enterQuery(TFCGatewayQuery);
const TFCGatewayExitQuery = exitQuery(TFCGatewayQuery);

// 맵 Map<eid, {gatewayData}>
const gatewayMap = new Map();

export function TFCGatewaySystem(world: HubsWorld) {
    TFCGatewayQuery(world).forEach((eid: number) => {
        const gatewayData = gatewayMap.get(eid)!;
        if (gatewayData != null) {
            if (gatewayData.gatewayInit) {
                const avatarPov = (document.querySelector("#avatar-pov-node")! as AElement).object3D;
                const avatarPos = new THREE.Vector3();
                avatarPov.getWorldPosition(avatarPos);
                //console.log("Gateway avatarPov : ", avatarPos);

                let inOut : boolean = false;
                if (gatewayData.gatewayRangeList[0] <= avatarPos.x && avatarPos.x <= gatewayData.gatewayRangeList[1]) {
                    if (gatewayData.gatewayRangeList[2] <= avatarPos.z && avatarPos.z <= gatewayData.gatewayRangeList[3]) {
                        inOut = true;
                        //console.log("in", avatarPos.x, avatarPos.z, gatewayRangeList[0], gatewayRangeList[1], gatewayRangeList[2], gatewayRangeList[3]);
                    }
                }

                if (gatewayData.gatewayInOut != inOut) {
                    gatewayData.gatewayInOut = inOut;
                    gatewayMap.set(eid, gatewayData);
                    //console.log("Gateway State(In:true/Out:false)", gatewayInOut);
                    if (gatewayData.gatewayInOut) {
                        changeRoom(gatewayData.linkUrl);
                    }
                }
            }
        }
    });

    TFCGatewayEnterQuery(world).forEach(async(eid: number) => {
        //console.log("Enter TFC Gateway Component", eid);

        // 링크 URL
        const linkUrl = APP.getString(TFCGateway.linkUrl[eid])!;

        // 객체 위치
        const gatewayObject = world.eid2obj.get(eid)!;
        const gatewayObjectPosition = new THREE.Vector3();
        gatewayObject.getWorldPosition(gatewayObjectPosition);
        //console.log("Gateway Position", gatewayObjectPosition);

        // 객체 크기
        const gatewayObjectScale = new THREE.Vector3();
        gatewayObject.getWorldScale(gatewayObjectScale);
        //console.log("Gateway Scale)", gatewayObjectScale);

        //console.log(gatewayObject);

        // 객체 영역 리스트(left, right, top, bottom)
        const gatewayRangeList : Array<number> = [];
        gatewayRangeList.push(gatewayObjectPosition.x - (gatewayObjectScale.x / 2)); // left
        gatewayRangeList.push(gatewayObjectPosition.x + (gatewayObjectScale.x / 2)); // right
        gatewayRangeList.push(gatewayObjectPosition.z - (gatewayObjectScale.z / 2)); // top
        gatewayRangeList.push(gatewayObjectPosition.z + (gatewayObjectScale.z / 2)); // bottom

        const gatewayData = {
            gatewayInit: true, // 초기화 여부
            gatewayRangeList: gatewayRangeList, // 객체 영역 리스트
            gatewayInOut: false, // 아바타가 객체안에 있는지 여부
            linkUrl: linkUrl // 링크 URL
        };
        gatewayMap.set(eid, gatewayData);
    });

    TFCGatewayExitQuery(world).forEach((eid: number) => {
        //console.log("Exit TFC Gateway Component", eid);
        gatewayMap.delete(eid);
    });
};

async function changeRoom(linkUrl: string) {
    if (linkUrl == null || linkUrl == undefined) {
        return;
    }

    const currnetHubId = await isHubsRoomUrl(window.location.href);
    //console.log("currnet HubId :", currnetHubId);

    const exitImmersive = async () => await handleExitTo2DInterstitial(false, () => {}, true);

    let gotoHubId;
    // URL이 허브 룸인지 확인
    if ((gotoHubId = await isHubsRoomUrl(linkUrl))) {
        //console.log("go to HubId", gotoHubId);
        const url = new URL(linkUrl);
        if (currnetHubId === gotoHubId && url.hash) {
            // 같은 방에서 Way Point으로 이동할 경우
            window.history.replaceState(null, "", window.location.href.split("#")[0] + url.hash);
        } else if (await isLocalHubsUrl(linkUrl)) {
            // 같은 도메인에 있는 허브 경로일 경우
            let waypoint = "";
            if (url.hash) {
                waypoint = url.hash.substring(1);
            }
            // 페이지 로드 또는 입장 진행 없이 새 방으로
            changeHub(gotoHubId, true, waypoint);
        } else {
            await exitImmersive();
            location.href = linkUrl;
        }
    }
}
