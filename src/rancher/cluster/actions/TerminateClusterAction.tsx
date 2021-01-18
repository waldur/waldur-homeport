import { ENV } from '@waldur/configs/default';
import { TerminateAction } from '@waldur/marketplace/resources/terminate/TerminateAction';

const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export const TerminateClusterAction = ({ resource }) =>
  !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE ? (
    <TerminateAction
      resource={resource}
      dialogSubtitle={DestroyActionSubtitle}
    />
  ) : null;
