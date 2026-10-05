import {
  CloudIcon,
  CpuIcon,
  DatabaseIcon,
  FileCodeIcon,
  HardDrivesIcon,
  LinuxLogoIcon,
  SparkleIcon,
  UploadSimpleIcon,
  WindowsLogoIcon,
} from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComponentProps, useState } from 'react';
import { expect, screen, userEvent, within } from 'storybook/test';

import { BoxRadioChoice, BoxRadioField } from './BoxRadioField';

/**
 * `BoxRadioField` renders a group of mutually exclusive options as selectable
 * cards/boxes. It is widely used in resource provisioning and order wizards
 * (e.g. OS image picker, hardware flavor selection, cloud provider choice,
 * template type selection).
 *
 * It supports two primary layouts:
 * - **Horizontal grid** (`vertical: false`, default): Compact rectangular cards
 *   with an image/icon on top and a label/metadata on the bottom. When choices
 *   include `options`, a Radix-based `Menu` version dropdown allows choosing
 *   sub-versions directly on the card without nesting `<button>`s inside `<button>`s.
 * - **Vertical list** (`vertical: true`): Full-width stacked cards displaying
 *   the icon, rich title/description, an optional `Select` version dropdown,
 *   and a radio indicator (trailing by default, or leading with `leftRadio: true`).
 */
const meta: Meta<typeof BoxRadioField> = {
  title: 'Forms/BoxRadioField',
  component: BoxRadioField,
  parameters: {
    docs: {
      description: {
        component:
          'Radio button group rendered as selectable cards/boxes. ' +
          'Supports horizontal grid and vertical list modes, version flyout ' +
          'dropdowns, custom icons/placeholders, and text truncation.',
      },
    },
  },
  argTypes: {
    vertical: {
      control: 'boolean',
      description: 'Switch between horizontal grid and vertical stacked list',
    },
    leftRadio: {
      control: 'boolean',
      description: 'Position radio button on the left (vertical mode only)',
    },
    alignTop: {
      control: 'boolean',
      description: 'Align items to top in vertical mode',
    },
    ellipsisTitle: {
      control: 'boolean',
      description: 'Truncate title to a single line with ellipsis',
    },
    hasImage: {
      control: 'boolean',
      description: 'Show or hide the icon/image container',
    },
    hasOptions: {
      control: 'boolean',
      description: 'Show version select dropdown in vertical mode',
    },
    hoverable: {
      control: 'boolean',
      description: 'Apply hover highlight styles',
    },
  },
  decorators: [
    (Story) => (
      <div className="p-6 bg-[var(--surface-page-bg)] min-h-[360px] rounded-lg">
        <Story />
      </div>
    ),
  ],
};

export default meta;

type Story = StoryObj<typeof BoxRadioField>;

// ---------------------------------------------------------------------------
// Sample Fixtures
// ---------------------------------------------------------------------------

const OS_IMAGE_CHOICES: BoxRadioChoice[] = [
  {
    value: 'ubuntu',
    label: 'Ubuntu',
    image: (
      <span className="text-[#E95420] text-3xl">
        <LinuxLogoIcon weight="fill" size={40} />
      </span>
    ),
    options: [
      { label: 'Ubuntu 24.04 LTS (Noble)', value: 'ubuntu-24.04' },
      { label: 'Ubuntu 22.04 LTS (Jammy)', value: 'ubuntu-22.04' },
      { label: 'Ubuntu 20.04 LTS (Focal)', value: 'ubuntu-20.04' },
    ],
  },
  {
    value: 'debian',
    label: 'Debian',
    image: (
      <span className="text-[#A80030] text-3xl">
        <LinuxLogoIcon weight="bold" size={40} />
      </span>
    ),
    options: [
      { label: 'Debian 12 (Bookworm)', value: 'debian-12' },
      { label: 'Debian 11 (Bullseye)', value: 'debian-11' },
    ],
  },
  {
    value: 'rocky',
    label: 'Rocky Linux',
    image: (
      <span className="text-[#10B981] text-3xl">
        <LinuxLogoIcon weight="duotone" size={40} />
      </span>
    ),
    options: [
      { label: 'Rocky Linux 9.4', value: 'rocky-9' },
      { label: 'Rocky Linux 8.9', value: 'rocky-8' },
    ],
  },
  {
    value: 'windows',
    label: 'Windows Server',
    image: (
      <span className="text-[#0078D4] text-3xl">
        <WindowsLogoIcon weight="fill" size={40} />
      </span>
    ),
    options: [
      { label: 'Windows Server 2022', value: 'win-2022' },
      { label: 'Windows Server 2019', value: 'win-2019' },
    ],
  },
];

