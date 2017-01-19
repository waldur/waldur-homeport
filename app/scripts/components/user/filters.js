function formatRegistrationMethod($filter) {
  return function(user) {
    if (!user.registration_method) {
      return 'Default';
    } else if (user.registration_method === 'openid') {
      return 'Estonian ID';
    } else {
      return $filter('titleCase')(user.registration_method);
    }
  };
}

function formatUserStatus() {
  return function(user) {
    if (user.is_staff && !user.is_support) {
      return 'Staff';
    } else if (user.is_staff && user.is_support) {
      return 'Staff and Support user';
    } else if (!user.is_staff && user.is_support) {
      return 'Support user';
    } else {
      return 'Regular user';
    }
  };
}

export default module => {
  module.filter('formatRegistrationMethod', formatRegistrationMethod);
  module.filter('formatUserStatus', formatUserStatus);
};
