import { formatRegistrationMethod } from './support/utils';
import { formatUserStatus } from './support/utils';

function formatLifetime() {
  return function(input) {
    let time = moment.duration(input, 'seconds'),
      hours = time.hours(),
      minutes = time.minutes(),
      seconds = time.seconds();

    if (input === null || input === 0) {
      return 'token will not timeout';
    }
    if (hours === 0 && minutes === 0) {
      return `${seconds} sec`;
    }
    if (hours === 0 && minutes !== 0) {
      return `${minutes} min`;
    }
    if (hours !== 0) {
      let template = minutes !== 0 ? `${hours} h ${minutes} min` : `${hours} h`;
      return template;
    }
  };
}

export default module => {
  module.filter('formatRegistrationMethod', () => formatRegistrationMethod);
  module.filter('formatUserStatus', () => formatUserStatus);
  module.filter('formatLifetime', formatLifetime);
};
