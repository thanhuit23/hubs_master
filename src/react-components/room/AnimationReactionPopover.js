// Thanh add
import React, { useState, useEffect } from 'react';
import PropTypes from "prop-types";
import { playAnimationRaiseHand, stopAnimationRaiseHand } from "../../components/emoji";
import { Popover } from "../popover/Popover";
import { ToolbarButton } from "../input/ToolbarButton";
import { ReactComponent as ReactionIcon } from "../icons/Reaction.svg";
import { defineMessage, FormattedMessage, useIntl } from "react-intl";
import { Column } from "../layout/Column";
import { Row } from "../layout/Row";
import { HandRaisedButton } from "./ReactionButton";
import styles from "./ReactionPopover.scss";
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
  const [active, setActive] = useState(false);

  window.addEventListener("stop-risehand", event => {
    setActive(false);
  });

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
      content={props =>
        <Column padding="sm" grow gap="sm">
          <Row noWrap>
            <ImageGridPopover items={filteredItems} {...props} />
          </Row>
          <Row>
            <label className={styles.label}>
              <FormattedMessage id="reaction-popover.action" defaultMessage="Actions" />
            </label>
          </Row>
          <Row nowrap>
            <HandRaisedButton
              active={active}
              onClick={() => {
                setActive(!active);
                if (!active) {
                  playAnimationRaiseHand();
                } else {
                  stopAnimationRaiseHand();
                }
                props.closePopover();
              }}
            />
          </Row>
        </Column>
      }
      placement="top"
      offsetDistance={28}
    >
      {({ togglePopover, popoverVisible, triggerRef }) => (
        // <ToolTip description={description}>
        <ToolbarButton
          ref={triggerRef}
          icon={<ReactionIcon />}
          selected={popoverVisible}
          onClick={togglePopover}
          label={title}
          preset="accent2"
        />
        // </ToolTip>
      )}
    </Popover>
  );
}

AnimationReactionPopover.propTypes = {
  items: PropTypes.array.isRequired
};
