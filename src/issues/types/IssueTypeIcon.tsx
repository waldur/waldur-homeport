import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { ISSUE_ICONS, ISSUE_TEXT_CLASSES } from './constants';

export const IssueTypeIcon = props => {
  const type = props.type.toUpperCase().replace(' ', '_');
  const iconClass = ISSUE_ICONS[type] || ISSUE_ICONS.INCIDENT;
  const textClass = ISSUE_TEXT_CLASSES[type] || ISSUE_TEXT_CLASSES.INCIDENT;
  return (
    <Tooltip
      id="issue-type-icon"
      label={translate(props.type)}>
      <i className={classNames('fa', iconClass, textClass)}/>
    </Tooltip>
  );
};

export default connectAngularComponent(IssueTypeIcon, ['type']);
