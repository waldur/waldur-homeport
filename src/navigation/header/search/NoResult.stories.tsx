import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card } from 'react-bootstrap';

import { NoResult } from './NoResult';

const meta: Meta<typeof NoResult> = {
  title: 'Components/NoResult',
  component: NoResult,
  decorators: [
    (Story) => (
      <div className="p-5 bg-primary" style={{ minWidth: 600 }}>
        <Card className="card-bordered">
          <Card.Body>
            <Story />
          </Card.Body>
        </Card>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof NoResult>;

export const Default: Story = {
  args: {
    title: 'No usage yet',
    message:
      'Usage is recorded once the resource has been created. Come back after provisioning finishes.',
    noAction: true,
  },
};
