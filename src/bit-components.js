import { defineComponent, setDefaultSize, setRemovedRecycleThreshold, Types } from "bitecs";

// TODO this has to happen before all components are defined. Is there a better spot to be doing this?
setDefaultSize(10000);
setRemovedRecycleThreshold(0.2);

export const $isStringType = Symbol("isStringType");

export const Networked = defineComponent({
  id: Types.ui32,
  creator: Types.ui32,
  owner: Types.ui32,
  lastOwnerTime: Types.ui32,
  timestamp: Types.ui32
});
Networked.id[$isStringType] = true;
Networked.creator[$isStringType] = true;
Networked.owner[$isStringType] = true;

export const Owned = defineComponent();
export const EntityStateDirty = defineComponent();
export const NetworkedMediaFrame = defineComponent({
  capturedNid: Types.ui32,
  scale: [Types.f32, 3],
  flags: Types.ui8,
  mediaType: Types.ui8
});
NetworkedMediaFrame.capturedNid[$isStringType] = true;

export const MediaFrame = defineComponent({
  capturedNid: Types.ui32,
  scale: [Types.f32, 3],
  mediaType: Types.ui8,
  bounds: [Types.f32, 3],
  align: [Types.ui8, 3],
  guide: Types.eid,
  preview: Types.eid,
  previewingNid: Types.eid,
  flags: Types.ui8
});
export const MediaRoot = defineComponent();
export const NetworkedText = defineComponent({
  text: Types.ui8,
  anchorX: Types.ui8,
  anchorY: Types.ui8,
  color: Types.ui32,
  curveRadius: Types.f32,
  direction: Types.ui8,
  fillOpacity: Types.f32,
  fontUrl: Types.ui8,
  fontSize: Types.f32,
  letterSpacing: Types.f32,
  lineHeight: Types.ui8,
  textAlign: Types.ui8,
  outlineWidth: Types.ui8,
  outlineColor: Types.ui32,
  outlineBlur: Types.ui8,
  outlineOffsetX: Types.ui8,
  outlineOffsetY: Types.ui8,
  outlineOpacity: Types.f32,
  strokeWidth: Types.ui8,
  strokeColor: Types.ui32,
  strokeOpacity: Types.ui32,
  textIndent: Types.ui32,
  whiteSpace: Types.ui8,
  overflowWrap: Types.ui8,
  opacity: Types.f32,
  side: Types.ui8,
  maxWidth: Types.f32
});
NetworkedText.text[$isStringType] = true;
NetworkedText.lineHeight[$isStringType] = true;
NetworkedText.outlineWidth[$isStringType] = true;
NetworkedText.outlineBlur[$isStringType] = true;
NetworkedText.outlineOffsetX[$isStringType] = true;
NetworkedText.outlineOffsetY[$isStringType] = true;
NetworkedText.strokeWidth[$isStringType] = true;
export const TextTag = defineComponent();
export const ReflectionProbe = defineComponent();
export const Slice9 = defineComponent({
  insets: [Types.ui32, 4],
  size: [Types.f32, 2]
});
export const NetworkedTransform = defineComponent({
  position: [Types.f32, 3],
  rotation: [Types.f32, 4],
  scale: [Types.f32, 3]
});
export const AEntity = defineComponent();
export const Object3DTag = defineComponent();
export const GLTFModel = defineComponent();
export const LightTag = defineComponent();
export const AmbientLightTag = defineComponent();
export const DirectionalLight = defineComponent();
export const HemisphereLightTag = defineComponent();
export const PointLightTag = defineComponent();
export const SpotLightTag = defineComponent();
export const CursorRaycastable = defineComponent();
export const RemoteHoverTarget = defineComponent();
export const NotRemoteHoverTarget = defineComponent();
export const Holdable = defineComponent({
  flags: Types.ui8
});
export const RemoveNetworkedEntityButton = defineComponent();
export const Interacted = defineComponent();
export const HandRight = defineComponent();
export const HandLeft = defineComponent();
export const RemoteRight = defineComponent();
export const RemoteLeft = defineComponent();
export const HoveredHandRight = defineComponent();
export const HoveredHandLeft = defineComponent();
export const HoveredRemoteRight = defineComponent();
export const HoveredRemoteLeft = defineComponent();
export const HoverableVisuals = defineComponent({
  geometryRadius: Types.f32
});
/**
 * @type {Map<EntityId, Uniform[]}>}
 */
