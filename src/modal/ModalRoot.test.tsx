/* eslint-disable testing-library/no-node-access, no-restricted-syntax */
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React, { useContext, useEffect } from 'react';
import { describe, expect, it, vi } from 'vitest';

vi.unmock('@/modal/actions');

import { DatePicker, Popover, PopoverContent, PopoverTrigger } from 'waldur-ui';

import { DirtyFormContext } from '@/core/DirtyFormContext';
import { Select } from '@/form/select';

import { useModal } from './actions';
import { ConfirmModalRoot } from './ConfirmModalRoot';
import { ModalContext, ModalProvider } from './ModalContext';
import { ModalDialog } from './ModalDialog';
import { ModalRoot } from './ModalRoot';

const SampleDialog = () => {
  return (
    <ModalDialog title="Sample Dialog">
      <input data-testid="input-1" placeholder="First input" />
      <input data-testid="input-2" placeholder="Second input" />
      <button data-testid="btn-submit" type="button">
        Submit
      </button>
    </ModalDialog>
  );
};

const NestedDialog = () => {
  const { closeDialog } = useModal();

  return (
    <ModalDialog title="Nested Dialog">
      <button data-testid="close-nested-dialog" onClick={() => closeDialog()}>
        Close nested dialog
      </button>
    </ModalDialog>
  );
};

const ParentDialog = () => {
  const { openDialog } = useModal();

  return (
    <ModalDialog title="Parent Dialog">
      <button
        data-testid="open-nested-dialog"
        onClick={() => openDialog(NestedDialog, { animation: false })}
      >
        Open nested dialog
      </button>
    </ModalDialog>
  );
};

const DirtyDialog = () => {
  const { setIsDirty } = useContext(DirtyFormContext);
  useEffect(() => {
    setIsDirty(true);
  }, [setIsDirty]);

  return (
    <ModalDialog title="Dirty Dialog">
      <input data-testid="dirty-input" placeholder="Dirty input" />
    </ModalDialog>
  );
};

const pickOption = vi.fn();

const SelectDialog = () => (
  <ModalDialog title="Select Dialog">
    <Select
      aria-label="Flavor"
      options={[{ value: 'm1.small', label: 'm1.small' }]}
      onChange={pickOption}
    />
  </ModalDialog>
);

const PopoverDialog = () => (
  <ModalDialog title="Popover Dialog">
    <input data-testid="input-1" placeholder="First input" />
    <Popover>
      <PopoverTrigger asChild>
        <button type="button" data-testid="popover-trigger">
          Open popover
        </button>
      </PopoverTrigger>
      <PopoverContent>
        <button type="button" data-testid="popover-action">
          Inside Popover
        </button>
      </PopoverContent>
    </Popover>
  </ModalDialog>
);

const DatePickerDialog = ({
  onDateChange,
}: {
  onDateChange?: (d: Date | null) => void;
}) => {
  const [val, setVal] = React.useState<Date | null>(
    new Date('2026-10-15T00:00:00.000Z'),
  );
  return (
    <ModalDialog title="Date Picker Dialog">
      <input data-testid="before-picker" placeholder="Before" />
      <DatePicker
        value={val}
        onChange={(d) => {
          setVal(d);
          onDateChange?.(d);
        }}
      />
      <input data-testid="after-picker" placeholder="After" />
    </ModalDialog>
  );
};

const ModalTrigger = ({
  component,
  props,
}: {
  component: any;
  props?: any;
}) => {
  const { openDialog } = useModal();
  return (
    <button
      type="button"
      data-testid="trigger-btn"
      onClick={() => openDialog(component, { animation: false, ...props })}
    >
      Open
    </button>
  );
};

