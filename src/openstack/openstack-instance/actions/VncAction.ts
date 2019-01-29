import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const getConsoleURL = (id: string) =>
  get(`/openstacktenant-instances/${id}/console/`);

export default function createAction(): ResourceAction {
  return {
    name: 'vnc',
    title: translate('Open VNC console'),
    type: 'callback',
    execute: resource => {
      getConsoleURL(resource.uuid).then(({ url }) => {
        window.open(url);
      }).catch(error => {
        const ctx = {message: format(error)};
        const message = translate('Unable to open VNC console. Error message: {message}', ctx);
        alert(message);
      });
    },
    validators: [validateState('OK')],
  };
}
