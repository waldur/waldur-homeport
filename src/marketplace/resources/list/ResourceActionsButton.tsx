import { FunctionComponent } from 'react';

import { ModalActionsRouter } from '@waldur/marketplace/resources/actions/ModalActionsRouter';
import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import {
  INSTANCE_TYPE,
  TENANT_TYPE,
  VOLUME_TYPE,
} from '@waldur/openstack/constants';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
  refetch?(): void;
}

export const ResourceActionsButton: FunctionComponent<
  ResourceActionsButtonProps
> = ({ row, refetch }) =>
  row.scope === null || row.offering_type === 'Support.OfferingTemplate' ? (
    <BaseResourceActionsButton
      resource={
        {
          ...row,
          marketplace_resource_uuid: row.uuid,
        } as any
      }
      refetch={refetch}
    />
  ) : [INSTANCE_TYPE, VOLUME_TYPE, TENANT_TYPE].includes(row.offering_type) ? (
    <ModalActionsRouter
      offering_type={row.offering_type}
      url={row.scope}
      name={row.name}
      refetch={refetch}
    />
  ) : (
    <ActionButtonResource url={row.scope} refetch={refetch} />
  );
