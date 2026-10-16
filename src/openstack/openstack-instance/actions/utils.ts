import { translate } from '@/i18n';

export const getDeleteField = (resource) => ({
  formFields: [
    {
      name: 'delete_volumes',
      label: translate('Delete volumes'),
      type: 'boolean',
    },
    // Hidden only when the instance is known to have no floating IPs.
    ...(resource.floating_ips?.length === 0
      ? []
      : [
          {
            name: 'release_floating_ips',
            label: translate('Release floating IPs'),
            type: 'boolean',
          },
        ]),
  ],
  initialValues: {
    delete_volumes: true,
    release_floating_ips: true,
  },
});
