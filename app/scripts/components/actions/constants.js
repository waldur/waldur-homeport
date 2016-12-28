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
  title: 'Edit',
  enabled: true,
  type: 'form',
  method: 'PUT',
  successMessage: 'Resource has been updated',
  fields: {
    name: {
      label: 'Name',
      max_length: 150,
      required: true,
      type: 'string'
    },
    description: {
      label: 'Description',
      max_length: 500,
      required: false,
      type: 'text'
    }
  }
};
