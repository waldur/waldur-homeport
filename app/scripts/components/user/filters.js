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

function formatLifetime() {
  return function(input) {
    let min = input / 60,
      hour = Math.floor(input / 3600);

    if (input === null || input === 0) {
      return 'token will not timeout';
    }
    if (min < 1) {
      return `${input} sec`;
    }
    if (min >= 1 && min < 60) {
      return `${Math.round(min)} min`;
    }
    if (hour >= 1) {
      let timeLeft,
        template;
      timeLeft = input - hour * 3600;
      min = Math.round(timeLeft / 60);
      template = min ? `${hour} h ${min} min` : `${hour} h`;
      return template;
    }
  }
}

export default module => {
  module.filter('formatRegistrationMethod', formatRegistrationMethod);
  module.filter('formatUserStatus', formatUserStatus);
  module.filter('formatLifetime', formatLifetime);
};
