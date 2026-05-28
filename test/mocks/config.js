import { vi } from 'vitest';

const { mockConfig } = vi.hoisted(() => {
  const env = {
    apiEndpoint: 'http://localhost:8080/',
    pageSize: 10,
    buildId: 'develop',
    accountingMode: 'accounting',
    roles: [],
    excludedAttachmentTypes: [],
    enforceLatinName: true,
    authStorage: 'localStorage',
    plugins: {
      WALDUR_CORE: {
        FREEIPA_USERNAME_PREFIX: '',
      },
      WALDUR_RANCHER: {
        READ_ONLY_MODE: false,
      },
    },
    FEATURES: {},
  };
  return {
    mockConfig: { ENV: env },
  };
});

vi.mock('@/core/config', () => mockConfig);