export const HoverableVisualsUniforms = new Map();
export const HeldHandRight = defineComponent();
export const HeldHandLeft = defineComponent();
export const HeldRemoteRight = defineComponent();
export const HeldRemoteLeft = defineComponent();
export const Held = defineComponent();
export const Constraint = defineComponent();
export const ConstraintHandRight = defineComponent();
export const ConstraintHandLeft = defineComponent();
export const ConstraintRemoteRight = defineComponent();
export const ConstraintRemoteLeft = defineComponent();
export const OffersRemoteConstraint = defineComponent();
export const HandCollisionTarget = defineComponent();
export const OffersHandConstraint = defineComponent();
export const TogglesHoveredActionSet = defineComponent();
export const HoverButton = defineComponent({ type: Types.ui8 });
export const TextButton = defineComponent({ labelRef: Types.eid });
export const HoldableButton = defineComponent();
export const SingleActionButton = defineComponent();
export const Pen = defineComponent();
export const PenActive = defineComponent();
export const PenUpdated = defineComponent();
export const HoverMenuChild = defineComponent();
export const Static = defineComponent();
export const Inspectable = defineComponent({
  flags: Types.ui8
});
export const Inspected = defineComponent();
export const PreventAudioBoost = defineComponent();
export const IgnoreSpaceBubble = defineComponent();
export const Rigidbody = defineComponent({
  bodyId: Types.ui16,
  mass: Types.f32,
  gravity: [Types.f32, 3],
  linearDamping: Types.f32,
  angularDamping: Types.f32,
  linearSleepingThreshold: Types.f32,
  angularSleepingThreshold: Types.f32,
  angularFactor: [Types.f32, 3],
  type: Types.ui8,
  activationState: Types.ui8,
  collisionFilterGroup: Types.ui32,
  collisionFilterMask: Types.ui32,
  flags: Types.ui8,
  initialCollisionFilterMask: Types.ui32
});
export const NetworkedRigidBody = defineComponent({
  prevType: Types.ui8
});
export const PhysicsShape = defineComponent({
  bodyId: Types.ui16,
  shapeId: Types.ui16,
  type: Types.ui8,
  fit: Types.ui8,
  halfExtents: [Types.f32, 3],
  minHalfExtent: Types.f32,
  maxHalfExtent: Types.f32,
  sphereRadius: Types.f32,
  cylinderAxis: Types.ui8,
  margin: Types.f32,
  offset: [Types.f32, 3],
  orientation: [Types.f32, 4],
  heightfieldData: [Types.f32],
  heightfieldDistance: Types.f32,
  flags: Types.ui8
});
export const DestroyAtExtremeDistance = defineComponent();
export const MediaLoading = defineComponent();
export const FloatyObject = defineComponent({ flags: Types.ui8, releaseGravity: Types.f32 });
export const NetworkedFloatyObject = defineComponent({ flags: Types.ui8 });
export const MakeKinematicOnRelease = defineComponent();
export const CameraTool = defineComponent({
  snapTime: Types.f32,
  state: Types.ui8,
  captureDurIdx: Types.ui8,
  trackTarget: Types.eid,

  snapMenuRef: Types.eid,
  nextButtonRef: Types.eid,
  prevButtonRef: Types.eid,
  snapRef: Types.eid,
  cancelRef: Types.eid,
  recVideoRef: Types.eid,
  screenRef: Types.eid,
  selfieScreenRef: Types.eid,
  cameraRef: Types.eid,
  countdownLblRef: Types.eid,
  captureDurLblRef: Types.eid,
  sndToggleRef: Types.eid
});
export const MyCameraTool = defineComponent();
export const MediaLoader = defineComponent({
  src: Types.ui32,
  flags: Types.ui8,
  fileId: Types.ui32,
  count: Types.ui8,
  mediaRef: Types.eid
});
MediaLoader.src[$isStringType] = true;
MediaLoader.fileId[$isStringType] = true;
export const MediaLoaderOffset = defineComponent();
export const MediaLoaded = defineComponent();
export const LoadedByMediaLoader = defineComponent();
export const MediaRefresh = defineComponent();
export const MediaContentBounds = defineComponent({
  bounds: [Types.f32, 3]
});
export const MediaInfo = defineComponent({
  accessibleUrl: Types.ui32,
  contentType: Types.ui32,
  mediaType: Types.ui8
});
MediaInfo.accessibleUrl[$isStringType] = true;
MediaInfo.contentType[$isStringType] = true;

