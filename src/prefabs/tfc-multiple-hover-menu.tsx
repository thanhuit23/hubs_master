/** @jsx createElementEntity */
import { ArrayVec3, Attrs, createElementEntity, createRef } from "../utils/jsx-entity";
import { BUTTON_TYPES, Button3D } from "./button3D";

const BUTTON_HEIGHT = 0.3;
const BUTTON_WIDTH = 0.3;
const BUTTON_SCALE: ArrayVec3 = [1.0, 1.0, 1.0];
const BUTTON1_POSITION: ArrayVec3 = [-0.5, 0.5, 1.001];
const BUTTON2_POSITION: ArrayVec3 = [-0.5, -0.5, 1.001];
const BUTTON3_POSITION: ArrayVec3 = [0, 0.5, 1.001];
const BUTTON4_POSITION: ArrayVec3 = [0, -0.5, 1.001];
const BUTTON5_POSITION: ArrayVec3 = [0.5, 0.5, 1.001];
const BUTTON6_POSITION: ArrayVec3 = [0.5, -0.5, 1.001];

interface multipleButtonProps extends Attrs {
    text: string;
    tfcMultipleHoverMenuItem: boolean;
}

function LinkButton(props: multipleButtonProps) {
  return (
    <Button3D
      name={props.name}
      height={BUTTON_HEIGHT}
      scale={BUTTON_SCALE}
      type={BUTTON_TYPES.ACTION}
      width={BUTTON_WIDTH}
      {...props}
    />
  );
}

export function TFCMultipleHoverMenuPrefab() {
  const button1Ref = createRef();
  const button2Ref = createRef();
  const button3Ref = createRef();
  const button4Ref = createRef();
  const button5Ref = createRef();
  const button6Ref = createRef();

  return (
    <entity
      name="TFC Multiple Hover Menu"
      tfcMultipleHoverMenu={{
        button1Ref: button1Ref,
        button2Ref: button2Ref,
        button3Ref: button3Ref,
        button4Ref: button4Ref,
        button5Ref: button5Ref,
        button6Ref: button6Ref
      }}
    >
      <LinkButton ref={button1Ref} name="Button1" text="X+" position={BUTTON1_POSITION} tfcMultipleHoverMenuItem />
      <LinkButton ref={button2Ref} name="Button2" text="X-" position={BUTTON2_POSITION} tfcMultipleHoverMenuItem />
      <LinkButton ref={button3Ref} name="Button3" text="Y+" position={BUTTON3_POSITION} tfcMultipleHoverMenuItem />
      <LinkButton ref={button4Ref} name="Button4" text="Y-" position={BUTTON4_POSITION} tfcMultipleHoverMenuItem />
      <LinkButton ref={button5Ref} name="Button5" text="Z+" position={BUTTON5_POSITION} tfcMultipleHoverMenuItem />
      <LinkButton ref={button6Ref} name="Button6" text="Z-" position={BUTTON6_POSITION} tfcMultipleHoverMenuItem />
    </entity>
  );
}

