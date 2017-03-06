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
  successMessage: gettext('Resource has been updated'),
  fields: {
    name: {
      label: gettext('Name'),
      max_length: 150,
      required: true,
      type: 'string'
    },
    description: {
      label: gettext('Description'),
      max_length: 500,
      required: false,
      type: 'text'
    }
  }
};
