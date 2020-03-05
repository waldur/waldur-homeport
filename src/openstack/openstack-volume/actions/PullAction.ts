import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

import { hasBackendId } from './utils';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'pull',
    title: translate('Synchronise'),
    method: 'POST',
    type: 'button',
    validators: [hasBackendId, validateState('OK', 'Erred')],
  };
}
