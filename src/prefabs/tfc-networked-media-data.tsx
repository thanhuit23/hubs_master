/** @jsx createElementEntity */
import { createElementEntity } from "../utils/jsx-entity";

export type TFCNetworkedMediaDataParams = {
    type: string;
    url: string;
    control: string;
    info: string;
    clientId: string;
};

export function TFCNetworkedMediaDataPrefab(params: TFCNetworkedMediaDataParams) {
    return (
        <entity
            name = "TFC Networked Media Data"
            networked
            tfcNetworkedMediaData={{
                type: params.type,
                url: params.url,
                control: params.control,
                info: params.info,
                clientId: params.clientId
            }}
        />
    );
}
