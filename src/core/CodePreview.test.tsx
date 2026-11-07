import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { CodePreview } from './CodePreview';

describe('CodePreview', () => {
  it('renders formatted template with context', () => {
    const template = 'Hello, {name}!';
    const context = { name: 'World' };

    render(<CodePreview template={template} context={context} />);

    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
  });

  it('preserve underscore inside code block', () => {
    const template = '```\nssh test_user@example.com\n```';
    const context = {};

    render(<CodePreview template={template} context={context} />);

    expect(screen.getByText('ssh test_user@example.com')).toBeInTheDocument();
  });

  it('keeps every word of a single-line code block', () => {
    // A one-line fence has no language tag (CommonMark ends the info string
    // at the line break), so `ssh` is the command, not a language.
    const template = 'Connect with ```ssh ubuntu@{ip}``` and log in.';

    render(<CodePreview template={template} context={{ ip: '192.0.2.10' }} />);

    expect(screen.getByText('ssh ubuntu@192.0.2.10')).toBeInTheDocument();
  });

  it('renders a single-word single-line code block', () => {
    render(<CodePreview template="Run ```htop```." context={{}} />);

    expect(screen.getByText('htop')).toBeInTheDocument();
  });

  it("leaves out a fence's trailing newline, which a pasted command would run", () => {
    render(<CodePreview template={'```\nls -la\n```'} context={{}} />);

    // The default matcher trims whitespace; compare the raw text instead.
    expect(
      screen.getByText('ls -la', { normalizer: (text) => text }),
    ).toBeInTheDocument();
  });

  it('styles inline code through rich-text, leaving the $-prompt block alone', () => {
    render(
      <CodePreview
        template={'Mounted at `/store`.\n\n```\nls /store\n```'}
        context={{}}
      />,
    );

    // .rich-text gives inline code the shared look (src/tailwind.css)...
    expect(
      screen.getByText('/store', { selector: '.rich-text code' }),
    ).toBeInTheDocument();
    // ...and the prompt block is CodeBlock's: its <pre> has a class, so the
    // rich-text panel rule (`.rich-text pre:not([class])`) leaves it alone.
    expect(
      screen.getByText('ls /store', { selector: '.rich-text pre[class] span' }),
    ).toBeInTheDocument();
  });

  it('renders nothing without throwing when template is undefined', () => {
    const context = { name: 'World' };

    expect(() =>
      render(<CodePreview template={undefined} context={context} />),
    ).not.toThrow();
  });
});
