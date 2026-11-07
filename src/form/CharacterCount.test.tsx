import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Form } from 'react-final-form';
import { describe, expect, it } from 'vitest';

import { CharacterCount } from './CharacterCount';
import { BaseStringField } from './StringField';
import { BaseTextField } from './TextField';

import { StringGroup, TextGroup } from '.';

const renderTextarea = (value: string, maxLength = 1000) =>
  render(
    <BaseTextField
      aria-label="Summary"
      value={value}
      onChange={() => undefined}
      maxLength={maxLength}
      showCharacterCount
    />,
  );

const counter = (index = 0) => screen.getAllByTestId('character-count')[index];

describe('character count', () => {
  it('shows the limit while the field is empty', () => {
    renderTextarea('');
    expect(
      screen.getByRole('textbox', { name: 'Summary' }),
    ).toHaveAccessibleDescription('0 of 1000 characters used');
    expect(counter()).toHaveTextContent('0 / 1000');
    expect(counter()).toHaveAttribute('data-state', 'normal');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('counts a partly filled field without emphasis', () => {
    renderTextarea('a'.repeat(123));
    expect(counter()).toHaveTextContent('123 / 1000');
    expect(counter()).not.toHaveClass('text-warning');
    expect(counter()).not.toHaveClass('text-danger');
    expect(screen.getByRole('status')).toBeEmptyDOMElement();
  });

  it('emphasises the counter from 90% of the limit', () => {
    renderTextarea('a'.repeat(900));
    expect(counter()).toHaveTextContent('900 / 1000');
    expect(counter()).toHaveAttribute('data-state', 'near');
    expect(counter()).toHaveClass('text-warning');
    expect(screen.getByRole('status')).toHaveTextContent(
      '100 characters remaining',
    );
  });

  it('marks the limit once it is reached', () => {
    renderTextarea('a'.repeat(1000));
    expect(counter()).toHaveTextContent('1000 / 1000');
    expect(counter()).toHaveAttribute('data-state', 'limit');
    expect(counter()).toHaveClass('text-danger');
    expect(screen.getByRole('status')).toHaveTextContent(
      'Character limit reached',
    );
  });

  it('describes the control with the count for assistive technology', () => {
    renderTextarea('a'.repeat(42));
    expect(
      screen.getByRole('textbox', { name: 'Summary' }),
    ).toHaveAccessibleDescription('42 of 1000 characters used');
    expect(screen.getByRole('status')).toHaveAttribute('aria-live', 'polite');
  });

  it('keeps the ids the caller already described the control with', () => {
    render(
      <>
        <span id="hint">Plain text only</span>
        <BaseStringField
          aria-label="Name"
          aria-describedby="hint"
          value="abc"
          onChange={() => undefined}
          maxLength={150}
          showCharacterCount
        />
      </>,
    );
    expect(
      screen.getByRole('textbox', { name: 'Name' }),
    ).toHaveAccessibleDescription('Plain text only 3 of 150 characters used');
  });

  it('renders nothing extra unless the field opts in', () => {
    render(
      <BaseTextField
        aria-label="Notes"
        value="abc"
        onChange={() => undefined}
        maxLength={1000}
      />,
    );
    expect(screen.queryByText(/\/ 1000/)).not.toBeInTheDocument();
    expect(screen.getByRole('textbox')).not.toHaveAttribute('aria-describedby');
  });

  it('shows only the length, with no live region, without a limit', () => {
    render(
      <BaseStringField
        aria-label="Name"
        value="abc"
        onChange={() => undefined}
        showCharacterCount
      />,
    );
    expect(counter()).toHaveTextContent('3 characters');
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('shows a limit that does not cut the text and flags an edit over it', async () => {
    const user = userEvent.setup();
    render(
      <Form
        onSubmit={() => undefined}
        initialValues={{ summary: 'a'.repeat(12) }}
      >
        {() => <TextGroup name="summary" label="Summary" maxCharacters={10} />}
      </Form>,
    );
    const summary = screen.getByRole('textbox', { name: 'Summary' });
    expect(summary).not.toHaveAttribute('maxlength');
    // Stored over the limit before it existed: shown, but not as an error.
    expect(counter()).toHaveTextContent('12 / 10');
    expect(counter()).not.toHaveAttribute('data-state', 'over');
    await user.type(summary, 'b');
    expect(summary).toHaveValue('a'.repeat(12) + 'b');
    expect(counter()).toHaveTextContent('13 / 10');
    expect(counter()).toHaveAttribute('data-state', 'over');
  });

  it('follows typing in a form group', async () => {
    const user = userEvent.setup();
    render(
      <Form onSubmit={() => undefined}>
        {() => (
          <>
            <StringGroup
              name="name"
              label="Name"
              maxLength={10}
              showCharacterCount
            />
            <TextGroup
              name="summary"
              label="Summary"
              maxLength={20}
              showCharacterCount
            />
          </>
        )}
      </Form>,
    );
    const name = screen.getByRole('textbox', { name: 'Name' });
    expect(counter(0)).toHaveTextContent('0 / 10');
    await user.type(name, 'abcdefghijkl');
    // The browser stops input at maxLength.
    expect(name).toHaveValue('abcdefghij');
    expect(counter(0)).toHaveTextContent('10 / 10');
    expect(counter(0)).toHaveAttribute('data-state', 'limit');

    const summary = screen.getByRole('textbox', { name: 'Summary' });
    await user.type(summary, 'hello');
    expect(counter(1)).toHaveTextContent('5 / 20');
  });
});

describe('CharacterCount', () => {
  it('shows the count against the limit while under it', () => {
    render(<CharacterCount value="abc" max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('3 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('is still within the limit exactly at it', () => {
    render(<CharacterCount value={'a'.repeat(10)} max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('10 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('marks the count as over the limit', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('11 / 10');
    expect(count).toHaveAttribute('data-state', 'over');
  });

  it('does not flag an overrun the value arrived with', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} pristine />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('11 / 10');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('flags the overrun once the value is edited', () => {
    render(<CharacterCount value={'a'.repeat(11)} max={10} pristine={false} />);
    expect(screen.getByTestId('character-count')).toHaveAttribute(
      'data-state',
      'over',
    );
  });

  it('shows only the count without a limit', () => {
    render(<CharacterCount value="hello" />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('5 characters');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('counts code points as the backend does, not UTF-16 units', () => {
    render(<CharacterCount value={'ab' + '\u{1F600}'} max={3} />);
    const count = screen.getByTestId('character-count');
    expect(count).toHaveTextContent('3 / 3');
    expect(count).not.toHaveAttribute('data-state', 'over');
  });

  it('counts an empty value as zero', () => {
    render(<CharacterCount value={undefined} max={10} />);
    expect(screen.getByTestId('character-count')).toHaveTextContent('0 / 10');
  });
});
