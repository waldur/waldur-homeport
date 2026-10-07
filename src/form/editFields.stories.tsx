import type { Meta, StoryObj } from '@storybook/react-vite';
import { set } from 'lodash-es';
import { useState } from 'react';
import { Provider } from 'react-redux';
import { configureStore } from 'redux-mock-store';
import { expect, screen, userEvent, waitFor, within } from 'storybook/test';

import { ModalProvider } from '@/modal/ModalContext';
import { ModalRoot } from '@/modal/ModalRoot';

import { BooleanEditField, EditFieldProvider } from './editFields';

/**
 * `BooleanEditField`: a read-only yes/no row in a details panel with an edit
 * button, which opens a dialog holding the switch. The dialog asks the
 * provider's `callback` for a partial PATCH body such as
 * `{ service_attributes: { verify_ssl: true } }`, and the row shows the new
 * value once the scope updates.
 *
 * The stories run the real dialog through the real modal root. The state they
 * guard is the part that is easy to lose silently: the switch in the dialog
 * keeps its label, the PATCH body has the field's nested path, and a locked
 * row stays locked.
 */
const meta: Meta = {
  title: 'Forms/Edit fields/Boolean',
  parameters: { layout: 'padded' },
};
export default meta;

type Story = StoryObj;

/** What a details panel passes: the object, and a persist function. */
const Panel = ({
  initial,
  isStaff = false,
  readOnlyReason,
  onPatch,
  children,
}: {
  initial: Record<string, any>;
  isStaff?: boolean;
  readOnlyReason?: string;
  onPatch?: (patch: any) => void;
  children: React.ReactNode;
}) => {
  const [scope, setScope] = useState(initial);
  const store = configureStore()({
    workspace: { user: { uuid: 'user', is_staff: isStaff } },
  });
  return (
    <Provider store={store}>
      <ModalProvider>
        <ModalRoot />
        <div style={{ maxWidth: 560 }}>
          <EditFieldProvider
            scope={scope}
            readOnlyReason={readOnlyReason}
            callback={(patch) => {
              onPatch?.(patch);
              // A real callback PATCHes and the page refetches the scope.
              setScope((prev) => {
                const next = { ...prev };
                Object.entries(patch).forEach(([key, value]) =>
                  set(next, key, value),
                );
                return next;
              });
              return Promise.resolve();
            }}
          >
            {children}
          </EditFieldProvider>
        </div>
      </ModalProvider>
    </Provider>
  );
};

export const ShowsValueAsCheckOrCross: Story = {
  render: () => (
    <Panel initial={{ service_attributes: { verify_ssl: true, debug: false } }}>
      <BooleanEditField
        name="service_attributes.verify_ssl"
        label="Verify SSL"
        description="Reject certificates the server cannot verify."
      />
      <BooleanEditField name="service_attributes.debug" label="Debug logging" />
    </Panel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByText('Verify SSL')).toBeVisible();
    await expect(
      canvas.getByText('Reject certificates the server cannot verify.'),
    ).toBeVisible();
    await expect(
      canvas.getByTestId('edit-service_attributes.verify_ssl'),
    ).toBeVisible();
    await expect(
      canvas.getByTestId('edit-service_attributes.debug'),
    ).toBeVisible();
  },
};

export const EditsAtNestedPath: Story = {
  render: () => {
    return (
      <Panel
        initial={{ service_attributes: { verify_ssl: false } }}
        onPatch={(patch) => {
          (window as any).__lastPatch = patch;
        }}
      >
        <BooleanEditField
          name="service_attributes.verify_ssl"
          label="Verify SSL"
        />
      </Panel>
    );
  },
  play: async ({ canvasElement }) => {
    (window as any).__lastPatch = undefined;
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByTestId('edit-service_attributes.verify_ssl'),
    );

    // The dialog's switch keeps the field's label as its accessible name.
    const control = await screen.findByRole('checkbox', {
      name: 'Verify SSL',
    });
    await expect(control).not.toBeChecked();
    // Nothing to confirm until the value changes.
    const confirm = screen.getByRole('button', { name: /confirm/i });
    await expect(confirm).toBeDisabled();

    await userEvent.click(control);
    await expect(control).toBeChecked();
    await expect(confirm).toBeEnabled();
    await userEvent.click(confirm);

    await waitFor(() =>
      expect((window as any).__lastPatch).toEqual({
        service_attributes: { verify_ssl: true },
      }),
    );
    // The dialog closes once the callback resolves.
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());
  },
};

export const HiddenLabelStillNamesTheSwitch: Story = {
  render: () => (
    <Panel initial={{ enabled: false }}>
      <BooleanEditField name="enabled" label="Enable policy" hideLabel />
    </Panel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByTestId('edit-enabled'));
    // `hideLabel` drops the heading above the control, not the control's name:
    // a switch with no name is unreadable to a screen reader.
    await expect(await screen.findByRole('checkbox')).toHaveAccessibleName(
      'Enable policy',
    );
  },
};

export const StaffOnly: Story = {
  render: () => (
    <>
      <Panel initial={{ flag: true }} isStaff>
        <BooleanEditField name="flag" label="As staff" isStaffOnly />
      </Panel>
      <Panel initial={{ flag: true }}>
        <BooleanEditField name="flag" label="As a customer" isStaffOnly />
      </Panel>
    </>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Staff get the edit button beside the indicator; others only the indicator.
    await expect(canvas.getAllByTestId('edit-flag')).toHaveLength(1);
  },
};

export const DisabledExplainsWhy: Story = {
  render: () => (
    <Panel
      initial={{ locked: true }}
      readOnlyReason="This call is active and cannot be edited."
    >
      <BooleanEditField name="locked" label="Locked field" disabled />
    </Panel>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByTestId('edit-locked')).toBeDisabled();
  },
};
