import { TFCNetworkedMediaData } from "../bit-components";
import { NetworkSchema } from "../utils/network-schemas";
import { defineNetworkSchema } from "../utils/define-network-schema";

const runtimeSerde = defineNetworkSchema(TFCNetworkedMediaData);
export const TFCNetworkedMediaDataSchema: NetworkSchema = {
  componentName: "tfc-networked-media-data",
  serialize: runtimeSerde.serialize,
  deserialize: runtimeSerde.deserialize
};
