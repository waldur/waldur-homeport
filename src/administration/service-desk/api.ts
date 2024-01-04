import { get, post } from '@waldur/core/api';

export const saveConfig = (values) => post('/override-settings/', values);

export const getDBSettings = () => get('/override-settings/');
