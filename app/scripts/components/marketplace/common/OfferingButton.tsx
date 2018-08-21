import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';

import './OfferingButton.scss';

interface OfferingButtonProps {
  icon: string;
  title: string;
  onClick?(): void;
  isActive?: boolean;
}

export const OfferingButton = (props: OfferingButtonProps) => (
  <Tooltip
    label={props.title}
    id="offering-button"
    className={classNames('offering-button', {'offering-button-active': props.isActive})}
    onClick={props.onClick}>
    <i className={props.icon}/>
  </Tooltip>
);
