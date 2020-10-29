import * as React from 'react';
import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { getWorkspace } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  PROJECT_WORKSPACE,
  SUPPORT_WORKSPACE,
  USER_WORKSPACE,
  WorkspaceType,
} from '@waldur/workspace/types';

import './WorkspaceLabel.scss';

const getWorkspaceAlias = (workspace: WorkspaceType): string => {
  let alias;
  switch (workspace) {
    case PROJECT_WORKSPACE: {
      alias = translate('Project workspace');
      break;
    }
    case ORGANIZATION_WORKSPACE: {
      alias = translate('Organization workspace');
      break;
    }
    case SUPPORT_WORKSPACE: {
      alias = translate('Support workspace');
      break;
    }
    case USER_WORKSPACE: {
      alias = translate('Personal workspace');
      break;
    }
    default: {
      alias = null;
    }
  }
  return alias;
};

export const WorkspaceLabel = () => {
  const workspace = useSelector(getWorkspace);
  return (
    <div className="workspace-label-container hidden-md-stable">
      <span>{getWorkspaceAlias(workspace)}</span>
    </div>
  );
};