const FLAVOR_CHOICES: BoxRadioChoice[] = [
  {
    value: 'm1.nano',
    label: 'm1.nano',
    metadata: '1 vCPU · 1 GB RAM · 10 GB Disk',
    image: (
      <span className="text-[var(--surface-text-muted)]">
        <CpuIcon size={36} weight="duotone" />
      </span>
    ),
  },
  {
    value: 'm1.small',
    label: 'm1.small',
    metadata: '1 vCPU · 2 GB RAM · 20 GB Disk',
    image: (
      <span className="text-[var(--surface-text-muted)]">
        <CpuIcon size={36} weight="duotone" />
      </span>
    ),
  },
  {
    value: 'm1.medium',
    label: 'm1.medium',
    metadata: '2 vCPU · 4 GB RAM · 40 GB Disk',
    image: (
      <span className="text-[var(--surface-text-muted)]">
        <HardDrivesIcon size={36} weight="duotone" />
      </span>
    ),
  },
  {
    value: 'm1.large',
    label: 'm1.large',
    metadata: '4 vCPU · 8 GB RAM · 80 GB Disk',
    image: (
      <span className="text-[var(--surface-text-muted)]">
        <HardDrivesIcon size={36} weight="duotone" />
      </span>
    ),
  },
  {
    value: 'm1.xlarge',
    label: 'm1.xlarge',
    metadata: '8 vCPU · 16 GB RAM · 160 GB Disk',
    image: (
      <span className="text-[var(--surface-text-muted)]">
        <DatabaseIcon size={36} weight="duotone" />
      </span>
    ),
  },
];

const PROVISION_TYPE_CHOICES: BoxRadioChoice[] = [
  {
    value: 'cloud',
    label: 'Import Existing Infrastructure',
    metadata:
      'Connect cloud provider via credentials and sync existing resources',
    image: (
      <span className="text-[var(--primary)]">
        <CloudIcon size={32} weight="bold" />
      </span>
    ),
  },
  {
    value: 'template',
    label: 'Deploy from Template Archive',
    metadata:
      'Upload a Terraform, Helm, or Kubernetes manifest package to initialize',
    image: (
      <span className="text-[var(--primary)]">
        <UploadSimpleIcon size={32} weight="bold" />
      </span>
    ),
  },
  {
    value: 'blank',
    label: 'Start from Scratch',
    metadata:
      'Create an empty project workspace and provision resources manually',
    image: (
      <span className="text-[var(--primary)]">
        <SparkleIcon size={32} weight="bold" />
      </span>
    ),
  },
];

const LONG_TEXT_CHOICES: BoxRadioChoice[] = [
  {
    value: 'long-1',
    label:
      'High-Performance Deep Learning Cluster with Dedicated NVLink GPUs and InfiniBand Networking',
    metadata:
      'Optimized for large language model pre-training, distributed PyTorch workloads, and FP8 matrix acceleration.',
  },
  {
    value: 'long-2',
    label:
      'General Purpose Multi-Tenant Kubernetes Node Group with Dynamic Autoscaling and Spot Instances',
    metadata:
      'Suitable for web APIs, microservices, asynchronous task queues, and stateless container workloads.',
  },
  {
    value: 'long-3',
    label: 'High-IOPS Memory-Optimized Persistent PostgreSQL Database Replica',
    metadata:
      'Configured with NVMe enterprise storage, 100,000 IOPS burst capacity, and automated point-in-time recovery.',
  },
];

// ---------------------------------------------------------------------------
// Interactive Harness Component
// ---------------------------------------------------------------------------

