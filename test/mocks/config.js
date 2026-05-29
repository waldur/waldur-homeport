import { vi } from 'vitest';

const { mockConfig } = vi.hoisted(() => {
  const env = {
    apiEndpoint: 'http://localhost:8080/',
    pageSize: 10,
    buildId: 'develop',
    accountingMode: 'accounting',
    roles: [
      {
        name: 'owner',
        description: 'Owner',
        content_type: 'customer',
        is_active: true,
      },
      {
        name: 'manager',
        description: 'Manager',
        content_type: 'customer',
        is_active: true,
      },
      {
        name: 'admin',
        description: 'Administrator',
        content_type: 'project',
        is_active: true,
      },
      {
        name: 'manager',
        description: 'Manager',
        content_type: 'project',
        is_active: true,
      },
      {
        name: 'customer_role',
        description: 'customer role',
        content_type: 'customer',
        is_active: true,
      },
      {
        name: 'project_role',
        description: 'project role',
        content_type: 'project',
        is_active: true,
      },
    ],
    excludedAttachmentTypes: [],
    enforceLatinName: true,
    authStorage: 'localStorage',
    plugins: {
      WALDUR_CORE: {
        FREEIPA_USERNAME_PREFIX: '',
        CURRENCY_NAME: 'EUR',
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
