import * as classNames from 'classnames';
import * as React from 'react';

import { Tooltip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ISSUE_ICONS, ISSUE_TEXT_CLASSES } from './constants';

export const IssueTypeIcon = ({ type }) => {
  const typeId = type.toUpperCase().replace(' ', '_');
  const iconClass = ISSUE_ICONS[typeId] || ISSUE_ICONS.INCIDENT;
  const textClass = ISSUE_TEXT_CLASSES[typeId] || ISSUE_TEXT_CLASSES.INCIDENT;
  return (
    <Tooltip id="issue-type-icon" label={translate(type)}>
      <i className={classNames('fa', iconClass, textClass)} />
    </Tooltip>
  );
};
