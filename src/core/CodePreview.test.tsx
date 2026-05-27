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
});
