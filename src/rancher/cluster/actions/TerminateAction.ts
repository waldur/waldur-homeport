import { ENV } from '@waldur/core/services';
import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ResourceAction } from '@waldur/resource/actions/types';

const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export default function createAction(ctx): ResourceAction {
  const action = terminateAction(ctx);
  return {
    ...action,
    dialogSubtitle: DestroyActionSubtitle,
    isVisible: action.isVisible && !ENV.plugins.WALDUR_RANCHER.READ_ONLY_MODE,
  };
}
