export const formFieldInvalid = (form, fieldName) =>
  form && form[fieldName] && form[fieldName].$dirty && form[fieldName].$invalid;
