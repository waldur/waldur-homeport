import { PencilSimpleIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { FC, ReactNode, useState } from 'react';
import { expect, userEvent, within } from 'storybook/test';

import { Badge } from '../Badge';
import { BaseButton } from '../Button';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { Input } from '../Input';

import {
  CopyableValue,
  PropertyCard,
  PropertyItem,
  type PropertyItemProps,
  PropertyList,
  type PropertyListVariant,
} from './PropertyList';

const meta: Meta<typeof PropertyList> = {
  title: 'Data Display/PropertyList',
  component: PropertyList,
  subcomponents: { PropertyItem, PropertyCard },
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    a11y: { test: 'error' },
    docs: {
      description: {
        component: `Label/value pairs about one object, as an accessible \`<dl>\`: each \`PropertyItem\` is a \`<dt>\` term and a \`<dd>\` value named by it.

Pick the variant by what the block is:
- **divided** (default) — a property sheet: bordered rows, optional description under the term, an actions column for edit buttons (\`*EditField\` rows render this).
- **summary** — a read-only summary, as in an expandable table row (\`ExpandableContainer asTable\`): no borders, colon after string labels, empty values left out (\`0\` is shown).
- **compact** — dense label-left / value-right rows for stat cards and popovers.

A \`PropertyItem\` outside any list wraps itself in a \`<dl>\`. It is \`divided\` when its call site writes \`actions\`, \`description\`, \`required\` or \`disabled\`, else \`summary\`.`,
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof PropertyList>;

const story = (text: string) => ({ docs: { description: { story: text } } });

const Section: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-6 last:mb-0">
    <h4 className="mb-2 text-sm font-semibold text-secondary">{title}</h4>
    {children}
  </section>
);

const EditButton: FC<{ label?: string; disabledReason?: string }> = ({
  label = 'Edit',
  disabledReason,
}) => (
  <BaseButton
    variant="tertiary"
    size="sm"
    iconNode={<PencilSimpleIcon weight="bold" />}
    tooltip={label}
    disabled={Boolean(disabledReason)}
    disabledReason={disabledReason}
  />
);

const ActiveBadge = () => (
  <Badge variant="success" shape="pill" tone="outline" hasBullet>
    Active
  </Badge>
);

/* ------------------------------------------------------------------------ */
/* Playground                                                               */
/* ------------------------------------------------------------------------ */

type PlaygroundArgs = Pick<
  PropertyItemProps,
  | 'label'
  | 'value'
  | 'description'
  | 'tooltip'
  | 'warnTooltip'
  | 'required'
  | 'hasCopy'
  | 'colon'
> & {
  variant: PropertyListVariant;
  detailsMode: boolean;
  hideActions: boolean;
  alignTop: boolean;
  withActions: boolean;
};

export const Playground: StoryObj<PlaygroundArgs> = {
  parameters: story(
    'One row with its props as Controls, between two fixed rows so the variant and list flags read in context. `description`, actions and `required` show in the divided variant only.',
  ),
  argTypes: {
    variant: {
      control: 'radio',
      options: ['divided', 'summary', 'compact'],
    },
    value: { control: 'text' },
    description: { control: 'text' },
    tooltip: { control: 'text' },
    warnTooltip: { control: 'text' },
  },
  args: {
    variant: 'divided',
    detailsMode: false,
    hideActions: false,
    alignTop: false,
    withActions: true,
    label: 'Backend URL',
    value: 'https://keystone.example.com:5000/v3',
    description: 'Identity endpoint of the OpenStack deployment.',
    tooltip: '',
    warnTooltip: '',
    required: false,
    hasCopy: false,
  },
  render: ({
    variant,
    detailsMode,
    hideActions,
    alignTop,
    withActions,
    ...item
  }) => (
    <PropertyList
      variant={variant}
      detailsMode={detailsMode}
      hideActions={hideActions}
      alignTop={alignTop}
    >
      <PropertyItem label="Name" value="Tartu HPC cloud" />
      <PropertyItem
        {...item}
        tooltip={item.tooltip || undefined}
        warnTooltip={item.warnTooltip || undefined}
        actions={withActions ? <EditButton /> : undefined}
      />
      <PropertyItem label="State" value={<ActiveBadge />} />
    </PropertyList>
  ),
};

/* ------------------------------------------------------------------------ */
/* Variants                                                                 */
/* ------------------------------------------------------------------------ */

export const Divided: Story = {
  parameters: story(
    'The property sheet: settings and details panels. The term column takes a quarter of the width, or a third once any row has a description; actions shrink to fit.',
  ),
  render: () => (
    <Card bordered>
      <CardHeader>
        <CardTitle size="lg">Organization details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <PropertyList>
          <PropertyItem
            label="Name"
            description="Legal entity name used on invoices."
            value="Nordic Cloud Research Council"
            required
            actions={<EditButton />}
          />
          <PropertyItem
            label="Registration code"
            value="EE-90014210"
            hasCopy
            actions={<EditButton />}
          />
          <PropertyItem
            label="Billing status"
            tooltip="Set by the accounting system."
            value={<ActiveBadge />}
          />
          <PropertyItem
            label="VAT code"
            warnTooltip="Not validated against VIES yet."
            value="EE102030405"
            actions={<EditButton />}
          />
        </PropertyList>
      </CardContent>
    </Card>
  ),
};

export const DetailsMode: Story = {
  name: 'Divided: details mode',
  parameters: story(
    '`detailsMode` mutes values for read-only detail pages; `hideActions` drops the actions column, so the term column sizes to its content.',
  ),
  render: () => (
    <Card bordered className="max-w-[1024px]">
      <CardHeader>
        <CardTitle size="lg">Resource details</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <PropertyList detailsMode hideActions>
          <PropertyItem label="Resource type" value="OpenStack tenant" />
          <PropertyItem label="Offering" value="Test Cloud HPC" />
          <PropertyItem label="Organization" value="Nordic Cloud" />
          <PropertyItem label="Plan" value="Default limit-based (monthly)" />
          <PropertyItem label="Created" value="2026-04-24 11:50" />
          <PropertyItem
            label="UUID"
            value="44303306c8654a7f8bb9674ee5a9659a"
            hasCopy
          />
        </PropertyList>
      </CardContent>
    </Card>
  ),
};

export const AlignTop: Story = {
  name: 'Divided: align top',
  parameters: story(
    '`alignTop` pins term, value and actions to the top of the row, for values that run over several lines.',
  ),
  render: () => (
    <PropertyList alignTop>
      <PropertyItem
        label="Description"
        value="Shared GPU partition for the bioinformatics groups. Jobs over 48 hours need prior approval from the resource allocator; checkpointing is strongly encouraged for anything longer than a day."
        actions={<EditButton />}
      />
      <PropertyItem
        label="Partition"
        value="gpu-a100"
        actions={<EditButton />}
      />
    </PropertyList>
  ),
};

export const SeveralCopyableValues: Story = {
  name: 'Divided: several copyable values',
  parameters: story(
    'A row of several values that each copy themselves holds one `CopyableValue` per value; `hasCopy` copies the row as a whole.',
  ),
  render: () => (
    <PropertyList>
      <PropertyItem label="Offering" value="Tartu HPC cloud" />
      <PropertyItem label="Fixed IPs">
        <CopyableValue value="10.0.0.12" />
        <CopyableValue value="10.0.0.13" />
      </PropertyItem>
    </PropertyList>
  ),
};

export const Summary: Story = {
  parameters: story(
    'The read-only summary of an expandable table row. Empty values are left out and `0` is shown; string labels get a colon, and labels over 20 characters are shortened behind a tooltip.',
  ),
  render: () => (
    <PropertyList variant="summary">
      <PropertyItem label="Name" value="production-cluster-01" />
      <PropertyItem label="Region" value="eu-north-1" />
      <PropertyItem label="Nodes" value={0} />
      <PropertyItem label="Description" value="" />
      <PropertyItem
        label="Kubernetes version"
        value="1.30.2"
        tooltip="Reported by the cluster agent."
      />
      <PropertyItem label="Backend ID of the tenant network" value="net-7c9e" />
      <PropertyItem
        label="UUID"
        value="7c9e6679-7425-40de-944b-e0d58f90a811"
        hasCopy
      />
    </PropertyList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText(/Description/)).not.toBeInTheDocument();
    await expect(
      canvas.getByRole('definition', { name: 'Nodes:' }),
    ).toHaveTextContent('0');
  },
};

export const SummaryLayout: Story = {
  name: 'Summary: layout',
  parameters: story(
    'Summary rows size their term column using `termWidth`: presets (`sm`, `md`, `lg`, `xl`), CSS length, or `auto` for inline content-sized labels, with `space` for vertical row spacing.',
  ),
  render: () => (
    <>
      <Section title="Default (termWidth='md' / 200px)">
        <PropertyList variant="summary">
          <PropertyItem label="Flavor" value="m1.large" />
          <PropertyItem label="Image" value="Ubuntu 24.04" />
        </PropertyList>
      </Section>
      <Section title="termWidth='sm' (160px)">
        <PropertyList variant="summary" termWidth="sm">
          <PropertyItem label="Flavor" value="m1.large" />
          <PropertyItem label="Image" value="Ubuntu 24.04" />
        </PropertyList>
      </Section>
      <Section title="termWidth='lg' (240px)">
        <PropertyList variant="summary" termWidth="lg">
          <PropertyItem label="Flavor" value="m1.large" />
          <PropertyItem label="Image" value="Ubuntu 24.04" />
        </PropertyList>
      </Section>
      <Section title="termWidth='auto'">
        <PropertyList variant="summary" termWidth="auto">
          <PropertyItem label="Flavor" value="m1.large" />
          <PropertyItem label="Image" value="Ubuntu 24.04" />
        </PropertyList>
      </Section>
      <Section title="space={3}">
        <PropertyList variant="summary" space={3}>
          <PropertyItem label="Flavor" value="m1.large" />
          <PropertyItem label="Image" value="Ubuntu 24.04" />
        </PropertyList>
      </Section>
    </>
  ),
};

export const Compact: Story = {
  parameters: story(
    'Dense key-left / value-right rows for stat cards and popovers.',
  ),
  render: () => (
    <Card bordered className="max-w-sm">
      <CardHeader>
        <CardTitle>Memory settings</CardTitle>
      </CardHeader>
      <CardContent>
        <PropertyList variant="compact">
          <PropertyItem label="Shared buffers" value={<code>16384</code>} />
          <PropertyItem
            label="Effective cache size"
            value={<code>524288</code>}
          />
          <PropertyItem label="Active connections" value={42} />
        </PropertyList>
      </CardContent>
    </Card>
  ),
};

/* ------------------------------------------------------------------------ */
/* Card                                                                     */
/* ------------------------------------------------------------------------ */

export const WithCard: Story = {
  name: 'PropertyCard',
  parameters: story(
    '`PropertyCard` frames a list with a title, an optional refresh button (`refetch`, `loading`) and header `actions`. The refresh button is named by a translated "Refresh" / "Loading".',
  ),
  render: () => {
    const [loading, setLoading] = useState(false);
    return (
      <PropertyCard
        title="Metadata"
        bordered
        loading={loading}
        refetch={() => {
          setLoading(true);
          window.setTimeout(() => setLoading(false), 1500);
        }}
        actions={<BaseButton variant="secondary" size="sm" label="Sync" />}
      >
        <PropertyList detailsMode>
          <PropertyItem label="Category" value="Private clouds" />
          <PropertyItem label="Backend ID" value="ncrc-prod-01" hasCopy />
        </PropertyList>
      </PropertyCard>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole('button', { name: 'Refresh' }),
    ).toBeInTheDocument();
  },
};

/* ------------------------------------------------------------------------ */
/* Behaviour                                                                */
/* ------------------------------------------------------------------------ */

const LONG_DESCRIPTION =
  'POSIX UID supplied by the identity provider. It is the numeric user ID on every cluster the user gets an account on, so changing it after accounts exist orphans files owned by the old UID.';

export const LongDescription: Story = {
  name: 'Behaviour: long description',
  parameters: story(
    'Descriptions are clamped to two lines; hovering one shows the full text.',
  ),
  render: () => (
    <PropertyList>
      <PropertyItem
        label="UID"
        description={LONG_DESCRIPTION}
        value="100231"
        actions={<EditButton />}
      />
    </PropertyList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByText(LONG_DESCRIPTION));
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent(LONG_DESCRIPTION);
  },
};

export const CopyValue: Story = {
  name: 'Behaviour: copy',
  parameters: story(
    '`hasCopy` adds a copy icon at the far end of the value cell, for a string or number value, named "Copy to clipboard" (override with `copyLabel`). For a JSX value pass the text as `copyValue`. A dash placeholder gets no icon. A `CopyFeedbackProvider` (the app turns it into a toast) hears each copy, named by the row label.',
  ),
  render: () => (
    <>
      <Section title="Divided">
        <PropertyList>
          <PropertyItem
            label="Backend ID"
            value="7c9e6679-7425-40de-944b-e0d58f90a811"
            hasCopy
          />
        </PropertyList>
      </Section>
      <Section title="Summary">
        <PropertyList variant="summary">
          <PropertyItem label="Floating IP" value="193.40.12.7" hasCopy />
          <PropertyItem
            label="Internal IPs"
            value={<span>10.0.0.4, 10.0.0.5</span>}
            copyValue="10.0.0.4, 10.0.0.5"
          />
          <PropertyItem label="Router" value="—" hasCopy />
        </PropertyList>
      </Section>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getAllByRole('button', { name: 'Copy to clipboard' }),
    ).toHaveLength(3);
  },
};