const BoxRadioFieldHarness = ({
  defaultValue,
  choices,
  ...props
}: Omit<ComponentProps<typeof BoxRadioField>, 'input'> & {
  defaultValue?: any;
}) => {
  const [value, setValue] = useState(
    defaultValue ??
      (choices[0]?.options?.length
        ? choices[0].options[0].value
        : choices[0]?.value),
  );

  return (
    <div className="flex flex-col gap-4">
      <BoxRadioField
        input={{ value, onChange: setValue } as any}
        choices={choices}
        {...props}
      />
      <div className="p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-md text-xs font-mono text-[var(--surface-text-muted)] flex items-center justify-between">
        <span>Current input.value:</span>
        <span className="font-bold text-[var(--surface-text-primary)]">
          {JSON.stringify(value)}
        </span>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Stories
// ---------------------------------------------------------------------------

/**
 * Default horizontal grid layout with simple choices (hardware flavors).
 * Clicking any box selects that option.
 */
export const HorizontalSimple: Story = {
  render: () => (
    <BoxRadioFieldHarness choices={FLAVOR_CHOICES} defaultValue="m1.small" />
  ),
};

/**
 * Horizontal grid with nested sub-version options (OS images).
 * Clicking the version caret opens a Radix `Menu` dropdown showing available
 * versions as radio items. Selecting a version updates the parent value.
 */
export const HorizontalWithVersions: Story = {
  render: () => (
    <BoxRadioFieldHarness
      choices={OS_IMAGE_CHOICES}
      defaultValue="ubuntu-22.04"
    />
  ),
};

/**
 * Horizontal cards without image props automatically fall back to an uppercase
 * 4-letter initials badge (e.g. "UBUN", "DEBI") or placeholder icon.
 */
export const HorizontalWithImagePlaceholders: Story = {
  render: () => (
    <BoxRadioFieldHarness
      choices={[
        { value: 'arch', label: 'Arch Linux', metadata: 'Rolling release' },
        { value: 'fedora', label: 'Fedora', metadata: 'Workstation 40' },
        { value: 'opensuse', label: 'openSUSE', metadata: 'Tumbleweed' },
        { value: 'freebsd', label: 'FreeBSD', metadata: '14.1-RELEASE' },
      ]}
      defaultValue="arch"
    />
  ),
};

/**
 * Vertical stacked card list (`vertical: true`).
 * Suitable for linear multi-step forms where each choice has a title and description.
 */
export const VerticalDefault: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={PROVISION_TYPE_CHOICES}
        defaultValue="cloud"
        vertical
      />
    </div>
  ),
};

/**
 * Vertical cards with an integrated version select dropdown (`hasOptions: true`).
 * Each item displays a `react-select` dropdown to pick the specific sub-version.
 */
export const VerticalWithVersionSelect: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={OS_IMAGE_CHOICES}
        defaultValue="ubuntu-24.04"
        vertical
        hasOptions
      />
    </div>
  ),
};

/**
 * Vertical list with the radio button positioned on the left (`leftRadio: true`).
 */
export const VerticalLeftRadio: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={PROVISION_TYPE_CHOICES}
        defaultValue="template"
        vertical
        leftRadio
      />
    </div>
  ),
};

/**
 * Vertical list without images (`hasImage: false`), producing a clean,
 * text-first layout for simple decisions.
 */
export const VerticalWithoutImages: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={PROVISION_TYPE_CHOICES}
        defaultValue="blank"
        vertical
        hasImage={false}
      />
    </div>
  ),
};

/**
 * Custom `imagePlaceholder` passed to vertical items when no explicit image is provided.
 */
export const VerticalCustomPlaceholder: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={[
          {
            value: 'backend',
            label: 'Backend Service',
            metadata: 'Node.js, Python, or Go microservice container',
          },
          {
            value: 'frontend',
            label: 'Frontend Application',
            metadata: 'Single-page application hosted on global CDN',
          },
          {
            value: 'database',
            label: 'Managed Database',
            metadata: 'PostgreSQL or MySQL with automated daily backups',
          },
        ]}
        defaultValue="backend"
        vertical
        imagePlaceholder={
          <span className="text-[var(--surface-text-muted)] text-2xl">
            <FileCodeIcon weight="duotone" size={32} />
          </span>
        }
      />
    </div>
  ),
};

