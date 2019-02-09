import { get } from '@waldur/core/api';
import { format } from '@waldur/core/ErrorMessageFormatter';
import { ENV } from '@waldur/core/services';
import { translate } from '@waldur/i18n';
import { validateState } from '@waldur/resource/actions/base';
import { ResourceAction, ActionContext } from '@waldur/resource/actions/types';

const getConsoleURL = (id: string) =>
  get(`/openstacktenant-instances/${id}/console/`);

const validatePermissions = (ctx: ActionContext) => {
  if (ctx.user.is_staff) {
    return;
  }
  if (!ctx.user.is_support && ENV.plugins.WALDUR_OPENSTACK_TENANT.ALLOW_CUSTOMER_USERS_OPENSTACK_CONSOLE_ACCESS) {
    return;
  }
  return translate('Only staff and organization users are allowed to open console.');
};

export default function createAction(): ResourceAction {
  return {
    name: 'console',
    title: translate('Open console'),
    type: 'callback',
    execute: resource => {
      getConsoleURL(resource.uuid).then(response => {
        window.open(response.data.url);
      }).catch(error => {
        const ctx = {message: format(error)};
        const message = translate('Unable to open console. Error message: {message}', ctx);
        alert(message);
      });
    },
    validators: [validateState('OK'), validatePermissions],
  };
}
