import type { Meta, StoryObj } from '@storybook/react-vite';

import { CodeLine } from './CodeLine';
import { CodePreview } from './CodePreview';

/**
 * Code on a tinted strip. A fenced block in a "Getting started" template
 * (`CodePreview`) is a `CodeBlock`: a `$` per command and none on a line
 * that continues one after a `\`, and a long line wraps under a ↳ instead of
 * scrolling. An order's numbered output (`CodeLine variant="dense"`) and a
 * single copyable value (`CodeLine variant="inline"`) are one line each.
 */
const meta: Meta = {
  title: 'Data Display/Code blocks',
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};
export default meta;

type Story = StoryObj;

const LONG_COMMAND =
  'ssh -i ~/.ssh/id_ed25519 -o StrictHostKeyChecking=accept-new -L 8888:localhost:8888 ubuntu@vm-0042.cloud.example.org';

export const Template: Story = {
  render: () => (
    <CodePreview
      template={
        'Connect to the instance:\n\n```\nssh ubuntu@{ip}\n```\n\nOr forward a port:\n\n```\n' +
        LONG_COMMAND +
        '\n```\n\nOr install the agent:\n\n```\nsudo apt-get update\nsudo apt-get install -y waldur-agent\nsudo systemctl enable --now waldur-agent\n```\n\nA long command, broken at its options:\n\n```\nssh -i ~/.ssh/id_ed25519 \\\n    -o StrictHostKeyChecking=accept-new \\\n    -L 8080:localhost:8080 \\\n    ubuntu@{ip}\nuptime\n```'
      }
      context={{ ip: '192.0.2.10' }}
    />
  ),
};

export const NumberedOutput: Story = {
  render: () => (
    <>
      {['apt-get update', 'apt-get install -y nginx', LONG_COMMAND].map(
        (line, index) => (
          <CodeLine key={line} variant="dense" lineNumber={index + 1} prompt>
            {line}
          </CodeLine>
        ),
      )}
    </>
  ),
};

export const CopyableValue: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <CodeLine variant="inline" copyable>
        192.0.2.10
      </CodeLine>
      <CodeLine variant="inline" copyable>
        {LONG_COMMAND}
      </CodeLine>
    </div>
  ),
};
