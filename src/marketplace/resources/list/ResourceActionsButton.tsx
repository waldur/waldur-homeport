import { FunctionComponent } from 'react';

import { ResourceActionsButton as BaseResourceActionsButton } from '@waldur/marketplace/resources/actions/ResourceActionsButton';
import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> = ({
  row,
}) =>
  row.offering_type === SUPPORT_OFFERING_TYPE ? (
    <BaseResourceActionsButton
      resource={
        {
          ...row,
          marketplace_resource_uuid: row.uuid,
        } as any
      }
    />
  ) : (
    <>
      <ActionButtonResource disabled={row.scope === null} url={row.scope} />
    </>
  );
