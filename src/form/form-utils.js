export default class FormUtils {
  formFieldInvalid(form, fieldName) {
    return form && form[fieldName] && form[fieldName].$dirty && form[fieldName].$invalid;
  }
}
