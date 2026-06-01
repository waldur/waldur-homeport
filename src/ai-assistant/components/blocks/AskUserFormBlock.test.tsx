import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { UIBlock } from '@/ai-assistant/lib/types';

import {
  AskUserFormBlock,
  BUTTON_GROUP_OPTION_LIMIT,
  composeReply,
  isAnswered,
  modeFor,
} from './AskUserFormBlock';
import { OfflineBlockContext } from './offlineBlockContext';

type Question = NonNullable<UIBlock['questions']>[number];

const buildOptions = (count: number) =>
  Array.from({ length: count }, (_, i) => ({
    id: `o${i + 1}`,
    label: `Option ${i + 1}`,
  }));

const buildBlock = (questions: Question[]): UIBlock => ({
  id: 'b1',
  key: 'ask_user_form',
  content: '',
  status: 'complete',
  questions,
});

describe('modeFor', () => {
  it('returns freeform when options are missing', () => {
    expect(modeFor({ id: 'q1', question: 'q' })).toBe('freeform');
  });

  it('returns freeform when options array is empty', () => {
    expect(modeFor({ id: 'q1', question: 'q', options: [] })).toBe('freeform');
  });

  it('returns buttons at exactly the BUTTON_GROUP_OPTION_LIMIT', () => {
    const q: Question = {
      id: 'q1',
      question: 'q',
      options: buildOptions(BUTTON_GROUP_OPTION_LIMIT),
    };
    expect(modeFor(q)).toBe('buttons');
  });

  it('switches to list one option past the limit', () => {
    const q: Question = {
      id: 'q1',
      question: 'q',
      options: buildOptions(BUTTON_GROUP_OPTION_LIMIT + 1),
    };
    expect(modeFor(q)).toBe('list');
  });
});

describe('isAnswered', () => {
  const buttonsQ: Question = {
    id: 'q1',
    question: 'q',
    options: buildOptions(3),
  };
  const freeformQ: Question = { id: 'q2', question: 'q' };

  it('reports false for an empty pick set with no custom text', () => {
    expect(
      isAnswered(buttonsQ, { picks: [], other: '', otherOpen: false }),
    ).toBe(false);
  });

  it('reports true once a pill is picked', () => {
    expect(
      isAnswered(buttonsQ, {
        picks: [buttonsQ.options![0]],
        other: '',
        otherOpen: false,
      }),
    ).toBe(true);
  });

  it('reports true when only custom "other" text is filled', () => {
    expect(
      isAnswered(buttonsQ, { picks: [], other: 'custom', otherOpen: true }),
    ).toBe(true);
  });

  it('treats whitespace-only freeform input as unanswered', () => {
    expect(isAnswered(freeformQ, { text: '   ' })).toBe(false);
  });

  it('reports true for non-empty freeform input', () => {
    expect(isAnswered(freeformQ, { text: 'hello' })).toBe(true);
  });
});

describe('composeReply', () => {
  const q1: Question = {
    id: 'q1',
    header: 'Region',
    question: 'Which region?',
    options: [
      { id: 'r1', label: 'EU North' },
      { id: 'r2', label: 'EU West' },
    ],
  };
  const freeformQ: Question = { id: 'q2', question: 'Notes?' };

  it('uses option labels and ends with a period', () => {
    const reply = composeReply(
      [q1],
      [{ picks: [q1.options![0]], other: '', otherOpen: false }],
    );
    expect(reply).toBe('Region: EU North.');
  });

  it('joins multi-select picks with commas', () => {
    const reply = composeReply(
      [q1],
      [{ picks: q1.options!, other: '', otherOpen: false }],
    );
    expect(reply).toBe('Region: EU North, EU West.');
  });

  it('appends a quoted custom answer alongside picks', () => {
    const reply = composeReply(
      [q1],
      [
        {
          picks: [q1.options![0]],
          other: 'Custom region',
          otherOpen: true,
        },
      ],
    );
    expect(reply).toBe('Region: EU North, "Custom region".');
  });

  it('falls back to the question text when no header is provided', () => {
    const reply = composeReply([freeformQ], [{ text: 'just a note' }]);
    expect(reply).toBe('Notes?: just a note.');
  });

  it('does not double-terminate when the value already ends with a period', () => {
    const reply = composeReply([freeformQ], [{ text: 'Done.' }]);
    expect(reply).toBe('Notes?: Done.');
  });

  it('skips questions whose answer is empty', () => {
    const reply = composeReply(
      [q1, freeformQ],
      [{ picks: [], other: '', otherOpen: false }, { text: 'hi' }],
    );
    expect(reply).toBe('Notes?: hi.');
  });
});

