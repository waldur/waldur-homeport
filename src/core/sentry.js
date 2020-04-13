/*
Note that we are not using builtin Angular plugin for Sentry,
because it is required to initialize before any other application code.
But we need to load application configuration from JSON via AJAX and
only then decide if we need to install Sentry client or not.
*/

import * as Sentry from '@sentry/browser';

// @ngInject
function exceptionHandlerFactory($log, ENV) {
  return function(exception, cause) {
    if (ENV.SENTRY_DSN) {
      if (cause) {
        Sentry.setExtra('cause', cause);
      }
      Sentry.captureException(exception);
    }
    $log.warn(exception, cause);
  };
}

// See https://github.com/angular/angular.js/blob/v1.4.7/src/minErr.js
const angularPattern = /^\[((?:[$a-zA-Z0-9]+:)?(?:[$a-zA-Z0-9]+))\] (.*?)\n?(\S+)$/;

function normalizeEvent(event) {
  // We only care about mutating an exception
  const exception =
    event.exception && event.exception.values && event.exception.values[0];

  if (exception) {
    const matches = angularPattern.exec(exception.value);

    if (matches) {
      // This type now becomes something like: $rootScope:inprog
      exception.type = matches[1];
      exception.value = matches[2];

      event.message = exception.type + ': ' + exception.value;
      // auto set a new tag specifically for the angular error url
      event.extra = {
        ...event.extra,
        angularDocs: matches[3].substr(0, 250),
      };
    }
  }

  return event;
}

// @ngInject
function attachSentry(ENV) {
  if (ENV.SENTRY_DSN) {
    Sentry.init({
      dsn: ENV.SENTRY_DSN,
      beforeSend: normalizeEvent,
    });
  }
}

export default module => {
  module.factory('$exceptionHandler', exceptionHandlerFactory);
  module.run(attachSentry);
};
