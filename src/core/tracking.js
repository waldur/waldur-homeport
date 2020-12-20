import ReactGA from 'react-ga';

// @ngInject
export default function attachTracking(ENV) {
  if (ENV.GoogleAnalyticsID) {
    ReactGA.initialize(ENV.GoogleAnalyticsID);
  }
}
