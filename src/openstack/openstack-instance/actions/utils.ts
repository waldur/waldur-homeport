import { translate } from '@waldur/i18n';

export const getDeleteField = () => ({
  formFields: [
    {
      name: 'delete_volumes',
      label: translate('Delete volumes'),
      type: 'boolean',
    },
    {
      name: 'release_floating_ips',
      label: translate('Release floating IPs'),
      type: 'boolean',
    },
  ],
  initialValues: {
    delete_volumes: true,
    release_floating_ips: true,
  },
});
