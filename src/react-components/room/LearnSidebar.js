import React from "react";
import PropTypes from "prop-types";
import styles from "./LearnSidebar.scss";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { FormattedMessage } from "react-intl";

export function LearnObject({ children }) {
    return (
        <li className={styles.learnTitle}>
            <p>{children}</p>
        </li>
    );
}

LearnObject.propTypes = {
    children: PropTypes.node
};

export function LearnSidebar({ children, onClose }) {
    return (
        <Sidebar
            title={
                <FormattedMessage
                    id="learn-sidebar.title"
                    defaultMessage="Learn"
                />
            }
            beforeTitle={<CloseButton onClick={onClose} />}
        >
            <ul>{children}</ul>
        </Sidebar>
    );
}

LearnSidebar.propTypes = {
    children: PropTypes.node,
    onClose: PropTypes.func
};