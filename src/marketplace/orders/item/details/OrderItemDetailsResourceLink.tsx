import React, { FunctionComponent } from 'react';
import { useSelector } from 'react-redux';

import { Link } from '@waldur/core/Link';
import { ResourceReference } from '@waldur/marketplace/resources/types';
import {
  getCustomer,
  getProject,
  getWorkspace,
} from '@waldur/workspace/selectors';
import { ORGANIZATION_WORKSPACE } from '@waldur/workspace/types';

interface OrderItemDetailsResourceLinkProps {
  item: ResourceReference;
  children?: React.ReactNode;
}

export const OrderItemDetailsResourceLink: FunctionComponent<OrderItemDetailsResourceLinkProps> = (
  props,
) => {
  const workspace = useSelector(getWorkspace);
  const customer = useSelector(getCustomer);
  const project = useSelector(getProject);
  let state, params;
  if (workspace === ORGANIZATION_WORKSPACE) {
    state = 'marketplace-public-resource-details';
    params = {
      uuid: customer.uuid,
      resource_uuid: props.item.marketplace_resource_uuid,
    };
  } else {
    state = 'marketplace-project-resource-details';
    params = {
      uuid: project.uuid,
      resource_uuid: props.item.marketplace_resource_uuid,
    };
  }
  return (
    <>
      <Link state={state} params={params} label={props.children} />
    </>
  );
};
