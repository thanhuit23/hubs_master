import React from "react";
import PropTypes from "prop-types";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";



export function AIChatModal({ onClose, url }) {
    return (
        <div style={{ position: 'relative', width: '30%', height: '80%', marginLeft: 'auto', marginRight: '0' }}>
            <ToolbarButton
                icon={<LeaveIcon />}
                preset={"transparent"}
                onClick={onClose}
                style={{ position: 'absolute', top: 26, left: 20 }}
            />
            <iframe
                id="inlineFrameExample"
                title="반응과 반사의 구조"
                width="100%"
                height="100%"
                src={url} scrolling="no" style={{ borderWidth: 5 }} frameborder="10px" allow="xr-spatial-tracking">
            </iframe>

        </div>
    );
}

AIChatModal.propTypes = {
    onClose: PropTypes.func.isRequired
};