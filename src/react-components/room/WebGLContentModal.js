import React from "react";
import PropTypes from "prop-types";
import { Modal } from "../modal/Modal";
import { CloseButton } from "../input/CloseButton";
import { TextInputField } from "../input/TextInputField";
import { useForm } from "react-hook-form";
import classNames from "classnames";
import { useState } from "react";
import { Button } from "../input/Button";
import { FormattedMessage } from "react-intl";
import { Column } from "../layout/Column";
import styles from "../../assets/stylesheets/preferences-screen.scss";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as LeaveIcon } from "../icons/Leave.svg";
import { width } from "@fortawesome/free-solid-svg-icons/faTimes";



export function WebGLContentModal({ onClose, url }) {
    const { isSubmitting, handleSubmit, register, errors } = useForm({
        defaultValues: {
            contentURL: "https://visualinfinity.asia/m1/",
        }
    });

    // Get current url 
    const currentUrl = window.location.href;
    // Get the room id from the url
    const roomParams = currentUrl.split("/");
    if (roomParams.length < 4) {
        console.error("Invalid room URL");
        return;
    }
    const roomId = roomParams[3];
    let roomName = "";
    if (roomParams.length < 5) {
        console.error("No room name found in the URL");
    } else {
        roomName = roomParams[4];
    }
    
    const roomUrl = url + '?roomId=' + roomId + '&roomName=' + roomName;
    console.log("Room URL: " + roomUrl);

    return (
        <div style={{ position: 'relative', width: '80%', height: '80%' }}>
            <ToolbarButton
                icon={<LeaveIcon />}
                preset={"accent2"}
                onClick={onClose}
                style={{ position: 'absolute', top: 15, left: 15 }}
            />
            <iframe
                id="inlineFrameExample"
                title="반응과 반사의 구조"
                width="100%"
                height="100%"
                src={roomUrl} scrolling="no" style={{ borderWidth: 5 }} frameBorder="10px" allow="xr-spatial-tracking">
            </iframe>

        </div>
    );
}

WebGLContentModal.propTypes = {
    onClose: PropTypes.func.isRequired
};