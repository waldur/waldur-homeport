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
    // ...and the prompt block keeps .code-block's own <pre>, which the
    // rich-text panel rule skips by selector, not by a class on the <pre>.
    expect(
      screen.getByText('ls /store', {
        selector: '.code-block pre:not([class]) > .code-block-content',
      }),
    ).toBeInTheDocument();
  });

  it('renders nothing without throwing when template is undefined', () => {
    const context = { name: 'World' };

    expect(() =>
      render(<CodePreview template={undefined} context={context} />),
    ).not.toThrow();
  });
});