export const InlineControls: Story = {
  name: 'Behaviour: inline controls',
  parameters: story(
    'When a form control mounts in a row, the term becomes its `<label>` and the description its accessible description. Read-only rows render the term as a `<span>`, so there are no orphan labels.',
  ),
  render: () => (
    <>
      <Section title="Divided">
        <PropertyList>
          <PropertyItem
            label="Retention"
            description="Days to keep backups."
            value={<Input defaultValue="30" />}
          />
        </PropertyList>
      </Section>
      <Section title="Summary">
        <PropertyList variant="summary">
          <PropertyItem label="Snapshots" value={<Input defaultValue="7" />} />
        </PropertyList>
      </Section>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const retention = canvas.getByLabelText('Retention');
    await expect(retention).toHaveAccessibleDescription(
      'Days to keep backups.',
    );
    await expect(canvas.getByLabelText('Snapshots:')).toHaveValue('7');
  },
};

export const DisabledActions: Story = {
  name: 'Behaviour: disabled row',
  parameters: story(
    '`disabled` (which every `*EditField` passes) leaves the actions slot alone: the disabled button keeps its own state and its reason tooltip stays hoverable.',
  ),
  render: () => (
    <PropertyList>
      <PropertyItem
        label="Email"
        value="jane@example.com"
        disabled
        actions={
          <BaseButton
            variant="tertiary"
            size="sm"
            label="Edit"
            disabled
            disabledReason="Managed by your identity provider."
          />
        }
      />
    </PropertyList>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.hover(canvas.getByRole('button', { name: 'Edit' }));
    await expect(
      await within(canvasElement.ownerDocument.body).findByRole('tooltip'),
    ).toHaveTextContent('Managed by your identity provider.');
  },
};

