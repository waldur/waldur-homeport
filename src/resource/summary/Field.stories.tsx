import type { Meta, StoryObj } from '@storybook/react-vite';

import { ExpandableContainer } from '@/table/ExpandableContainer';

import { Field } from './Field';

/**
 * `Field` is the label / value row of summary panels and expandable rows.
 * The label takes `labelCol` twelfths and the value `valueCol` twelfths from
 * `sm` up; below `sm` they stack. `isStuck` keeps the value right beside an
 * auto-width label at every size, and `ExpandableContainer asTable` lays a
 * list of fields out as a two-column table.
 */
const meta: Meta<typeof Field> = {
  title: 'Resource/Summary/Field',
  component: Field,
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj<typeof Field>;

export const Default: Story = {
  render: () => (
    <>
      <Field label="Name" value="production-cluster-01" />
      <Field label="State" value="OK" />
      <Field
        label="Description"
        value="A longer value that wraps onto a second line when the column gets narrow, to show how the value cell grows."
      />
      <Field label="Backend ID" value="7c9e6679-7425-40de-944b" hasCopy />
    </>
  ),
};

export const CustomColumns: Story = {
  render: () => (
    <>
      <Field label="Requested role" value="Manager" labelCol={5} valueCol={7} />
      <Field label="Organization" value="ACME" labelCol={4} valueCol={8} />
      <Field label="Stacked" value="Full width" labelCol={12} valueCol={12} />
    </>
  ),
};

export const Stuck: Story = {
  render: () => (
    <>
      <Field label="Created" value="2026-10-27 12:00" isStuck />
      <Field label="Assignee" value="Support team" isStuck />
    </>
  ),
};

export const LabelWidth: Story = {
  render: () => (
    <>
      <Field label="Region" value="eu-north-1" labelWidth={160} />
      <Field label="Availability zone" value="a" labelWidth={160} />
    </>
  ),
};

export const AutoWidth: Story = {
  render: () => (
    <Field
      label="Current end date"
      value="2026-12-31"
      labelCol="auto"
      valueCol="auto"
      valueClass="ms-auto"
      xs="auto"
    />
  ),
};

export const AsTable: Story = {
  render: () => (
    <ExpandableContainer asTable>
      <Field label="Name" value="production-cluster-01" />
      <Field label="State" value="OK" isStuck />
      <Field label="Backend ID" value="7c9e6679-7425-40de-944b" />
    </ExpandableContainer>
  ),
};
