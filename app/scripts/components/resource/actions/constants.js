import { ENV } from '@waldur/core/services';
import { LATIN_NAME_PATTERN } from '@waldur/core/utils';

export const defaultFieldOptions = {
  datetime: {
    format: 'dd.MM.yyyy',
    altInputFormats: ['M!/d!/yyyy'],
    dateOptions: {
      minDate: new Date(),
      startingDay: 1
    }
  }
};

export const defaultEditAction = {
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
      type: 'string'
    },
    description: {
      label: gettext('Description'),
      maxlength: 500,
      required: false,
      type: 'text'
    }
  }
};

export const latinName = {
  label: gettext('Name'),
  maxlength: 150,
  required: true,
  type: 'string',
  init: field => {
    field.pattern = ENV.enforceLatinName && LATIN_NAME_PATTERN;
  },
};
