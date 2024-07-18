import React from "react";
import PropTypes from "prop-types";
import { AIChatModal } from "./AIChatModal";

export function AIChatModalContainer({ url, onClose }) {
    return <AIChatModal onClose={onClose} url={url} />;
}

AIChatModalContainer.propTypes = {
    onClose: PropTypes.func
};