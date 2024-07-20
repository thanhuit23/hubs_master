import { addComponent } from "bitecs";
import { HubsWorld } from "../app";
import { TFCText } from "../bit-components";

export type TFCTextParams = {
  text: string;
  fontName: string,
  fontUrl: string,
  fontSize: number;
  color: string;
  backgroundColor: string;
  lineHeight: number,
  lineSpace: number,
  width: number;
  paddingLeft: number,
  paddingTop: number,
  paddingRight: number,
  paddingBottom: number,
  align: string;
  autoOverflowWrap: boolean;
  wordBreak: string;
};

const DEFAULTS: Required<TFCTextParams> = {
  text: "",
  fontName: "Gulim",
  fontUrl: "",
  fontSize: 16,
  color: "#000000",
  backgroundColor: "#FFFFFF",
  lineHeight: 16,
  lineSpace: 2,
  width: 0,
  paddingLeft: 0,
  paddingTop: 0,
  paddingRight: 0,
  paddingBottom: 0,
  align: "left",
  autoOverflowWrap: false,
  wordBreak: "normal"
};

export function inflateTFCText(world: HubsWorld, eid: number, params: TFCTextParams) {
  //console.log("inflating a TFC Text Component ", {eid, params});
  const requiredParams = Object.assign({}, DEFAULTS, params) as Required<TFCTextParams>;
  addComponent(world, TFCText, eid);
  TFCText.text[eid] = APP.getSid(requiredParams.text);
  TFCText.fontName[eid] = APP.getSid(requiredParams.fontName);
  TFCText.fontUrl[eid] = APP.getSid(requiredParams.fontUrl);
  TFCText.fontSize[eid] = requiredParams.fontSize;
  TFCText.color[eid] = APP.getSid(requiredParams.color);
  TFCText.backgroundColor[eid] = APP.getSid(requiredParams.backgroundColor);
  TFCText.lineHeight[eid] = requiredParams.lineHeight;
  TFCText.lineSpace[eid] = requiredParams.lineSpace;
  TFCText.width[eid] = requiredParams.width;
  TFCText.paddingLeft[eid] = requiredParams.paddingLeft;
  TFCText.paddingTop[eid] = requiredParams.paddingTop;
  TFCText.paddingRight[eid] = requiredParams.paddingRight;
  TFCText.paddingBottom[eid] = requiredParams.paddingBottom;
  TFCText.align[eid] = APP.getSid(requiredParams.align);
  TFCText.autoOverflowWrap[eid] = requiredParams.autoOverflowWrap ? 1 : 0;
  TFCText.wordBreak[eid] = APP.getSid(requiredParams.wordBreak);
}