// MediaImageLoaderData and MediaVideoLoaderData are
// for parameters that are set at glTF inflators
// inflateImageLoader and inflateVideoLoader and
// are needed to be transported to util image/audio loaders.
// They are handled as part of MediaLoader component data.

/**
 * @type {Map<EntityId, {
 *   alphaCutoff: number,
 *   alphaMode: AlphaMode,
 *   projection: ProjectionMode
 * }>}
 */
export const MediaImageLoaderData = new Map();

/**
 * @type {Map<EntityId, {
 *   loop: boolean,
 *   autoPlay: boolean,
 *   controls: boolean,
 *   projection: ProjectionMode
 * }>}
 */
export const MediaVideoLoaderData = new Map();

export const SceneRoot = defineComponent();
export const NavMesh = defineComponent();
export const SceneLoader = defineComponent({ src: Types.ui32 });
SceneLoader.src[$isStringType] = true;

export const MediaImage = defineComponent({
  cacheKey: Types.ui32,
  projection: Types.ui8,
  alphaMode: Types.ui8,
  alphaCutoff: Types.f32
});
MediaImage.cacheKey[$isStringType] = true;

export const NetworkedPDF = defineComponent({
  pageNumber: Types.ui8
});
export const MediaPDF = defineComponent({
  pageNumber: Types.ui8
});
MediaPDF.map = new Map();
export const MediaPDFUpdated = defineComponent({
  pageNumber: Types.ui8
});

export const MediaVideo = defineComponent({
  ratio: Types.f32,
  flags: Types.ui8,
  projection: Types.ui8,
  lastUpdate: Types.ui32
});
export const MediaVideoUpdated = defineComponent();
/**
 * @type {Map<EntityId, HTMLVideoElement}>}
 */
export const MediaVideoData = new Map();
export const MixerAnimatableInitialize = defineComponent({});
export const MixerAnimatable = defineComponent({});
/**
 * @type {Map<EntityId, AnimationMixer}>}
 */
export const MixerAnimatableData = new Map();
export const LoopAnimationInitialize = defineComponent({});
/**
 * @type {Map<EntityId, {
 *          activeClipIndices: number[],
 *          clip: number,
 *          paused: boolean,
 *          startOffset: number,
 *          timeScale: number
 *        }[]>}
 */
export const LoopAnimationInitializeData = new Map();
export const LoopAnimation = defineComponent();
/**
 * @type {Map<EntityId, AnimationAction[]>}
 */
