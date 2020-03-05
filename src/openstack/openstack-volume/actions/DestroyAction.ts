import { translate } from '@waldur/i18n';
import {
  validateState,
  validateRuntimeState,
} from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [
      validateState('OK', 'Erred'),
      validateRuntimeState(
        'available',
        'error',
        'error_restoring',
        'error_extending',
        '',
      ),
    ],
  };
}
