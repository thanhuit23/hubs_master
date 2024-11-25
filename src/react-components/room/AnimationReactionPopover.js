// Thanh add
import React from "react";
import PropTypes from "prop-types";
import { ButtonGridPopover } from "../popover/ButtonGridPopover";
import { Popover } from "../popover/Popover";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as ReactionIcon } from "../icons/Reaction.svg";
import { defineMessage, useIntl } from "react-intl";
import { ToolTip } from "@mozilla/lilypad-ui";
import { ImageGridPopover } from "../popover/ImageGridPopover";

const animationReactionTooltipDescription = defineMessage({
  id: "animation-reaction-tooltip.description",
  defaultMessage: "Reactions"
});

const animationReactionPopoverTitle = defineMessage({
  id: "animation-reaction-popover.title",
  defaultMessage: "React"
});

export function AnimationReactionPopover({ items }) {
  const intl = useIntl();
  const filteredItems = items.filter(item => !!item);

  // The button is removed if you can't place anything.
  if (filteredItems.length === 0) {
    return null;
  }

  const title = intl.formatMessage(animationReactionPopoverTitle);
  const description = intl.formatMessage(animationReactionTooltipDescription);

  return (
    <Popover
      title={title}
      content={props => <ImageGridPopover items={filteredItems} {...props} />}
      placement="top"
      offsetDistance={28}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        <ToolTip description={description}>
          <ToolbarButton
            ref={triggerRef}
            icon={<ReactionIcon />}
            selected={popoverVisible}
            onClick={togglePopover}
            label={title}
            preset="accent2"
          />
        </ToolTip>
      )}
    </Popover>
  );
}

AnimationReactionPopover.propTypes = {
  items: PropTypes.array.isRequired
};