export const LoopAnimationData = new Map();
export const NetworkedVideo = defineComponent({
  src: Types.ui8,
  time: Types.f32,
  flags: Types.ui8,
  projection: Types.ui8
});
NetworkedVideo.src[$isStringType] = true;
export const VideoMenuItem = defineComponent();
export const VideoMenu = defineComponent({
  videoRef: Types.eid,
  sliderRef: Types.eid,
  timeLabelRef: Types.eid,
  trackRef: Types.eid,
  headRef: Types.eid,
  playIndicatorRef: Types.eid,
  pauseIndicatorRef: Types.eid,
  snapRef: Types.eid,
  volUpRef: Types.eid,
  volDownRef: Types.eid,
  clearTargetTimer: Types.f64
});
export const AudioEmitter = defineComponent({
  flags: Types.ui8
});
AudioEmitter.audios = new Map();
AudioEmitter.params = new Map();
export const AudioSettingsChanged = defineComponent();
export const Deletable = defineComponent();
export const Deleting = defineComponent();
export const EnvironmentSettings = defineComponent();
EnvironmentSettings.map = new Map();

// TODO: Store this data elsewhere, since only one or two will ever exist.
export const ObjectMenu = defineComponent({
  backgroundRef: Types.eid,
  pinButtonRef: Types.eid,
  unpinButtonRef: Types.eid,
  cameraFocusButtonRef: Types.eid,
  cameraTrackButtonRef: Types.eid,
  removeButtonRef: Types.eid,
  dropButtonRef: Types.eid,
  inspectButtonRef: Types.eid,
  deserializeDrawingButtonRef: Types.eid,
  openLinkButtonRef: Types.eid,
  refreshButtonRef: Types.eid,
  cloneButtonRef: Types.eid,
  rotateButtonRef: Types.eid,
  mirrorButtonRef: Types.eid,
  scaleButtonRef: Types.eid,
  targetRef: Types.eid,
  handlingTargetRef: Types.eid,
  flags: Types.ui8
});
export const ObjectDropped = defineComponent();
export const MediaMirrored = defineComponent({
  linkedRef: Types.eid
});
export const MirroredMedia = defineComponent({
  linkedRef: Types.eid
});
export const LinkedMedia = defineComponent({
  linkedRef: Types.eid
});
export const FollowInFov = defineComponent({
  offset: [Types.f32, 3],
  angle: Types.f32,
  speed: Types.f32,
  started: Types.ui8
});
export const MirrorMenu = defineComponent({
  closeRef: Types.eid,
  mirrorTargetRef: Types.eid,
  flags: Types.ui8
});
export const AvatarPOVNode = defineComponent();
// TODO: Store this data elsewhere, since only one or two will ever exist.
export const LinkHoverMenu = defineComponent({
  targetObjectRef: Types.eid,
  linkButtonRef: Types.eid,
  clearTargetTimer: Types.f64
});
export const LinkHoverMenuItem = defineComponent();
export const Link = defineComponent({
  url: Types.ui32,
  type: Types.ui8
});
Link.url[$isStringType] = true;
export const LinkInitializing = defineComponent();
// TODO: Store this data elsewhere, since only one or two will ever exist.
export const PDFMenu = defineComponent({
  prevButtonRef: Types.eid,
  nextButtonRef: Types.eid,
  pageLabelRef: Types.eid,
  snapRef: Types.eid,
  targetRef: Types.eid,
  clearTargetTimer: Types.f64
});
export const ObjectMenuTarget = defineComponent({
  flags: Types.ui8
});
export const MediaSnapped = defineComponent();
export const NetworkDebug = defineComponent();
export const NetworkDebugRef = defineComponent({
  ref: Types.eid
});
export const Waypoint = defineComponent({
  flags: Types.ui8
});
export const NetworkedWaypoint = defineComponent({
  occupied: Types.ui8
});
export const WaypointPreview = defineComponent();
export const Skybox = defineComponent();
export const ObjectSpawner = defineComponent({
  src: Types.ui32,
  flags: Types.ui8
});
export const Billboard = defineComponent({
  onlyY: Types.ui8
});
export const MaterialTag = defineComponent();
export const TextureTag = defineComponent();
export const UVScroll = defineComponent({
  speed: [Types.f32, 2],
  increment: [Types.f32, 2],
  offset: [Types.f32, 2]
});
export const VideoTextureSource = defineComponent({
  fps: Types.ui8,
  resolution: [Types.ui16, 2]
});
export const VideoTextureTarget = defineComponent({
  source: Types.eid,
  flags: Types.ui8
});
export const SimpleWater = defineComponent();
export const Mirror = defineComponent();
export const ParticleEmitterTag = defineComponent({
  src: Types.ui32
});
export const AudioZone = defineComponent({
  flags: Types.ui8
});
export const AudioTarget = defineComponent({
  minDelay: Types.ui32,
  maxDelay: Types.ui32,
  source: Types.eid,
  flags: Types.ui8
});
export const AudioSource = defineComponent({
  flags: Types.ui8
});
export const AudioParams = defineComponent();
export const ScenePreviewCamera = defineComponent({
  duration: Types.f32,
  positionOnly: Types.ui8
});
export const LinearTranslate = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32
});
export const LinearRotate = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32,
  targetW: Types.f32
});
export const LinearScale = defineComponent({
  duration: Types.f32,
  targetX: Types.f32,
  targetY: Types.f32,
  targetZ: Types.f32
});
export const TrimeshTag = defineComponent();
export const HeightFieldTag = defineComponent();
export const LocalAvatar = defineComponent();
export const RemoteAvatar = defineComponent();
export const MediaLink = defineComponent({
  src: Types.ui32
});
MediaLink.src[$isStringType] = true;
export const ObjectMenuTransform = defineComponent({
  targetObjectRef: Types.eid,
  prevObjectRef: Types.eid,
  flags: Types.ui8
});



