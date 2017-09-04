// @ngInject
function formatPhone() {
  // phone numbers specification https://www.itu.int/rec/T-REC-E.164-201011-I
  return function(value) {
    if (value === undefined || value.national_number === undefined || value.country_code === undefined) {
      return value;
    }

    let nationalNumber = value.national_number || '';

    if (nationalNumber.length === 7) {
      nationalNumber = nationalNumber.replace(/(\d{3})(\d{2})(\d{2})/, '$1-$2-$3');
    } else if (nationalNumber.length === 10) {
      nationalNumber = nationalNumber.replace(/(\d{3})(\d{3})(\d{4})/, '$1-$2-$3');
    }

    return `(+${value.country_code})-${nationalNumber}`;
  };
}

export default module => {
  module.filter('formatPhone', formatPhone);
};
