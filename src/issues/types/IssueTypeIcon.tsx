import classNames from 'classnames';
import { FunctionComponent } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { ISSUE_ICONS, ISSUE_TEXT_CLASSES } from './constants';

export const IssueTypeIcon: FunctionComponent<{ type }> = ({ type }) => {
  const typeId = type.toUpperCase().replace(' ', '_');
  const iconClass = ISSUE_ICONS[typeId] || ISSUE_ICONS.INCIDENT;
  const textClass = ISSUE_TEXT_CLASSES[typeId] || ISSUE_TEXT_CLASSES.INCIDENT;
  return (
    <Tip id="issue-type-icon" label={translate(type)}>
      <i className={classNames('fa', iconClass, textClass)} />
    </Tip>
  );
};
