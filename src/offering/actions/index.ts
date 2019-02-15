import changePlanAction from '@waldur/marketplace/resources/ChangePlanAction';
import terminateResourceAction from '@waldur/marketplace/resources/TerminateAction';

import completeAction from './CompleteAction';
import destroyAction from './DestroyAction';
import terminateAction from './TerminateAction';
import editAction from './UpdateAction';

export default [
  editAction,
  changePlanAction,
  completeAction,
  terminateAction,
  terminateResourceAction,
  destroyAction,
];
