import { useCurrentStateAndParams } from '@uirouter/react';
import React from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { isDescendantOf } from '@waldur/navigation/useTabs';
import { getCustomer, getWorkspace } from '@waldur/workspace/selectors';
import {
  ORGANIZATION_WORKSPACE,
  USER_WORKSPACE,
} from '@waldur/workspace/types';

import { WORKSPACE_OFFERING_DETAILS } from '../constants';

interface OwnProps {
  offering_uuid: string;
  className?: string;
}

export const useOfferingDetailsLink = () => {
  const { state: currentState } = useCurrentStateAndParams();
  const stateParams = {};

  if (
    isDescendantOf('reporting', currentState) ||
    isDescendantOf('admin', currentState) ||
    isDescendantOf('support', currentState) ||
    isDescendantOf('profile', currentState)
  ) {
    return {
      state: WORKSPACE_OFFERING_DETAILS[USER_WORKSPACE],
      stateParams,
    };
  }

  const workspace = useSelector(getWorkspace);
  const customer = useSelector(getCustomer);

  if (isDescendantOf('marketplace-provider', currentState)) {
    return {
      state: WORKSPACE_OFFERING_DETAILS[ORGANIZATION_WORKSPACE],
      stateParams: { uuid: customer.uuid },
    };
  }

  const state =
    WORKSPACE_OFFERING_DETAILS[workspace] ||
    WORKSPACE_OFFERING_DETAILS[USER_WORKSPACE];

  return { state, stateParams };
};

export const OfferingLink: React.FC<OwnProps> = (props) => {
  const { state, stateParams } = useOfferingDetailsLink();
  return (
    <Link
      state={state}
      params={{ ...stateParams, offering_uuid: props.offering_uuid }}
      className={props.className}
    >
      {props.children}
    </Link>
  );
};