export const Standalone: Story = {
  name: 'Behaviour: standalone item',
  parameters: story(
    'Outside a list an item wraps itself in a `<dl>`. Writing any of `actions`, `description`, `required` or `disabled` makes it divided, whatever the value, so a conditional `actions={canEdit ? … : undefined}` never switches the variant. Without them it is a summary row.',
  ),
  render: () => {
    const [canEdit, setCanEdit] = useState(true);
    return (
      <>
        <BaseButton
          variant="tertiary"
          size="sm"
          className="mb-3"
          label={canEdit ? 'Can edit: on' : 'Can edit: off'}
          onClick={() => setCanEdit((value) => !value)}
        />
        <PropertyItem
          label="Location"
          value="59.43, 24.75"
          actions={canEdit ? <EditButton /> : undefined}
        />
        <PropertyItem
          label="Contact"
          value=""
          actions={canEdit ? <EditButton /> : undefined}
        />
        <PropertyItem label="Country" value="Estonia" />
      </>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole('button', { name: 'Can edit: on' }));
    await expect(canvas.getByText('Location')).toBeInTheDocument();
    await expect(canvas.getByText('Contact')).toBeInTheDocument();
    await expect(canvas.getByText('Country:')).toBeInTheDocument();
  },
};

/* ------------------------------------------------------------------------ */
/* Call-site conventions                                                    */
/* ------------------------------------------------------------------------ */