//////////////////////////////////////////////////////////////////////
// add component
export const Hello = defineComponent({
  message: Types.ui32,
  rotationX: Types.f32,
  rotationY: Types.f32,
  rotationZ: Types.f32
});
Hello.message[$isStringType] = true;

// TFC(Tekville Foundation Component)
export const TFCImageLink = defineComponent({
  imageUrl: Types.ui32,
  linkUrl: Types.ui32,
  layerPopup: Types.ui8
});
TFCImageLink.imageUrl[$isStringType] = true;
TFCImageLink.linkUrl[$isStringType] = true;

// TFC(Tekville Foundation Component)
export const TFCLink = defineComponent({
  linkUrl: Types.ui32,
  layerPopup: Types.ui8
});
TFCLink.linkUrl[$isStringType] = true;

// TFC(Tekville Foundation Component)
// TFC Link Hover Menu
export const TFCLinkHoverMenu = defineComponent({
  targetObjectRef: Types.eid,
  linkButtonRef: Types.eid
});
// TFC Link Hover Menu Item
export const TFCLinkHoverMenuItem = defineComponent();

// TFC Multiple Hover Menu
export const TFCMultipleHoverMenu = defineComponent({
  targetObjectRef: Types.eid,
  button1Ref: Types.eid,
  button2Ref: Types.eid,
  button3Ref: Types.eid,
  button4Ref: Types.eid,
  button5Ref: Types.eid,
  button6Ref: Types.eid
});
// TFC Multiple Hover Menu Item
export const TFCMultipleHoverMenuItem = defineComponent();

// TFC Multiple Image Link
export const TFCMultipleImageLink = defineComponent({
  horizontalBlocks: Types.ui8,
  verticalBlocks: Types.ui8,
  blockWidth: Types.f32,
  blockHeight: Types.f32,
  blockInterval: Types.f32,
  bottomPadding: Types.f32,
  showEmptyBlocks: Types.ui8,
  imageLinkJSON: Types.ui32
});
TFCMultipleImageLink.imageLinkJSON[$isStringType] = true;

// TFC Multiple Media Video
export const TFCMultipleMediaVideo = defineComponent({
  source: Types.ui32
});
TFCMultipleMediaVideo.source[$isStringType] = true;
export const TFCMultipleMediaVideoLink = defineComponent({
  targetObjectRef: Types.eid,
  url: Types.ui32
});
TFCMultipleMediaVideoLink.url[$isStringType] = true;

