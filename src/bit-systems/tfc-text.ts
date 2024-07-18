import { TFCText } from "../bit-components";
import type { HubsWorld } from "../app";
import { defineQuery, enterQuery, exitQuery, addEntity } from "bitecs";
import { addObject3DComponent } from "../utils/jsx-entity";
import { createTextTexture } from "../tfl/ui/common/text";

const TFCTextQuery = defineQuery([TFCText]);
const TFCTextEnterQuery = enterQuery(TFCTextQuery);
const TFCTextExitQuery = exitQuery(TFCTextQuery);

export function TFCTextSystem(world: HubsWorld) {
    TFCTextEnterQuery(world).forEach(async(eid: number) => {
        //console.log("Enter Text Component", eid);

        // 텍스트
        const text = APP.getString(TFCText.text[eid])!;
        const fontName = APP.getString(TFCText.fontName[eid])!;
        const fontUrl = APP.getString(TFCText.fontUrl[eid])!;
        const fontSize = TFCText.fontSize[eid]!;
        const fontColorText = APP.getString(TFCText.color[eid])!;
        const backgroundColorText = APP.getString(TFCText.backgroundColor[eid])!;
        const lineHeight = TFCText.fontSize[eid]!;
        const lineSpace = TFCText.lineSpace[eid]!;
        const fixedWidth = TFCText.width[eid]!;
        const paddingLeft = TFCText.paddingLeft[eid]!;
        const paddingTop = TFCText.paddingTop[eid]!;
        const paddingRight = TFCText.paddingRight[eid]!;
        const paddingBottom = TFCText.paddingBottom[eid]!;
        const textAlign = APP.getString(TFCText.align[eid])!;
        const autoOverflowWrap = TFCText.autoOverflowWrap[eid] == 1 ? true : false;
        const wordBreak = APP.getString(TFCText.wordBreak[eid])!;

        // 객체 위치
        const textObject = world.eid2obj.get(eid)!;
        const textObjectPosition = new THREE.Vector3();
        textObject.getWorldPosition(textObjectPosition);
        //console.log("Text Position", textObjectPosition);

        // 객체 크기
        const textObjectScale = new THREE.Vector3();
        textObject.getWorldScale(textObjectScale);
        //console.log("Text Scale)", textObjectScale);

        textObject.visible = false;

        const textProperty = {
            text : text,
            fontName : fontName,
            fontUrl : fontUrl,
            fontSize: fontSize,
            fontColorText: fontColorText,
            backgroundColorText: backgroundColorText,
            lineHeight : lineHeight,
            lineSpace : lineSpace,
            fixedWidth: fixedWidth,
            paddingLeft : paddingLeft,
            paddingTop : paddingTop,
            paddingRight : paddingRight,
            paddingBottom : paddingBottom,
            textAlign: textAlign,
            autoOverflowWrap: autoOverflowWrap,
            wordBreak: wordBreak
        };
        const textTexture = await createTextTexture(textProperty);
        const texture = textTexture[0] as THREE.Texture;
        const textureProperty = textTexture[1] as any;

        // 평면 객체 생성
        const planeGeometry = new THREE.PlaneGeometry((textureProperty.textWidth / textureProperty.fontRatio) * textObjectScale.x, (textureProperty.textHeight / textureProperty.fontRatio) * textObjectScale.y);
        const planeMaterial = new THREE.MeshBasicMaterial({map: texture, transparent: true, side: THREE.DoubleSide});
        const textMesh = new THREE.Mesh(planeGeometry, planeMaterial);

        const textEid = addEntity(world);
        addObject3DComponent(world, textEid, textMesh);

        textMesh.position.set(textObjectPosition.x, textObjectPosition.y, textObjectPosition.z);
        world.scene.add(textMesh);
    });

    TFCTextExitQuery(world).forEach((eid: number) => {
        //console.log("Exit Text Component", eid);
    });
};

