import { FunctionComponent } from 'react';

import { ActionButtonResource } from '@waldur/resource/actions/ActionButtonResource';
import { SUPPORT_OFFERING_TYPE } from '@waldur/support/constants';
import { SupportActionsButton } from '@waldur/support/SupportActionsButton';

import { Resource } from '../types';

interface ResourceActionsButtonProps {
  row: Resource;
}

export const ResourceActionsButton: FunctionComponent<ResourceActionsButtonProps> = ({
  row,
}) =>
  row.offering_type === SUPPORT_OFFERING_TYPE ? (
    <SupportActionsButton
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
