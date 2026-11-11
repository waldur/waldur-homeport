import { ApplicationConfigurationOptions } from '@/core/types';

export const ENV: ApplicationConfigurationOptions = {
  apiEndpoint: 'http://localhost:8080/',
  pageSize: 10,
  buildId: 'develop',
  roles: [],
  excludedAttachmentTypes: [],
  enforceLatinName: true,
  authStorage: 'localStorage',
};
