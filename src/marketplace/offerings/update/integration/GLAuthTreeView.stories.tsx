import type { Meta, StoryObj } from '@storybook/react-vite';
import { expect, userEvent, within } from 'storybook/test';

import { GLAuthTreeView, type GlauthTree } from './GLAuthTreeView';

/**
 * The GLAuth integration's LDAP projection: groups, users and service
 * accounts under one placeholder base DN, with each entry's LDAP attributes
 * and the Waldur-only context rows (italic, marked ※). The dashed indent
 * guides are the row depth; switch the theme toolbar to check them in dark
 * mode.
 */
const meta: Meta<typeof GLAuthTreeView> = {
  title: 'Data Display/GLAuthTreeView',
  component: GLAuthTreeView,
  decorators: [
    (Story) => (
      <div className="p-6 max-w-4xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj<typeof GLAuthTreeView>;

const offering = {
  uuid: '6f0c1e7a9b2d4c3e8f1a2b3c4d5e6f70',
  name: 'HPC cluster',
  slug: 'hpc-cluster',
};

const tree: GlauthTree = {
  offering,
  groups: [
    {
      gid: 60000,
      name: 'proj-climate',
      kind: 'project',
      scope: {
        type: 'project',
        uuid: 'a1b2c3d4e5f60718293a4b5c6d7e8f90',
        name: 'Climate modelling',
      },
      role: null,
      members: ['alice', 'bob'],
    },
    {
      gid: 60001,
      name: 'res-slurm-admin',
      kind: 'resource_role',
      scope: {
        type: 'resource',
        uuid: 'b2c3d4e5f60718293a4b5c6d7e8f90a1',
        name: 'Slurm allocation',
      },
      role: 'admin',
      members: ['alice'],
    },
    {
      gid: 60002,
      name: 'rp-slurm-climate-member',
      kind: 'resource_project_role',
      scope: {
        type: 'resource_project',
        uuid: 'c3d4e5f60718293a4b5c6d7e8f90a1b2',
        name: null,
      },
      role: 'member',
      members: [],
    },
  ],
  users: [
    {
      username: 'alice',
      uidnumber: 70001,
      disabled: false,
      personal_group: 70001,
      mail: 'alice@example.com',
      givenname: 'Alice',
      sn: 'Andersen',
      login_shell: '/bin/bash',
      home_dir: '/home/alice',
      ssh_keys: [
        'ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIExampleKey alice@laptop',
      ],
      memberships: [
        {
          gid: 60000,
          group_name: 'proj-climate',
          kind: 'project',
          role: null,
        },
        {
          gid: 60001,
          group_name: 'res-slurm-admin',
          kind: 'resource_role',
          role: 'admin',
        },
      ],
    },
    {
      username: 'bob',
      uidnumber: 70002,
      disabled: true,
      personal_group: 70002,
      mail: null,
      givenname: null,
      sn: null,
      login_shell: '/bin/zsh',
      home_dir: '/home/bob',
      ssh_keys: [],
      memberships: [
        {
          gid: 60000,
          group_name: 'proj-climate',
          kind: 'project',
          role: null,
        },
      ],
    },
  ],
  robot_accounts: [
    {
      username: 'ci-runner',
      uidnumber: 80001,
      personal_group: 80001,
      login_shell: '/bin/sh',
      home_dir: '/var/lib/ci-runner',
      ssh_keys: ['ssh-rsa AAAAB3NzaC1yc2EAAAADAQABExampleKey ci@runner'],
    },
  ],
};

export const Default: Story = {
  args: { tree },
};

/** No service accounts, so the `ou=svcaccts` branch is left out. */
export const WithoutServiceAccounts: Story = {
  args: { tree: { ...tree, robot_accounts: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('ou=groups,dc=⟨base⟩')).toBeVisible();
    await expect(canvas.queryByText(/ou=svcaccts/)).not.toBeInTheDocument();
  },
};

export const Empty: Story = {
  args: { tree: { offering, groups: [], users: [], robot_accounts: [] } },
};

export const Filtered: Story = {
  args: { tree },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(canvas.getByRole('textbox'), 'ci-runner');
    await expect(
      await canvas.findByText('cn=ci-runner,ou=svcaccts,dc=⟨base⟩'),
    ).toBeVisible();
    await expect(
      canvas.queryByText('cn=alice,ou=users,dc=⟨base⟩'),
    ).not.toBeInTheDocument();
  },
};
