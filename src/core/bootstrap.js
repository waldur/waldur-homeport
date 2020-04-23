import Axios from 'axios';

import experimentalMode from '@waldur/configs/modes/experimental.json';
import stableMode from '@waldur/configs/modes/stable.json';

import attachTracking from './tracking';

const CONFIG_FILE = 'scripts/configs/config.json';
const modes = { stableMode, experimentalMode };

function renderError(details) {
  document
    .querySelector('.loading-screen')
    .setAttribute('style', 'display: none');
  document.querySelector('.erred-screen').setAttribute('style', '');
  document.querySelector('#wrapper').remove();
  document.querySelector('.erred-screen-message').textContent = details;
  document.querySelector('#retry-bootstrap').addEventListener('click', () => {
    location.reload();
  });
}

async function loadConfig() {
  let frontendSettings, backendSettings;
  try {
    const frontendResponse = await Axios.get(CONFIG_FILE);
    frontendSettings = frontendResponse.data;
  } catch (error) {
    if (error.status === 404) {
      // fallback to default configuration
      frontendSettings = {
        apiEndpoint: 'http://localhost:8080/',
      };
    } else if (error instanceof SyntaxError) {
      renderError(
        `Unable to parse client configuration file ${CONFIG_FILE}. Error message: ${error}`,
      );
      return;
    } else {
      renderError(error);
      return;
    }
  }

  try {
    const backendResponse = await Axios.get(
      `${frontendSettings.apiEndpoint}api/configuration/`,
    );
    backendSettings = backendResponse.data;
  } catch (error) {
    if (!error.response) {
      renderError(
        `Unfortunately, connection to server has failed. Please check if you can connect to ${frontendSettings.apiEndpoint} from your browser and contact support if the error continues.`,
      );
      return;
    } else if (error.response.status >= 400) {
      renderError(
        `Unable to fetch server configuration. Error message: ${error.response.statusText}`,
      );
    } else {
      renderError(error);
    }
    return;
  }

  return { ...frontendSettings, plugins: backendSettings };
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
    angular.bootstrap(document, [modulename], { strictDi: true });
  });
}