describe('ModalRoot (a modal Radix Dialog)', () => {
  it('opens with given component, title, and backdrop overlay', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));

    expect(await screen.findByTestId('input-1')).toBeInTheDocument();
    expect(screen.getByText('Sample Dialog')).toBeInTheDocument();
    expect(document.querySelector('.modal-backdrop.show')).toBeInTheDocument();
    expect(document.querySelector('.modal.show.d-block')).toBeInTheDocument();
  });

  it('returns focus to the original trigger after closing a nested dialog', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={ParentDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    const trigger = screen.getByTestId('trigger-btn');
    await user.click(trigger);
    await user.click(await screen.findByTestId('open-nested-dialog'));
    await user.click(await screen.findByTestId('close-nested-dialog'));

    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('supports animated opening with data-state="open" and fade classes', async () => {
    const user = userEvent.setup();

    const AnimatedTrigger = () => {
      const { openDialog } = useModal();
      return (
        <button
          type="button"
          data-testid="anim-trigger-btn"
          onClick={() => openDialog(SampleDialog)}
        >
          Open Animated
        </button>
      );
    };

    render(
      <ModalProvider>
        <AnimatedTrigger />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('anim-trigger-btn'));

    await screen.findByTestId('input-1');
    const backdrop = document.querySelector('.modal-backdrop');
    const modal = document.querySelector('.modal');

    expect(backdrop).toHaveClass('fade', 'show');
    expect(backdrop).toHaveAttribute('data-state', 'open');
    expect(backdrop).not.toHaveClass('modal-no-animation');

    expect(modal).toHaveClass('fade', 'show', 'd-block');
    expect(modal).toHaveAttribute('data-state', 'open');
    expect(modal).not.toHaveClass('modal-no-animation');
  });

  it('traps Tab navigation within the modal dialog', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <button type="button" data-testid="bg-button">
          Background Button
        </button>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));

    const closeBtn = screen.getByRole('button', { name: /close/i });
    const input1 = await screen.findByTestId('input-1');
    const input2 = screen.getByTestId('input-2');
    const submitBtn = screen.getByTestId('btn-submit');

    // Focus close button (first focusable in ModalDialog)
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    // Tab to first input
    await user.tab();
    expect(document.activeElement).toBe(input1);

    // Tab to second input
    await user.tab();
    expect(document.activeElement).toBe(input2);

    // Tab to submit button (last element)
    await user.tab();
    expect(document.activeElement).toBe(submitBtn);

    // Tab on last element wraps to first element (close button)
    await user.tab();
    expect(document.activeElement).toBe(closeBtn);

    // Shift+Tab on first element wraps to last element
    await user.tab({ shift: true });
    expect(document.activeElement).toBe(submitBtn);
  });

  it('does not steal focus from portaled overlays (DatePicker, Popovers, etc.)', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={PopoverDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');

    // Open portaled popover
    await user.click(screen.getByTestId('popover-trigger'));

    const popoverBtn = await screen.findByTestId('popover-action');
    expect(popoverBtn).toBeInTheDocument();

    // Focus button inside portaled popover
    popoverBtn.focus();
    expect(document.activeElement).toBe(popoverBtn);

    // Click button inside portaled popover
    await user.click(popoverBtn);

    // Modal dialog remains open and active
    expect(document.querySelector('.modal.show.d-block')).toBeInTheDocument();
  });

  it('closes the modal dialog when Escape is pressed', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    expect(await screen.findByTestId('input-1')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByTestId('input-1')).not.toBeInTheDocument();
  });

  it('closes via header close button', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    expect(await screen.findByTestId('input-1')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /close/i });
    await user.click(closeBtn);

    expect(screen.queryByTestId('input-1')).not.toBeInTheDocument();
  });

  it('closes on backdrop click outside .modal-content', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    expect(await screen.findByTestId('input-1')).toBeInTheDocument();

    // Click on the outer .modal wrapper (backdrop area)
    const modalWrapper = document.querySelector('.modal.show.d-block')!;
    await user.click(modalWrapper);

    expect(screen.queryByTestId('input-1')).not.toBeInTheDocument();
  });

  it('does not close when clicking inside .modal-content', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    const input1 = await screen.findByTestId('input-1');

    await user.click(input1);

    expect(screen.getByTestId('input-1')).toBeInTheDocument();
  });

  it('keeps modal open if dirty form confirm is rejected, and closes when accepted', async () => {
    const user = userEvent.setup();

    let rejectConfirm: () => void;
    let resolveConfirm: () => void;
    const confirmMock = vi.fn().mockImplementation(
      () =>
        new Promise<void>((res, rej) => {
          resolveConfirm = res;
          rejectConfirm = rej;
        }),
    );

    render(
      <ModalContext.Provider
        value={
          {
            modalComponent: DirtyDialog,
            modalProps: {},
            confirmComponent: null,
            confirmProps: {},
            openDialog: vi.fn(),
            closeDialog: vi.fn(),
            returnFocusRef: { current: null },
            confirm: confirmMock,
          } as any
        }
      >
        <ModalRoot />
      </ModalContext.Provider>,
    );

    expect(await screen.findByTestId('dirty-input')).toBeInTheDocument();

    // Trigger close via Escape
    await user.keyboard('{Escape}');
    expect(confirmMock).toHaveBeenCalledTimes(1);

    // Reject confirm
    rejectConfirm!();
    await waitFor(() => {
      // Dialog remains open
      expect(screen.getByTestId('dirty-input')).toBeInTheDocument();
    });

    // Trigger close again
    await user.keyboard('{Escape}');
    expect(confirmMock).toHaveBeenCalledTimes(2);

    // Resolve confirm
    resolveConfirm!();
  });

  it('picks an option from a select inside the modal without closing dialog', async () => {
    const user = userEvent.setup();
    pickOption.mockClear();

    render(
      <ModalProvider>
        <ModalTrigger component={SelectDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await user.click(await screen.findByRole('combobox', { name: 'Flavor' }));
    await user.click(await screen.findByRole('option', { name: 'm1.small' }));

    expect(pickOption).toHaveBeenCalledWith(
      { value: 'm1.small', label: 'm1.small' },
      expect.anything(),
    );
    expect(document.querySelector('.modal.show.d-block')).toBeInTheDocument();
  });

  it('stacks ConfirmModalRoot on top of ModalRoot', async () => {
    const user = userEvent.setup();

    const OpenConfirmButton = () => {
      const { confirm } = useModal();
      return (
        <button
          type="button"
          data-testid="open-confirm-btn"
          onClick={() =>
            confirm('Confirm title', 'Are you sure?', {
              positiveButton: 'Confirm OK',
            })
          }
        >
          Open Confirm
        </button>
      );
    };

    const DialogWithConfirm = () => (
      <ModalDialog title="Parent Dialog">
        <OpenConfirmButton />
      </ModalDialog>
    );

    render(
      <ModalProvider>
        <ModalTrigger component={DialogWithConfirm} />
        <ModalRoot />
        <ConfirmModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    expect(await screen.findByText('Parent Dialog')).toBeInTheDocument();

    // Open confirmation dialog on top
    await user.click(screen.getByTestId('open-confirm-btn'));

    expect(
      await screen.findByRole('heading', { name: 'Confirm title', level: 3 }),
    ).toBeInTheDocument();
    expect(screen.getByText('Are you sure?')).toBeInTheDocument();

    // Both parent modal and confirm modal are in DOM
    const modals = document.querySelectorAll('.modal.show.d-block');
    expect(modals.length).toBe(2);

    // Confirm modal has confirm-modal class and higher z-index
    const confirmModal = document.querySelector('.modal.confirm-modal');
    expect(confirmModal).toBeInTheDocument();
  });

  it('allows interacting with DatePicker inside modal without stealing focus or getting stuck', async () => {
    const user = userEvent.setup();
    const onDateChange = vi.fn();

    render(
      <ModalProvider>
        <ModalTrigger
          component={() => <DatePickerDialog onDateChange={onDateChange} />}
        />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    const beforeInput = await screen.findByTestId('before-picker');
    const afterInput = screen.getByTestId('after-picker');

    // Type in before input
    await user.type(beforeInput, 'hello');
    expect(beforeInput).toHaveValue('hello');

    // Open DatePicker popover
    const pickerTrigger = screen.getByRole('button', {
      name: '2026-10-15',
    });
    await user.click(pickerTrigger);

    // Popover is open
    const dayBtn = await screen.findByRole('button', { name: /october 20/i });
    expect(dayBtn).toBeInTheDocument();

    // Click date in calendar
    await user.click(dayBtn);
    expect(onDateChange).toHaveBeenCalled();

    // Focus is not stuck! User can click and type into after input
    await user.click(afterInput);
    expect(document.activeElement).toBe(afterInput);
    await user.type(afterInput, 'world');
    expect(afterInput).toHaveValue('world');
  });

  it('allows moving focus out of Select to sibling inputs without getting stuck', async () => {
    const user = userEvent.setup();
    const onSelectChange = vi.fn();

    const SelectWithSiblingsDialog = () => (
      <ModalDialog title="Select Dialog">
        <input data-testid="before-select" placeholder="Before" />
        <Select
          aria-label="Flavor"
          options={[
            { value: 'm1.small', label: 'm1.small' },
            { value: 'm1.large', label: 'm1.large' },
          ]}
          onChange={onSelectChange}
        />
        <input data-testid="after-select" placeholder="After" />
      </ModalDialog>
    );

    render(
      <ModalProvider>
        <ModalTrigger component={SelectWithSiblingsDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    const beforeSelect = await screen.findByTestId('before-select');
    const afterSelect = screen.getByTestId('after-select');

    // Focus before input
    beforeSelect.focus();
    expect(document.activeElement).toBe(beforeSelect);

    // Open select and pick option
    await user.click(screen.getByRole('combobox', { name: 'Flavor' }));
    await user.click(await screen.findByRole('option', { name: 'm1.small' }));
    expect(onSelectChange).toHaveBeenCalled();

    // Click after input - focus must not be stuck in select
    await user.click(afterSelect);
    expect(document.activeElement).toBe(afterSelect);
    await user.type(afterSelect, 'smooth transition');
    expect(afterSelect).toHaveValue('smooth transition');
  });

  it('confines focus to modal if focus tries to escape to background page', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <button type="button" data-testid="background-btn">
          Background Page
        </button>
        <ModalProvider>
          <ModalTrigger component={SampleDialog} />
          <ModalRoot />
        </ModalProvider>
      </div>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    const input1 = await screen.findByTestId('input-1');
    expect(input1).toBeInTheDocument();

    // Attempt to focus element in background page behind modal
    const backgroundBtn = screen.getByTestId('background-btn');
    backgroundBtn.focus();

    // Focus guard returns focus to modal's first focusable element
    const closeBtn = screen.getByRole('button', { name: /close/i });
    expect(document.activeElement).toBe(closeBtn);
  });

  it('hides the page behind it from assistive technology', async () => {
    const user = userEvent.setup();

    render(
      <div>
        <main data-testid="page">Page content</main>
        <ModalProvider>
          <ModalTrigger component={SampleDialog} />
          <ModalRoot />
        </ModalProvider>
      </div>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    await waitFor(() =>
      expect(
        screen.getByTestId('page').closest('[aria-hidden="true"]'),
      ).not.toBeNull(),
    );
  });

  it('is named by its visible title', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));

    expect(
      await screen.findByRole('dialog', { name: 'Sample Dialog' }),
    ).toBeInTheDocument();
  });

  it('is named by a string title given with it instead', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger
          component={SampleDialog}
          props={{ title: 'Actions for web-01' }}
        />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));

    expect(
      await screen.findByRole('dialog', { name: 'Actions for web-01' }),
    ).toBeInTheDocument();
  });

  it('closes on a click in the empty part of the dialog box, as Bootstrap', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');

    // .modal-dialog takes no pointer events, so the click lands on the
    // overlay around it.
    expect(document.querySelector('.modal-dialog')).toHaveStyle({
      pointerEvents: 'none',
    });
    await user.click(document.querySelector('.modal.show.d-block')!);

    await waitFor(() =>
      expect(screen.queryByTestId('input-1')).not.toBeInTheDocument(),
    );
  });

  it('stays open on a backdrop click when the backdrop is static', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} props={{ backdrop: 'static' }} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');
    await user.click(document.querySelector('.modal.show.d-block')!);

    expect(screen.getByTestId('input-1')).toBeInTheDocument();
  });

  it('ignores Escape when the keyboard is off', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SampleDialog} props={{ keyboard: false }} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');
    await user.keyboard('{Escape}');

    expect(screen.getByTestId('input-1')).toBeInTheDocument();
  });

  it('lets Escape close an open select menu before the dialog', async () => {
    const user = userEvent.setup();

    render(
      <ModalProvider>
        <ModalTrigger component={SelectDialog} />
        <ModalRoot />
      </ModalProvider>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await user.click(await screen.findByRole('combobox', { name: 'Flavor' }));
    await screen.findByRole('option', { name: 'm1.small' });

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('option')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();

    await user.keyboard('{Escape}');
    await waitFor(() =>
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument(),
    );
  });

  it('stays open on a click in content portaled in from another React tree that opts in', async () => {
    const user = userEvent.setup();

    // Rendered by a separate root, as the docked Matrix call is.
    const Elsewhere = () => (
      <button type="button" data-dialog-inside="">
        Elsewhere
      </button>
    );

    render(
      <>
        <ModalProvider>
          <ModalTrigger component={SampleDialog} />
          <ModalRoot />
        </ModalProvider>
        <Elsewhere />
      </>,
    );

    await user.click(screen.getByTestId('trigger-btn'));
    await screen.findByTestId('input-1');
    // Radix turns pointer events off outside the dialog; the opted-in
    // overlay turns them back on, as CallSettingsMenu's popover layer does.
    const elsewhere = screen.getByText('Elsewhere');
    elsewhere.style.pointerEvents = 'auto';
    await user.click(elsewhere);

    expect(screen.getByTestId('input-1')).toBeInTheDocument();
  });
});
