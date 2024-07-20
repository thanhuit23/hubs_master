import { CameraPrefab, CubeMediaFramePrefab } from "../prefabs/camera-tool";
import { MediaPrefab } from "../prefabs/media";
import { PrefabDefinitionT, PrefabNameT } from "../types";

//////////////////////////////////////////////////////////////////////
// add
import { TFCNetworkedMediaDataParams, TFCNetworkedMediaDataPrefab } from "./tfc-networked-media-data";

// Thanh add
import { TFCNetworkedContentDataParams, TFCNetworkedContentDataPrefab } from "./tfc-networked-content-data";

import { TFCNetworkedLearningFrameDataParams, TFCNetworkedLearningFrameDataPrefab } from "./tfc-networked-learning-frame-data";

export type Permission =
  | "spawn_camera"
  | "spawn_and_move_media"
  | "update_hub"
  | "pin_objects"
  | "spawn_emoji"
  | "amplify_audio"
  | "fly"
  | "voice_chat"
  | "spawn_drawing"
  | "tweet"
  | "kick_users"
  | "mute_users";

export const prefabs = new Map<PrefabNameT, PrefabDefinitionT>();
prefabs.set("camera", { permission: "spawn_camera", template: CameraPrefab });
prefabs.set("cube", { permission: "spawn_and_move_media", template: CubeMediaFramePrefab });
prefabs.set("media", { permission: "spawn_and_move_media", template: MediaPrefab });

//////////////////////////////////////////////////////////////////////
// add
prefabs.set("tfc-networked-media-data", { permission: "spawn_and_move_media", template: TFCNetworkedMediaDataPrefab });

// Thanh add
prefabs.set("tfc-networked-content-data", { permission: "spawn_and_move_media", template: TFCNetworkedContentDataPrefab });

prefabs.set("tfc-networked-learning-frame-data", { permission: "spawn_and_move_media", template: TFCNetworkedLearningFrameDataPrefab });

