import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionItemType } from '@waldur/resource/actions/types';

const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export const TerminateTenantAction: ActionItemType = ({
  resource,
  refetch,
}) => (
  <TerminateAction
    resource={resource}
    refetch={refetch}
    dialogSubtitle={
      DestroyActionSubtitle?.default
        ? DestroyActionSubtitle.default
        : DestroyActionSubtitle
    }
  />
);
