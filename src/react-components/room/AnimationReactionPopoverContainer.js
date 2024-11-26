// Thanh add
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
// import { ReactComponent as ReactionIcon } from "../icons/Reaction.svg";
import { AnimationReactionPopover } from "./AnimationReactionPopover";
import { FormattedMessage } from "react-intl";
// import { defineMessage, defineMessages, useIntl } from "react-intl";
import { animations, playAnimationReaction } from "../../components/emoji";
function FormattedMessageFixed(props) {
    return <FormattedMessage {...props} />;
}


export function AnimationReactionPopoverContainer({ scene, hubChannel }) {
    const [items, setItems] = useState([]);
    const [reacted, setReacted] = useState(false);

    useEffect(() => {
        function updateItems() {
            // const itemNames = {
            //     "Clapping": "박수", // Applause
            //     "Defeat": "좌절", // Defeat
            //     "Fly": "공중부양", // Fly
            //     "Hiphop": "힙합", // Hiphop
            //     "No": "No", // No
            //     "Salute": "경례", // Salute
            //     "WaveDance": "웨이브댄스", // Wave
            //     "Waving": "손 흔들기", // Wave2
            // };

            const items = animations.map(animation => {
                // const messageId = "animation-reaction-tooltip" + animation.id;
                return {
                    id: animation.id,
                    src: animation.src,
                    label: animation.label,
                    location: animation.location,
                    onSelect: playAnimationReaction
                };
            });

            // let nextItems = [
            // ];

            // for (const [key, value] of Object.entries(itemNames)) {
            //     const messageId = "animation-reaction-tooltip" + key;

            //     nextItems = [
            //         ...nextItems,
            //         {
            //             id: `reaction-animation-${key}`,
            //             icon: ReactionIcon,
            //             color: "accent2",
            //             label: <FormattedMessageFixed id={messageId} defaultMessage={value} />,
            //             selected: reacted
            //         }
            //     ];
            // }

            // nextItems = [
            //     ...nextItems,
            //     {
            //         id: "reaction-animation-01",
            //         icon: ReactionIcon,
            //         color: "accent2",
            //         label: <FormattedMessage id="animation-popover.item-type.greeting" defaultMessage="Greeting" />,
            //         selected: reacted
            //     }
            // ];

            // setItems(newItems);
            setItems(items);
        }

        hubChannel.addEventListener("permissions_updated", updateItems);

        updateItems();

        return () => {
            hubChannel.removeEventListener("permissions_updated", updateItems);
        };
    }, [hubChannel, scene, reacted]);

    return <AnimationReactionPopover items={items} />;
}

AnimationReactionPopoverContainer.propTypes = {
    hubChannel: PropTypes.object.isRequired,
    scene: PropTypes.object.isRequired,
};
