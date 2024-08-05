import { ENV } from '@waldur/configs/default';
import { get, sendForm } from '@waldur/core/api';

export const saveConfig = (values) =>
  sendForm('POST', `${ENV.apiEndpoint}api/override-settings/`, values);

export const getDBSettings = () => get('/override-settings/');
