import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCMultipleImageLink } from "../bit-components";

export type TFCMultipleImageLinkParams = {
    horizontalBlocks: number;
    verticalBlocks: number;
    blockWidth: number;
    blockHeight: number;
    blockInterval: number;
    bottomPadding: number;
    showEmptyBlocks: boolean;
    imageLinkJSON: string;
};

const DEFAULTS: Required<TFCMultipleImageLinkParams> = {
  horizontalBlocks: 1,
  verticalBlocks: 1,
  blockWidth: 1.0,
  blockHeight: 1.0,
  blockInterval: 0.1,
  bottomPadding: 0.0,
  showEmptyBlocks: true,
  imageLinkJSON: ""
};

export function inflateTFCMultipleImageLink(world: HubsWorld, eid: number, params: TFCMultipleImageLinkParams) {
  console.log("inflating a TFC Multiple Image Link Component ", {eid, params});
  params = Object.assign({}, DEFAULTS, params) as Required<TFCMultipleImageLinkParams>;
  addComponent(world, TFCMultipleImageLink, eid);
  TFCMultipleImageLink.horizontalBlocks[eid] = params.horizontalBlocks;
  TFCMultipleImageLink.verticalBlocks[eid] = params.verticalBlocks;
  TFCMultipleImageLink.blockWidth[eid] = params.blockWidth;
  TFCMultipleImageLink.blockHeight[eid] = params.blockHeight;
  TFCMultipleImageLink.blockInterval[eid] = params.blockInterval;
  TFCMultipleImageLink.bottomPadding[eid] = params.bottomPadding;
  TFCMultipleImageLink.showEmptyBlocks[eid] = params.showEmptyBlocks ? 1 : 0;
  TFCMultipleImageLink.imageLinkJSON[eid] = APP.getSid(params.imageLinkJSON);
}
