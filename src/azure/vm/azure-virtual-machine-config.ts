import { translate } from '@waldur/i18n';

export default {
  order: [
    'name',
    'description',
    'image',
    'size',
    'user_username',
    'user_password',
    'user_data',
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: translate('VM name'),
      maxlength: 150,
    },
    description: {
      type: 'string',
      label: translate('Description'),
      maxlength: 150,
    },
    image: {
      type: 'list',
      required: true,
      label: translate('Image'),
      columns: [
        {
          name: 'name',
          label: translate('Image name'),
        },
      ],
    },
    size: {
      type: 'list',
      required: true,
      label: translate('Size'),
      columns: [
        {
          name: 'name',
          label: translate('Size name'),
        },
      ],
    },
    user_username: {
      type: 'string',
      required: true,
      label: translate('Initial username'),
      maxlength: 150,
    },
    user_password: {
      type: 'password',
      required: true,
      label: translate('Initial password'),
      maxlength: 150,
    },
    user_data: {
      type: 'text',
      label: translate('User data'),
      help_text: translate(
        'Additional data that will be added to virtual machine on provisioning.',
      ),
    },
  },
};
