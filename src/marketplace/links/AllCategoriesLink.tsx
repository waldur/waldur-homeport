import { useCurrentStateAndParams } from '@uirouter/react';
import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { WORKSPACE_ALL_CATEGORIES } from '@waldur/marketplace/constants';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getWorkspace } from '@waldur/workspace/selectors';
import { WorkspaceType } from '@waldur/workspace/types';

interface OwnProps {
  className?: string;
}

const useAllCategoriesLink = () => {
  const { state: currentState, params } = useCurrentStateAndParams();
  const workspace = useSelector(getWorkspace);
  return useMemo(() => {
    let state = 'public.marketplace-categories';
    let stateParams;
    if (
      !['reporting', 'admin', 'support', 'public'].some((parent) =>
        isDescendantOf(parent, currentState),
      )
    ) {
      state =
        WORKSPACE_ALL_CATEGORIES[workspace] || 'public.marketplace-categories';
      if (workspace === WorkspaceType.ORGANIZATION && params.uuid) {
        stateParams = { uuid: params.uuid };
      }
    }
    return { state, stateParams };
  }, [workspace, currentState, params]);
};

export const AllCategoriesLink: React.FC<OwnProps> = (props) => {
  const { state, stateParams } = useAllCategoriesLink();
  return (
    <Link state={state} params={stateParams} className={props.className}>
      {props.children}
    </Link>
  );
};