const ResourceFields = () => (
  <>
    <PropertyItem label="Name" value="db-01" tooltip="Name in the backend." />
    <PropertyItem label="Description" value="" />
    <PropertyItem label="Flavor" value="m1.large" />
  </>
);

export const OneComponentTwoVariants: Story = {
  name: 'Convention: one component, two variants',
  parameters: story(
    'Shared field components (`ResourceSummaryBase`, `ResourceSummary`) take the variant of the list around them. The same rows then differ: the help icon sits by the term or after the value, string labels gain a colon, and an empty row shows a dash in divided but is left out in summary. Pass `renderFieldOrDash(value)` in a summary list where an empty row should still appear.',
  ),
  render: () => (
    <>
      <Section title="In a divided PropertyList">
        <PropertyList>
          <ResourceFields />
        </PropertyList>
      </Section>
      <Section title="In ExpandableContainer asTable (summary)">
        <PropertyList variant="summary">
          <ResourceFields />
        </PropertyList>
      </Section>
    </>
  ),
};

export const LabelColons: Story = {
  name: 'Convention: label colons',
  parameters: story(
    'Summary appends a colon to string labels only; pass `colon={false}` to drop it. A JSX label gets none, so give the text as a string where you can, and put secondary text in `description` on a divided row rather than inside the label.',
  ),
  render: () => (
    <PropertyList variant="summary">
      <PropertyItem label="Flavor" value="m1.large" />
      <PropertyItem label="Flavor" value="m1.large" colon={false} />
      <PropertyItem label={<span>How satisfied are you?</span>} value="Very" />
    </PropertyList>
  ),
};

export const SectionGroups: Story = {
  name: 'Sections: grouped properties',
  parameters: story(
    'PropertyList.Section groups properties under a semantic section header with title and description, keeping <dl> DOM semantics valid.',
  ),
  render: () => (
    <PropertyList variant="divided">
      <PropertyList.Section
        title="General configuration"
        description="Core machine and networking settings"
      >
        <PropertyItem label="Instance name" value="prod-worker-01" />
        <PropertyItem label="IP address" value="192.168.1.50" copyable />
      </PropertyList.Section>
      <PropertyList.Section
        title="Resource allocation"
        description="Allocated hardware and quotas"
      >
        <PropertyItem label="CPU cores" value={8} />
        <PropertyItem label="RAM" value="32 GB" />
      </PropertyList.Section>
    </PropertyList>
  ),
};