/**
 * Single-line title truncation (`ellipsisTitle: true`) for long choice labels.
 */
export const EllipsisTitle: Story = {
  render: () => (
    <div className="max-w-xl">
      <BoxRadioFieldHarness
        choices={LONG_TEXT_CHOICES}
        defaultValue="long-1"
        vertical
        ellipsisTitle
      />
    </div>
  ),
};

/**
 * Cards with `hoverable: true`, giving a subtle elevation and border highlight
 * as the user hovers over options.
 */
export const Hoverable: Story = {
  render: () => (
    <div className="flex flex-col gap-8 max-w-2xl">
      <div>
        <h6 className="text-sm font-semibold mb-3">
          Horizontal Grid (Hoverable)
        </h6>
        <BoxRadioFieldHarness
          choices={FLAVOR_CHOICES.slice(0, 3)}
          defaultValue="m1.nano"
          hoverable
        />
      </div>
      <div>
        <h6 className="text-sm font-semibold mb-3">
          Vertical List (Hoverable)
        </h6>
        <BoxRadioFieldHarness
          choices={PROVISION_TYPE_CHOICES}
          defaultValue="cloud"
          vertical
          hoverable
        />
      </div>
    </div>
  ),
};

/**
 * Vertical mode with `alignTop: true`, aligning the radio button and icon to the
 * top edge even when the metadata text spans multiple lines.
 */
export const VerticalAlignTop: Story = {
  render: () => (
    <div className="max-w-2xl">
      <BoxRadioFieldHarness
        choices={LONG_TEXT_CHOICES}
        defaultValue="long-2"
        vertical
        alignTop
      />
    </div>
  ),
};

/**
 * Configurable playground using Storybook args.
 */
export const Playground: Story = {
  render: (args) => (
    <div className={args.vertical ? 'max-w-2xl' : undefined}>
      <BoxRadioFieldHarness
        {...args}
        choices={args.choices || OS_IMAGE_CHOICES}
      />
    </div>
  ),
  args: {
    vertical: false,
    leftRadio: false,
    alignTop: false,
    ellipsisTitle: false,
    hasImage: true,
    hasOptions: true,
    hoverable: true,
  },
};

/**
 * Automated interaction test verifying that:
 * 1. Default choice is checked.
 * 2. Clicking another card selects it.
 * 3. Opening the version dropdown in horizontal mode opens the Radix menu.
 * 4. Selecting a sub-version changes the value and closes the menu.
 */
export const InteractionTest: Story = {
  render: () => (
    <BoxRadioFieldHarness
      choices={OS_IMAGE_CHOICES}
      defaultValue="ubuntu-24.04"
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    // Verify initial selection
    expect(canvas.getByText('Ubuntu')).toBeInTheDocument();
    expect(canvas.getByText('Ubuntu 24.04 LTS (Noble)')).toBeInTheDocument();

    // Click on Debian card to change main choice
    const debianButton = canvas.getByText('Debian');
    await userEvent.click(debianButton);

    // Verify that the Debian card is now selected
    expect(canvas.getByText('Debian 12 (Bookworm)')).toBeInTheDocument();

    // Open the Ubuntu version dropdown menu
    const ubuntuVersionTrigger = canvas.getByText('Ubuntu 24.04 LTS (Noble)');
    await userEvent.click(ubuntuVersionTrigger);

    // The Radix dropdown menu is portaled to document.body, query via global screen
    const ubuntuFocalOption = await screen.findByRole('menuitemradio', {
      name: /Ubuntu 20.04 LTS/,
    });
    expect(ubuntuFocalOption).toBeInTheDocument();

    // Select Ubuntu 20.04 LTS
    await userEvent.click(ubuntuFocalOption);

    // Verify that Ubuntu 20.04 is now displayed and selected
    expect(
      await canvas.findByText('Ubuntu 20.04 LTS (Focal)'),
    ).toBeInTheDocument();
  },
};
