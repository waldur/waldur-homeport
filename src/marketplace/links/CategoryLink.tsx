import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { WORKSPACE_CATEGORY } from '@waldur/marketplace/constants';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

interface OwnProps {
  category_uuid: string;
  className?: string;
}

export const useCategoryLink = () => {
  const { state: currentState, params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  return useMemo(() => {
    let state = 'public.marketplace-category';
    let stateParams;
    if (
      !['reporting', 'admin', 'support', 'public'].some((parent) =>
        isDescendantOf(parent, currentState),
      )
    ) {
      state = WORKSPACE_CATEGORY[workspace] || 'public.marketplace-category';
      if (workspace === WorkspaceType.ORGANIZATION && params.uuid) {
        stateParams = { uuid: params.uuid };
      }
    }
    return { state, stateParams };
  }, [workspace, currentState, params]);
};

export const CategoryLink: React.FC<OwnProps> = (props) => {
  const { state, stateParams } = useCategoryLink();
  return (
    <Link
      state={state}
      params={{ ...stateParams, category_uuid: props.category_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};
