import { translate } from '@waldur/i18n';
import { ResourceAction } from '@waldur/resource/actions/types';

export default function createAction(): ResourceAction<{ is_active: boolean }> {
  return {
    name: 'deactivate',
    type: 'button',
    method: 'POST',
    title: translate('Deactivate'),
    validators: [
      ({ resource }) => {
        if (!resource.is_active) {
          return translate('Resource schedule is already deactivated.');
        }
      },
    ],
  };
}
