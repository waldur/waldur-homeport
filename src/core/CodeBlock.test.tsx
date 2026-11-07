import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { CodeBlock } from './CodeBlock';

describe('CodeBlock', () => {
  it('puts a prompt before each command', () => {
    render(
      <CodeBlock prompt>
        {'sudo apt-get update\nsudo apt-get install -y waldur-agent'}
      </CodeBlock>,
    );

    expect(screen.getAllByText('$')).toHaveLength(2);
    expect(screen.getByText('sudo apt-get update')).toBeInTheDocument();
  });

  it('leaves the prompt off lines that continue a command', () => {
    render(
      <CodeBlock prompt>
        {
          'ssh -i ~/.ssh/id_ed25519 \\\n    -o StrictHostKeyChecking=accept-new \\\n    ubuntu@192.0.2.10\nuptime'
        }
      </CodeBlock>,
    );

    // The ssh command and uptime: two commands over four lines.
    expect(screen.getAllByText('$')).toHaveLength(2);
  });

  it('hides the prompts from assistive technology', () => {
    render(<CodeBlock prompt>ls -la</CodeBlock>);

    expect(screen.getByText('$')).toHaveAttribute('aria-hidden', 'true');
  });

  it('copies the commands as written, continuations included', async () => {
    const user = userEvent.setup();
    const text = 'ssh \\\n  ubuntu@192.0.2.10';
    render(
      <CodeBlock prompt copyable>
        {text}
      </CodeBlock>,
    );

    await user.click(screen.getByRole('button', { name: 'Copy to clipboard' }));

    expect(await navigator.clipboard.readText()).toBe(text);
  });
});
