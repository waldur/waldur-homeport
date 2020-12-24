import Axios from 'axios';

import { afterBootstrap } from '@waldur/afterBootstrap';
import { ENV } from '@waldur/configs/default';
import experimentalMode from '@waldur/configs/modes/experimental.json';
import stableMode from '@waldur/configs/modes/stable.json';

const CONFIG_FILE = 'scripts/configs/config.json';
const modes = { stableMode, experimentalMode };

export async function loadConfig() {
  let frontendSettings, backendSettings;
  try {
    const frontendResponse = await Axios.get(CONFIG_FILE);
    frontendSettings = frontendResponse.data;
  } catch (response) {
    if (!response) {
      throw new Error(`Unable to fetch client configuration file.`);
    } else if (response.status === 404) {
      // fallback to default configuration
      frontendSettings = {
        apiEndpoint: 'http://localhost:8080/',
      };
    } else {
      throw new Error(response);
    }
  }

  // Axios swallows JSON parse error
  if (typeof frontendSettings !== 'object') {
    throw new Error(
      `Unable to parse client configuration file ${CONFIG_FILE}.`,
    );
  }

  try {
    const backendResponse = await Axios.get(
      `${frontendSettings.apiEndpoint}api/configuration/`,
    );
    backendSettings = backendResponse.data;
  } catch (response) {
    if (!response) {
      throw new Error(
        `Unfortunately, connection to server has failed. Please check if you can connect to ${frontendSettings.apiEndpoint} from your browser and contact support if the error continues.`,
      );
    } else if (response.status >= 400) {
      throw new Error(
        `Unable to fetch server configuration. Error message: ${response.statusText}`,
      );
    } else {
      throw new Error(response);
    }
  }

  const config = { ...frontendSettings, plugins: backendSettings };
  Object.assign(ENV, config);
  if (ENV.enableExperimental) {
    Object.assign(ENV, modes.experimentalMode);
  } else {
    Object.assign(ENV, modes.stableMode);
  }
  afterBootstrap();
  return true;
}
