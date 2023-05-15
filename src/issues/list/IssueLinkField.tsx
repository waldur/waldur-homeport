import { UISref, useCurrentStateAndParams } from '@uirouter/react';
import React, { FunctionComponent } from 'react';

import { isDescendantOf } from '@waldur/navigation/useTabs';

interface IssueLinkProps {
  label?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
  target?: string;
  onClick?: (e?) => void;
  workspace?: string;
  row?: any;
}

export const IssueLinkField: FunctionComponent<IssueLinkProps> = (props) => {
  let toState: string;
  const toParams = { issue_uuid: props.row.uuid };
  const { state: currentState } = useCurrentStateAndParams();

  if (isDescendantOf('support', currentState)) {
    toState = 'support.detail';
  } else if (isDescendantOf('project', currentState)) {
    toState = 'project.issue-details';
  } else if (isDescendantOf('organization', currentState)) {
    toState = 'organization.issue-details';
  } else {
    toState = 'profile.issue-details';
  }

  return (
    <UISref to={toState} params={toParams}>
      <a
        target={props.target}
        onClick={props.onClick}
        className={props.className}
      >
        {props.label || props.children}
      </a>
    </UISref>
  );
};