// TFC Multiple Media
export const TFCMultipleMedia = defineComponent({
  source: Types.ui32
});
TFCMultipleMedia.source[$isStringType] = true;
// TFC Multiple Media Link
export const TFCMultipleMediaLink = defineComponent({
  targetObjectRef: Types.eid,
  type: Types.ui32,
  url: Types.ui32,
  info: Types.ui32
});
TFCMultipleMediaLink.type[$isStringType] = true;
TFCMultipleMediaLink.url[$isStringType] = true;
TFCMultipleMediaLink.info[$isStringType] = true;
// TFC Multiple Media Frame
export const TFCMultipleMediaFrame = defineComponent({
  videoProgressRef: Types.eid,
  videoProgressWidth: Types.f32
});
// TFC Multiple Media Hover Menu Item
export const TFCMultipleMediaHoverMenuItem = defineComponent();

// TFC Networked Multiple Media
export const TFCNetworkedMultipleMedia = defineComponent({
  source: Types.ui32
});
// TFC Networked Media Data
export const TFCNetworkedMediaData = defineComponent({
  type: Types.ui32,
  url: Types.ui32,
  control: Types.ui32,
  info: Types.ui32,
  clientId: Types.ui32
});
TFCNetworkedMediaData.type[$isStringType] = true;
TFCNetworkedMediaData.url[$isStringType] = true;
TFCNetworkedMediaData.control[$isStringType] = true;
TFCNetworkedMediaData.info[$isStringType] = true;
TFCNetworkedMediaData.clientId[$isStringType] = true;

// TFC Controls Hover
export const TFCControlsFolderHover = defineComponent();
export const TFCControlsItemHover = defineComponent()

// TFC TabControls Hover
export const TFCTabControlsTabHover = defineComponent();

// TFC MenuControls Hover
export const TFLMenuControlsMenuHover = defineComponent();
export const TFLMenuControlsSubMenuHover = defineComponent();

// TFC MenuPopControls Hover
export const TFLMenuPopControlsMenu = defineComponent();
export const TFLMenuPopControlsSubMenu = defineComponent();
export const TFLMenuPopControlsPopClose = defineComponent();

// Thanh add
// TFC Networked Content Data
export const TFCNetworkedContentData = defineComponent({
  type: Types.ui32,
  steps: Types.ui32,
  control: Types.ui32,
  clientId: Types.ui32
});
TFCNetworkedContentData.type[$isStringType] = true;
TFCNetworkedContentData.control[$isStringType] = true;
TFCNetworkedContentData.clientId[$isStringType] = true;
// TFCNetworkedContentData.steps[$isStringType] = true;
//

// Thanh add
export const TFCMyThreeJS = defineComponent({
  category: Types.ui32,
  unit: Types.ui32
});
TFCMyThreeJS.category[$isStringType] = true;
TFCMyThreeJS.unit[$isStringType] = true;

export const TFCMYThreeJSSliderBar = defineComponent({
  name: Types.ui32,
  targetObjectRef: Types.eid
});
TFCMYThreeJSSliderBar.name[$isStringType] = true;

export const TFCMyThreeJSButton = defineComponent({
  name: Types.ui32,
  targetObjectRef: Types.eid
});
TFCMyThreeJSButton.name[$isStringType] = true;

export const TFCNetworkedSyncButton = defineComponent({
  targetObjectRef: Types.eid,
  type: Types.ui32,
  steps: Types.ui32,
  control: Types.ui32,
  clientId: Types.ui32
});
TFCNetworkedSyncButton.type[$isStringType] = true;
TFCNetworkedSyncButton.control[$isStringType] = true;
TFCNetworkedSyncButton.steps[$isStringType] = true;
TFCNetworkedSyncButton.clientId[$isStringType] = true;

// TFC Gateway Link
export const TFCGatewayLink = defineComponent({
  visible: Types.ui8,
  linkUrl: Types.ui32,
});
TFCGatewayLink.linkUrl[$isStringType] = true;

