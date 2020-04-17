import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction {
  return {
    name: 'destroy',
    type: 'form',
    method: 'DELETE',
    destructive: true,
    title: translate('Destroy'),
    validators: [validateState('OK', 'Erred')],
    // TODO: invalidate cache when action succeeds
    dialogSubtitle: translate(
      'Deleting PostgreSQL server will cause deletion of all databases created within server.',
    ),
  };
}
