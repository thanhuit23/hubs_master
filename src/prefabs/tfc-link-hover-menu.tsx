/** @jsx createElementEntity */
import { ArrayVec3, Attrs, createElementEntity, createRef } from "../utils/jsx-entity";
import { BUTTON_TYPES, Button3D } from "./button3D";

const BUTTON_HEIGHT = 0.2;
const BUTTON_WIDTH = 0.6;
const BUTTON_SCALE: ArrayVec3 = [1.0, 1.0, 1.0];
const BUTTON_POSITION: ArrayVec3 = [0, 0, 0.001];

interface LinkButtonProps extends Attrs {
  text: string;
  tfcLinkHoverMenuItem: boolean;
}

function LinkButton(props: LinkButtonProps) {
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

export function TFCLinkHoverMenuPrefab() {
  const buttonRef = createRef();

  return (
    <entity
      name="TFC Link Hover Menu"
      tfcLinkHoverMenu={{
        linkButtonRef: buttonRef
      }}
    >
      <LinkButton ref={buttonRef} name="Link Button" text="open Link" position={BUTTON_POSITION} tfcLinkHoverMenuItem />
    </entity>
  );
}

