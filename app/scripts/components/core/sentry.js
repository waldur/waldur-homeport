/*
Note that we are not using builtin Angular plugin for Sentry,
because it is required to initialize before any other application code.
But we need to load application configuration from JSON via AJAX and
only then decide if we need to install Raven or not.
*/

import Raven from 'raven-js';

export default module => {
  module.factory('$exceptionHandler', exceptionHandlerFactory);
  module.run(attachSentry);
};

// @ngInject
function exceptionHandlerFactory($log, ENV) {
  return function(exception, cause) {
    if (ENV.SENTRY_DSN) {
      Raven.captureException(exception, {
        extra: {
          cause: cause
        }
      });
    }
    $log.warn(exception, cause);
  };
}

// @ngInject
function attachSentry(ENV) {
  if (ENV.SENTRY_DSN) {
    Raven.config(ENV.SENTRY_DSN).install();
    Raven.setDataCallback(function(data, original) {
      _normalizeData(data);
      original && original(data);
    });
  }
}

// See https://github.com/angular/angular.js/blob/v1.4.7/src/minErr.js
let angularPattern = /^\[((?:[$a-zA-Z0-9]+:)?(?:[$a-zA-Z0-9]+))\] (.*?)\n?(\S+)$/;

function _normalizeData(data) {
  // We only care about mutating an exception
  let exception = data.exception;
  if (exception) {
    exception = exception.values[0];
    let matches = angularPattern.exec(exception.value);

    if (matches) {
      // This type now becomes something like: $rootScope:inprog
      exception.type = matches[1];
      exception.value = matches[2];

      data.message = exception.type + ': ' + exception.value;
      // auto set a new tag specifically for the angular error url
      data.extra.angularDocs = matches[3].substr(0, 250);
    }
  }
}
