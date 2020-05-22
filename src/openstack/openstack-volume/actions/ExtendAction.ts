import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';
import { Volume } from '@waldur/resource/types';

import { isBootable } from './utils';

export default function createAction(): ResourceAction<Volume> {
  return {
    name: 'extend',
    type: 'form',
    method: 'POST',
    component: 'volumeExtendDialog',
    useResolve: true,
    title: translate('Extend'),
    validators: [isBootable, validateState('OK')],
    fields: [],
  };
}
