import { TFCNetworkedLearningFrameData } from "../bit-components";
import { NetworkSchema } from "../utils/network-schemas";
import { defineNetworkSchema } from "../utils/define-network-schema";

const runtimeSerde = defineNetworkSchema(TFCNetworkedLearningFrameData);
export const TFCNetworkedLearningFrameDataSchema: NetworkSchema = {
  componentName: "tfc-networked-learning-frame-data",
  serialize: runtimeSerde.serialize,
  deserialize: runtimeSerde.deserialize
};

