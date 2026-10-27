import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input } from './Input';
import { InputGroup } from './InputGroup';
import { Textarea } from './Textarea';

const meta: Meta<typeof InputGroup> = {
  title: 'Forms/Text inputs/Input group',
  component: InputGroup,
  parameters: {
    docs: {
      description: {
        component:
          'Puts adornments inside an `Input` or `Textarea`: `start` (an icon, a prefix) and `end` (a unit, a button), and the warning icon of an `invalid` field. The group measures them and sets `--input-start` / `--input-end`, so the text clears them at any width. `NumberInput` and `SecretInput` are built on it. Adornments let clicks through to the field; give a control inside one `pointer-events-auto`.',
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof InputGroup>;

const SearchIcon = <MagnifyingGlassIcon size={20} weight="bold" />;

export const Start: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-3 p-5">
      <InputGroup start={SearchIcon}>
        <Input aria-label="Search" placeholder="Search..." />
      </InputGroup>
      <InputGroup start={<span className="text-secondary">+372</span>}>
        <Input aria-label="Phone" type="tel" placeholder="5555 5555" />
      </InputGroup>
    </div>
  ),
};

export const End: Story = {
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-3 p-5">
      <InputGroup end={<span className="text-sm">EUR</span>}>
        <Input aria-label="Price" defaultValue="12.50" />
      </InputGroup>
      <InputGroup end={<span className="text-sm">per month</span>}>
        <Input aria-label="Long unit" defaultValue="12.50" />
      </InputGroup>
    </div>
  ),
};

/** The warning icon sits beside whatever `end` holds, and the text clears both. */
export const InvalidIcon: Story = {
  name: 'Invalid icon',
  render: () => (
    <div className="flex max-w-[420px] flex-col gap-3 p-5">
      <InputGroup invalid>
        <Input aria-label="Invalid" invalid defaultValue="Not an email" />
      </InputGroup>
      <InputGroup invalid end={<span className="text-sm">EUR</span>}>
        <Input aria-label="Invalid with unit" invalid defaultValue="12.50" />
      </InputGroup>
      <InputGroup
        invalid
        start={SearchIcon}
        end={<span className="text-sm">per month</span>}
      >
        <Input aria-label="Invalid both" invalid defaultValue="Both sides" />
      </InputGroup>
      <InputGroup invalid align="top">
        <Textarea
          aria-label="Invalid textarea"
          invalid
          rows={3}
          defaultValue="Too short"
        />
      </InputGroup>
    </div>
  ),
};
