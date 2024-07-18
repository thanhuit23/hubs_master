/** @jsx createElementEntity */
import { createElementEntity } from "../utils/jsx-entity";

export type TFCNetworkedLearningFrameDataParams = {
    type: string;
    url: string;
    control: string;
    info: string;
    clientId: string;
};

export function TFCNetworkedLearningFrameDataPrefab(params: TFCNetworkedLearningFrameDataParams) {
    return (
        <entity
            name = "TFC Networked Learning Frame Data"
            networked
            tfcNetworkedLearningFrameData={{
                type: params.type,
                url: params.url,
                control: params.control,
                info: params.info,
                clientId: params.clientId
            }}
        />
    );
}

