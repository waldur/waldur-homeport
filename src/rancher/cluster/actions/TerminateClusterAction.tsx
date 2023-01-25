import { ENV } from '@waldur/configs/default';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ActionItemType } from '@waldur/resource/actions/types';

const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export const TerminateClusterAction: ActionItemType = ({ resource, refetch }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <TerminateAction
      resource={resource}
      dialogSubtitle={
        DestroyActionSubtitle?.default
          ? DestroyActionSubtitle.default
          : DestroyActionSubtitle
      }
      refetch={refetch}
    />
  ) : null;
