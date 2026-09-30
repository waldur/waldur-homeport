import type { Meta, StoryObj } from '@storybook/react-vite';
import React, { useState } from 'react';

import { PermissionField } from './PermissionField';

const PermissionFieldHarness = ({ initial = [] as string[] }) => {
  const [value, setValue] = useState<string[]>(initial);
  return (
    <div
      style={{
        maxWidth: '850px',
        padding: '24px',
        background: 'var(--surface-primary, #fff)',
      }}
    >
      <PermissionField input={{ value, onChange: setValue }} />
    </div>
  );
};

const meta: Meta<typeof PermissionFieldHarness> = {
  title: 'Administration/PermissionField',
  component: PermissionFieldHarness,
};
export default meta;

type Story = StoryObj<typeof PermissionFieldHarness>;

export const Default: Story = {
  args: {
    initial: [],
  },
};

export const WithSelectedPermissions: Story = {
  args: {
    initial: ['CUSTOMER.LIST_USERS', 'OFFERING.CREATE', 'OFFERING.UPDATE'],
  },
};