// TFC Gateway
export const TFCGateway = defineComponent({
  linkUrl: Types.ui32
});
TFCGateway.linkUrl[$isStringType] = true;

export const TFCMyWebGLButton = defineComponent({
  action: Types.ui32,
  content: Types.ui32,
  buttonImage: Types.ui32,
  buttonLink: Types.ui32,
  buttonText: Types.ui32,
});
TFCMyWebGLButton.action[$isStringType] = true;
TFCMyWebGLButton.content[$isStringType] = true;
TFCMyWebGLButton.buttonImage[$isStringType] = true;
TFCMyWebGLButton.buttonLink[$isStringType] = true;
TFCMyWebGLButton.buttonText[$isStringType] = true;

export const TFCMagicButton = defineComponent({
  action: Types.ui32,
  content: Types.ui32,
  buttonImage: Types.ui32,
  buttonLink: Types.ui32,
  buttonText: Types.ui32,
});
TFCMagicButton.action[$isStringType] = true;
TFCMagicButton.content[$isStringType] = true;
TFCMagicButton.buttonImage[$isStringType] = true;
TFCMagicButton.buttonLink[$isStringType] = true;
TFCMagicButton.buttonText[$isStringType] = true;

// Thanh Add
export const TFCKeyboardButton = defineComponent({
  action: Types.ui32,
  value: Types.ui32,
  buttonImage: Types.ui32,
  buttonLink: Types.ui32,
  buttonText: Types.ui32,
});
TFCKeyboardButton.action[$isStringType] = true;
TFCKeyboardButton.value[$isStringType] = true;
TFCKeyboardButton.buttonImage[$isStringType] = true;
TFCKeyboardButton.buttonLink[$isStringType] = true;
TFCKeyboardButton.buttonText[$isStringType] = true;

export const TFCIframe = defineComponent({
  href: Types.ui32,
});
TFCIframe.href[$isStringType] = true;
//

// TFC Learning Frame
export const TFCLearningFrame = defineComponent({
  source: Types.ui32
});
TFCLearningFrame.source[$isStringType] = true;
// TFC Networked Learning Frame Data
export const TFCNetworkedLearningFrameData = defineComponent({
  type: Types.ui32,
  url: Types.ui32,
  control: Types.ui32,
  info: Types.ui32,
  clientId: Types.ui32
});
TFCNetworkedLearningFrameData.type[$isStringType] = true;
TFCNetworkedLearningFrameData.url[$isStringType] = true;
TFCNetworkedLearningFrameData.control[$isStringType] = true;
TFCNetworkedLearningFrameData.info[$isStringType] = true;
TFCNetworkedLearningFrameData.clientId[$isStringType] = true;
// TFC Learning Frame Link
export const TFCLearningFrameLink = defineComponent({
  targetObjectRef: Types.eid,
  type: Types.ui32,
  url: Types.ui32,
  info: Types.ui32
});
TFCLearningFrameLink.type[$isStringType] = true;
TFCLearningFrameLink.url[$isStringType] = true;
TFCLearningFrameLink.info[$isStringType] = true;

// TFC Text
export const TFCText = defineComponent({
  text: Types.ui32,
  fontName: Types.ui32,
  fontUrl: Types.ui32,
  fontSize: Types.f32,
  color: Types.ui32,
  backgroundColor: Types.ui32,
  lineHeight: Types.f32,
  lineSpace: Types.f32,
  width: Types.f32,
  paddingLeft: Types.f32,
  paddingTop: Types.f32,
  paddingRight: Types.f32,
  paddingBottom: Types.f32,
  align: Types.ui32,
  autoOverflowWrap: Types.ui8,
  wordBreak: Types.ui32
});
TFCText.text[$isStringType] = true;
TFCText.fontName[$isStringType] = true;
TFCText.fontUrl[$isStringType] = true;
TFCText.color[$isStringType] = true;
TFCText.backgroundColor[$isStringType] = true;
TFCText.align[$isStringType] = true;
TFCText.wordBreak[$isStringType] = true;