describe('AskUserFormBlock rendering', () => {
  const renderOffline = (block: UIBlock) =>
    render(
      <OfflineBlockContext.Provider value={true}>
        <AskUserFormBlock block={block} />
      </OfflineBlockContext.Provider>,
    );

  it('renders pill buttons for short option lists', () => {
    renderOffline(
      buildBlock([
        { id: 'q1', question: 'Pick one', options: buildOptions(3) },
      ]),
    );
    expect(screen.getByRole('radio', { name: 'Option 1' })).toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/Search/)).not.toBeInTheDocument();
  });

  it('switches to a searchable dropdown past the option limit', () => {
    renderOffline(
      buildBlock([
        {
          id: 'q1',
          question: 'Pick one',
          options: buildOptions(BUTTON_GROUP_OPTION_LIMIT + 1),
        },
      ]),
    );
    expect(screen.queryByRole('radio')).not.toBeInTheDocument();
    expect(screen.getByRole('combobox')).toBeInTheDocument();
    expect(screen.getByText('Search…')).toBeInTheDocument();
  });

  it('marks the picked pill and dims the others on single-select', async () => {
    const user = userEvent.setup();
    renderOffline(
      buildBlock([
        { id: 'q1', question: 'Pick one', options: buildOptions(3) },
      ]),
    );
    const pill1 = screen.getByRole('radio', { name: 'Option 1' });
    await user.click(pill1);
    expect(pill1.getAttribute('data-picked')).toBe('1');
    expect(pill1.getAttribute('data-dimmed')).toBe('0');

    const pill2 = screen.getByRole('radio', { name: 'Option 2' });
    expect(pill2.getAttribute('data-picked')).toBe('0');
    expect(pill2.getAttribute('data-dimmed')).toBe('1');
  });

  it('keeps every multi-select pill un-dimmed', async () => {
    const user = userEvent.setup();
    renderOffline(
      buildBlock([
        {
          id: 'q1',
          question: 'Pick any',
          multiSelect: true,
          options: buildOptions(3),
        },
      ]),
    );
    const pill1 = screen.getByRole('checkbox', { name: 'Option 1' });
    await user.click(pill1);
    expect(pill1.getAttribute('data-picked')).toBe('1');
    const pill2 = screen.getByRole('checkbox', { name: 'Option 2' });
    expect(pill2.getAttribute('data-dimmed')).toBe('0');
  });

  it('toggles a multi-select pill off on second click', async () => {
    const user = userEvent.setup();
    renderOffline(
      buildBlock([
        {
          id: 'q1',
          question: 'Pick any',
          multiSelect: true,
          options: buildOptions(3),
        },
      ]),
    );
    const pill1 = screen.getByRole('checkbox', { name: 'Option 1' });
    await user.click(pill1);
    expect(pill1.getAttribute('data-picked')).toBe('1');
    await user.click(pill1);
    expect(pill1.getAttribute('data-picked')).toBe('0');
  });

  it('clears picks when the custom "other" input is opened', async () => {
    const user = userEvent.setup();
    renderOffline(
      buildBlock([
        { id: 'q1', question: 'Pick one', options: buildOptions(3) },
      ]),
    );
    const pill1 = screen.getByRole('radio', { name: 'Option 1' });
    await user.click(pill1);
    expect(pill1.getAttribute('data-picked')).toBe('1');

    await user.click(screen.getByText(/Type your own/));
    expect(pill1.getAttribute('data-picked')).toBe('0');
  });

  it('disables the submit button in offline (audit-log) mode', () => {
    renderOffline(
      buildBlock([
        { id: 'q1', question: 'Pick one', options: buildOptions(2) },
      ]),
    );
    const footer = screen.getByTestId('ask-user-footer');
    expect(footer).not.toBeNull();
    const submit = within(footer).getByRole('button', {
      name: /Send answers/,
    });
    expect(submit).toBeDisabled();
  });
});
