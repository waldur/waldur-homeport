export default {
  order: [
    'name',
    'description',
    'image',
    'size',
    'username',
    'password',
    'user_data'
  ],
  options: {
    name: {
      type: 'string',
      required: true,
      label: gettext('VM name'),
      maxlength: 150
    },
    description: {
      type: 'string',
      label: gettext('Description'),
      maxlength: 150
    },
    image: {
      type: 'list',
      required: true,
      label: gettext('Image'),
      columns: [
        {
          name: 'name',
          label: gettext('Image name')
        }
      ],
    },
    size: {
      type: 'list',
      required: true,
      label: gettext('Size'),
      columns: [
        {
          name: 'name',
          label: gettext('Size name')
        }
      ],
    },
    username: {
      type: 'string',
      required: true,
      label: gettext('Username'),
      maxlength: 150
    },
    password: {
      type: 'password',
      required: true,
      label: gettext('Password'),
      maxlength: 150
    },
    user_data: {
      type: 'text',
      label: gettext('User data'),
      help_text: gettext('Additional data that will be added to virtual machine on provisioning.')
    }
  }
};

