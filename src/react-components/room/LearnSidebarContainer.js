import React, { useCallback } from "react";
import PropTypes from "prop-types";
import { LearnSidebar, LearnObject } from "./LearnSidebar";

export function LearnSidebarContainer({ onClose, hubChannel, room }) {
    // Get description of the room and display it in the sidebar
    const roomDescription = room.description;
    // Split the description into an array of strings by newlines
    const roomDescriptionLines = roomDescription ? roomDescription.split("\n") : [];
    
    const roomName = room.name;

    const onCloseWrapper = useCallback(() => {
        onClose();
    }, [onClose]);

    return (
        <LearnSidebar onClose={onCloseWrapper}>
            <LearnObject>
                <h2>{roomName}</h2>
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
