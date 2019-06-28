import { getAll } from '@waldur/core/api';

export const loadTemplates = (settingsId: string) =>
  getAll('/vmware-templates/', {params: {settings_uuid: settingsId}});
