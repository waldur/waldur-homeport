import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
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
    const mockStore = configureStore();

    render(
      <Provider store={mockStore({})}>
        <CodePreview template={template} context={context} />
      </Provider>,
    );

    expect(screen.getByText('ssh test_user@example.com')).toBeInTheDocument();
  });
});
