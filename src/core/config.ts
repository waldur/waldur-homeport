import { ApplicationConfigurationOptions } from '@/core/types';

export const ENV: ApplicationConfigurationOptions = {
  apiEndpoint: 'http://localhost:8080/',
  pageSize: 10,
  buildId: 'develop',
  accountingMode: 'accounting',
  roles: [],
  excludedAttachmentTypes: [],
  enforceLatinName: true,
  authStorage: 'localStorage',
};
