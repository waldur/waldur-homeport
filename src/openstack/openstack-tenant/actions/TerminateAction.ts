import terminateAction from '@waldur/marketplace/resources/terminate/TerminateAction';
import { ResourceAction } from '@waldur/resource/actions/types';

const DestroyActionSubtitle = require('./DestroyActionSubtitle.md');

export default function createAction(ctx): ResourceAction {
  return {
    ...terminateAction(ctx),
    dialogSubtitle: DestroyActionSubtitle,
  };
}
