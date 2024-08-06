import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { WebGLContentModal } from "./WebGLContentModal";

export function WebGLContentModalContainer({ scene, url, onClose }) {
    const handleClose = useCallback(() => {
        console.log("User closed the iframe");
        onClose();
    }, [onClose]);

    return <WebGLContentModal onClose={handleClose} url={url} />;
}

WebGLContentModalContainer.propTypes = {
    scene: PropTypes.object.isRequired,
    onClose: PropTypes.func
};