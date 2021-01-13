import { gettext } from '@waldur/i18n';

export const defaultFieldOptions = {
  datetime: {
    format: 'dd.MM.yyyy',
    altInputFormats: ['M!/d!/yyyy'],
    dateOptions: {
      minDate: new Date(),
      startingDay: 1,
    },
  },
};

export const DEFAULT_EDIT_ACTION = {
  title: gettext('Edit'),
  enabled: true,
  type: 'form',
  method: 'PUT',
  successMessage: gettext('Resource has been updated.'),
  fields: {
    name: {
      label: gettext('Name'),
      maxlength: 150,
      required: true,
      type: 'string',
    },
    description: {
      label: gettext('Description'),
      maxlength: 2000,
      required: false,
      type: 'text',
    },
  },
};

export const RESOURCE_ACTION_FORM = 'ResourceActionDialog';
