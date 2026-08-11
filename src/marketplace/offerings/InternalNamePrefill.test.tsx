import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Field, Form } from 'react-final-form';
import { describe, expect, it, vi } from 'vitest';

import { InternalNamePrefill } from './InternalNamePrefill';

const renderHarness = (initialValues = {}, disabled = false) =>
  render(
    <Form
      onSubmit={vi.fn()}
      initialValues={initialValues}
      render={() => (
        <form>
          <Field name="label" component="input" aria-label="display" />
          <Field name="name" component="input" aria-label="internal" />
          <InternalNamePrefill
            source="label"
            target="name"
            disabled={disabled}
          />
        </form>
      )}
    />,
  );

const display = () => screen.getByLabelText('display') as HTMLInputElement;
const internal = () => screen.getByLabelText('internal') as HTMLInputElement;

describe('InternalNamePrefill', () => {
  const user = userEvent.setup();

  it('fills the internal name from a cleaned display name', async () => {
    renderHarness();
    await user.type(display(), 'CPU hours');
    expect(internal().value).toBe('cpu_hours');
  });

  it('keeps tracking the display name until the internal name is edited', async () => {
    renderHarness();
    await user.type(display(), 'CPU hours');
    expect(internal().value).toBe('cpu_hours');
    await user.clear(display());
    await user.type(display(), 'GPU hours');
    expect(internal().value).toBe('gpu_hours');
  });

  it('stops auto-filling once the internal name is edited by hand', async () => {
    renderHarness();
    await user.type(display(), 'CPU hours');
    expect(internal().value).toBe('cpu_hours');

    // User appends to the internal name manually.
    await user.type(internal(), '_edited');
    expect(internal().value).toBe('cpu_hours_edited');

    // Further display-name edits must not clobber the manual value.
    await user.type(display(), ' extra');
    expect(internal().value).toBe('cpu_hours_edited');
  });

  it('does not refill the internal name after it is cleared by hand', async () => {
    renderHarness();
    await user.type(display(), 'CPU hours');
    expect(internal().value).toBe('cpu_hours');
    await user.clear(internal());
    expect(internal().value).toBe('');
  });

  it('does not overwrite an existing internal name (edit mode)', async () => {
    renderHarness({ label: 'Existing', name: 'existing_internal' });
    await user.type(display(), ' renamed');
    expect(internal().value).toBe('existing_internal');
  });

  it('does nothing when disabled', async () => {
    renderHarness({}, true);
    await user.type(display(), 'CPU hours');
    expect(internal().value).toBe('');
  });
});
