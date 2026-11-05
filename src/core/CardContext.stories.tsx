import type { Meta, StoryObj } from '@storybook/react-vite';
import { ReactNode } from 'react';
import { expect } from 'storybook/test';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from 'waldur-ui';

/**
 * Card's variants and HomePort's context rules reach Card's parts through
 * the `--card-*` hooks (waldur-design-tokens card.css, src/styles/legacy).
 * The play function checks the computed styles they produce, so a renamed
 * hook, a dropped `@property` (which would let a hook leak into a nested
 * card) or a changed selector fails the Storybook tests.
 */

const Body = () => <p className="m-0">Body</p>;

const ExpandedRow = ({ children }: { children: ReactNode }) => (
  // eslint-disable-next-line waldur-custom/no-hand-rolled-table -- the expanded-row markup the context rules key on, not a data table
  <table className="table table-expandable">
    <tbody>
      <tr className="expanded">
        <td>Row</td>
      </tr>
      <tr>
        <td>{children}</td>
      </tr>
    </tbody>
  </table>
);

const Cases = () => (
  <div className="flex w-[480px] flex-col gap-3 p-5">
    <Card data-testid="plain">
      <CardHeader>
        <CardTitle>Plain</CardTitle>
      </CardHeader>
      <CardContent data-testid="plain-body">
        <Body />
      </CardContent>
    </Card>

    <Card variant="table" data-testid="table">
      <CardHeader data-testid="table-header">
        <CardToolbar data-testid="table-toolbar">
          <CardTitle as="div" data-testid="table-title">
            Table
          </CardTitle>
        </CardToolbar>
      </CardHeader>
      <CardContent data-testid="table-body">
        <ExpandedRow>
          <Card bordered variant="solid">
            <CardHeader data-testid="nested-solid-header">Solid</CardHeader>
            <CardContent data-testid="nested-solid-body">
              <Body />
            </CardContent>
          </Card>
        </ExpandedRow>
      </CardContent>
    </Card>

    <div role="tabpanel">
      <Card variant="table">
        <CardContent data-testid="tabpanel-table-body">
          <Body />
        </CardContent>
      </Card>
    </div>

    <Card variant="table">
      <CardHeader className="min-h-auto" data-testid="override-header">
        Tabs
      </CardHeader>
    </Card>

    <Card size="sm">
      <CardHeader data-testid="sm-header">
        <CardTitle as="h6">Compact</CardTitle>
      </CardHeader>
    </Card>

    <Card variant="widget">
      <CardContent data-testid="widget-body">
        <Body />
      </CardContent>
    </Card>
  </div>
);

const meta: Meta = {
  title: 'Data Display/Card/Context',
  parameters: {
    docs: {
      description: {
        component:
          'Card in the contexts HomePort restyles it in: a table card, a solid card in its expanded row, a table card in a tab panel, a caller override, and the sm and widget variants. The play function checks the computed styles.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => <Cases />,
  play: async ({ canvasElement }) => {
    const style = (id: string) =>
      getComputedStyle(
        canvasElement.querySelector(`[data-testid="${id}"]`) as Element,
      );
    const plainBody = style('plain-body');

    // Table card: a 77px header, toolbar and title margins, no body top
    // padding, no border unless bordered.
    await expect(style('table-header').minHeight).toBe('77px');
    await expect(style('table-title').marginTop).toBe('0px');
    await expect(style('table-body').paddingTop).toBe('0px');
    await expect(style('table').borderTopWidth).toBe('0px');
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
    await expect(parseFloat(style('table-toolbar').marginTop)).toBeCloseTo(
      0.71 * rem,
      1,
    );

    // A solid card in the table's expanded row: its own 48px strip, not the
    // table's 77px header, and a body that keeps its top padding (the
    // table body's hook must not reach it).
    await expect(style('nested-solid-header').minHeight).toBe('48px');
    await expect(style('nested-solid-header').marginLeft).toBe('0px');
    await expect(style('nested-solid-body').paddingTop).toBe(
      plainBody.paddingTop,
    );

    // In a tab panel the table body keeps its top padding.
    await expect(style('tabpanel-table-body').paddingTop).toBe(
      plainBody.paddingTop,
    );

    // A utility the caller passes still wins over a context rule.
    await expect(style('override-header').minHeight).not.toBe('77px');

    await expect(style('sm-header').minHeight).toBe('36px');
    await expect(style('widget-body').paddingTop).toBe('20px');
    await expect(style('widget-body').paddingLeft).toBe('20px');
  },
};
