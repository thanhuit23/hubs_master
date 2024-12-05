import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { LearnSidebar, LearnObject } from "./LearnSidebar";

export function LearnSidebarContainer({ onClose, hubChannel, room }) {
    // Get description of the room and display it in the sidebar
    const roomDescription = room.description;
    // Split the description into an array of strings by newlines
    const roomDescriptionLines = roomDescription.split("\n");
    // Remove any empty strings from the array


    const onCloseWrapper = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <LearnSidebar onClose={onCloseWrapper}>
            <LearnObject>
                {roomDescriptionLines.map((line, index) => (
                    <p key={index}>{line}</p>
                ))}
            </LearnObject>
        </LearnSidebar>
    );
}

LearnSidebarContainer.propTypes = {
    hubChannel: PropTypes.object.isRequired,
    room: PropTypes.object.isRequired,
    onClose: PropTypes.func
};
