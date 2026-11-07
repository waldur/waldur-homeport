import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CodeLine } from './CodeLine';

describe('CodeLine', () => {
  it('shows only the line by default', () => {
    render(<CodeLine>ls -la</CodeLine>);

    expect(screen.getByText('ls -la')).toBeInTheDocument();
    expect(screen.queryByText('$')).not.toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('adds a prompt, a line number and a copy button on request', () => {
    render(
      <CodeLine prompt lineNumber={3} copyable>
        ls -la
      </CodeLine>,
    );

    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('3.')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Copy to clipboard' }),
    ).toBeInTheDocument();
  });
});
