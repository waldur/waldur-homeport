import stableMode from '@waldur/configs/modes/stable.json';
import experimentalMode from '@waldur/configs/modes/experimental.json';
import attachTracking from './tracking';

const CONFIG_FILE = 'scripts/configs/config.json';
const modes = {stableMode, experimentalMode};

function renderError(details) {
  document.querySelector('.loading-screen').setAttribute('style', 'display: none');
  document.querySelector('.erred-screen').setAttribute('style', '');
  document.querySelector('#wrapper').remove();
  document.querySelector('.erred-screen-message').textContent = details;
}

async function loadConfig() {
  const initInjector = angular.injector(['ng']);
  const $http = initInjector.get('$http');

  let frontendSettings, backendSettings;
  try {
    const frontendResponse = await $http.get(CONFIG_FILE);
    frontendSettings = frontendResponse.data;
  } catch(error) {
    if (error.status === 404) {
      // fallback to default configuration
      frontendSettings = {
        apiEndpoint: 'http://localhost:8080/',
      };
    } else if (error instanceof SyntaxError) {
      renderError(`Unable to parse client configuration file ${CONFIG_FILE}. Error message: ${error}`);
      return;
    } else {
      renderError(error);
      return;
    }
  }

  try {
    const backendResponse = await $http.get(`${frontendSettings.apiEndpoint}api/configuration/`);
    backendSettings = backendResponse.data;
  } catch (error) {
    if (error.status === -1) {
      renderError(`Unfortunately, connection to server has failed. Please check if you can connect to ${frontendSettings.apiEndpoint} from your browser and contact support if the error continues.`);
    } else if (error.status >= 400) {
      renderError(`Unable to fetch server configuration. Error message: ${error.statusText}`);
    } else {
      renderError(error);
    }
    return;
  }

  return {...frontendSettings, plugins: backendSettings};
}

export default async function bootstrap(modulename) {
  const config = await loadConfig();
  if (!config) {
    return;
  }
  window.$$CUSTOMENV = config;
  window.$$MODES = modes;
  attachTracking(window.$$CUSTOMENV);

  angular.element(document).ready(function() {
    angular.bootstrap(document, [modulename], {strictDi: true});
  });
}
