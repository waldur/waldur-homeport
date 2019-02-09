import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction } from '@waldur/resource/actions/types';

const getConsoleOutput = (id: string) =>
  get(`/openstacktenant-instances/${id}/console_log/`);

export default function createAction(): ResourceAction {
  return {
    name: 'console_log',
    title: translate('Show console log'),
    type: 'callback',
    execute: resource => {
      getConsoleOutput(resource.uuid).then(response => {
        const win = window.open();
        if (win == null) {
          alert(translate('Unable to open console log'));
          return;
        }
        const doc = win.document;
        doc.open();
        doc.write(`<pre>${response.data}</pre>`);
        doc.close();
      }).catch(error => {
        const ctx = {message: format(error)};
        const message = translate('Unable to show console log. Error message: {message}', ctx);
        alert(message);
      });
    },
    validators: [validateState('OK')],
  };
}
