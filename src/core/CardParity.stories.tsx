import type { Meta, StoryObj } from '@storybook/react-vite';
import { Card as CardBs } from 'react-bootstrap';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from 'waldur-ui';

type CaseId = 'basic' | 'with-footer' | 'body-only' | 'bordered';
const CASES: CaseId[] = ['basic', 'with-footer', 'body-only', 'bordered'];

/**
 * Renders old (React-Bootstrap) Card and new (waldur-ui) Card side by side
 * with data-pair and data-role attributes for automated pixel-diff parity
 * verification.
 */
const Pair = ({ caseId }: { caseId: CaseId }) => {
  const isBordered = caseId === 'bordered';
  const hasFooter = caseId === 'with-footer';
  const hasHeader = caseId !== 'body-only';

  return (
    <div className="flex items-start gap-4 bg-white p-4 dark:bg-neutral-950">
      <div className="w-[360px]" data-pair={caseId} data-role="old">
        <CardBs className={isBordered ? 'card-bordered' : undefined}>
          {hasHeader && (
            <CardBs.Header>
              <CardBs.Title>Card title</CardBs.Title>
            </CardBs.Header>
          )}
          <CardBs.Body>
            <p className="m-0 text-sm">
              Standard card content demonstrating padding and layout parity.
            </p>
          </CardBs.Body>
          {hasFooter && (
            <CardBs.Footer>
              <span className="text-xs text-quaternary">Card footer note</span>
            </CardBs.Footer>
          )}
        </CardBs>
      </div>
      <div className="w-[360px]" data-pair={caseId} data-role="new">
        <Card
          className={isBordered ? 'shadow-none border-secondary' : undefined}
        >
          {hasHeader && (
            <CardHeader>
              <CardTitle>Card title</CardTitle>
            </CardHeader>
          )}
          <CardContent>
            <p className="m-0 text-sm">
              Standard card content demonstrating padding and layout parity.
            </p>
          </CardContent>
          {hasFooter && (
            <CardFooter>
              <span className="text-xs text-quinary">Card footer note</span>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Migration/Card Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Bootstrap/Metronic) Card and the new (waldur-ui) Card side by side, tagged data-pair/data-role for automated visual and dimension parity testing. Compares header min-height, horizontal/vertical padding, and border radius across basic, with-footer, body-only, and bordered configurations.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-white p-6 dark:bg-neutral-950">
      {CASES.map((caseId) => (
        <Pair key={caseId} caseId={caseId} />
      ))}
    </div>
  ),
};
