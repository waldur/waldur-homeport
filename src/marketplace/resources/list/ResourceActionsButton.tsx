import { FunctionComponent } from 'react';
import { Resource } from 'waldur-js-client';

import { ModalActionsRouter } from '@/marketplace/resources/actions/ModalActionsRouter';
import { ResourceActionsButton as BaseResourceActionsButton } from '@/marketplace/resources/actions/ResourceActionsButton';
import { ActionButtonResource } from '@/resource/actions/ActionButtonResource';
import { SUPPORT_OFFERING_TYPE } from '@/support/constants';

import { ActionsLists } from '../actions/ActionsLists';

interface ResourceActionsButtonProps {
  row: Resource;
  refetch?(): void;
}

export const ResourceActionsButton: FunctionComponent<
  ResourceActionsButtonProps
> = ({ row, refetch }) =>
  row.scope === null || [SUPPORT_OFFERING_TYPE].includes(row.offering_type) ? (
    <BaseResourceActionsButton
      resource={
        {
          ...row,
          marketplace_resource_uuid: row.uuid,
        } as any
      }
      refetch={refetch}
      disabled={row.offering_state === 'Unavailable'}
    />
  ) : ActionsLists[row.offering_type] ? (
    <ModalActionsRouter
      offering_type={row.offering_type}
      url={row.scope}
      name={row.name}
      refetch={refetch}
      disabled={row.offering_state === 'Unavailable'}
    />
  ) : (
    <ActionButtonResource
      url={row.scope}
      refetch={refetch}
      disabled={row.offering_state === 'Unavailable'}
    />
  );
