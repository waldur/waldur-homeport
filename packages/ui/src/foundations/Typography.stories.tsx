import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Foundations/Typography',
  parameters: {
    docs: {
      description: {
        component:
          'Standard typographic scale, weights, and text elements used across Waldur. Font sizes and line-heights are anchored to Inter with monospace code support.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const TypeScale: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] space-y-8 max-w-4xl">
      <div className="space-y-6">
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] border-b border-[var(--surface-card-border)] pb-2">
          Headings
        </h3>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            Display (3xl)
          </span>
          <h1 className="m-0 text-3xl font-bold text-[var(--surface-text-primary)] flex-1">
            Cloud Resource Management
          </h1>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            30px / 1.875rem
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            H1 (2xl)
          </span>
          <h1 className="m-0 text-2xl font-bold text-[var(--surface-text-primary)] flex-1">
            Projects and Allocations
          </h1>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            24px / 1.5rem
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            H2 (xl)
          </span>
          <h2 className="m-0 text-xl font-semibold text-[var(--surface-text-primary)] flex-1">
            Virtual Machines Overview
          </h2>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            20px / 1.25rem
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            H3 (lg)
          </span>
          <h3 className="m-0 text-lg font-semibold text-[var(--surface-text-primary)] flex-1">
            Resource Details & Quotas
          </h3>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            18px / 1.125rem
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            H4 (base)
          </span>
          <h4 className="m-0 text-base font-semibold text-[var(--surface-text-primary)] flex-1">
            Network Configuration
          </h4>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            16px / 1rem
          </span>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] border-b border-[var(--surface-card-border)] pb-2">
          Body Text & Monospace
        </h3>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            Body Base
          </span>
          <p className="m-0 text-base text-[var(--surface-text-primary)] flex-1">
            Standard paragraph text used for primary documentation,
            descriptions, and content copy.
          </p>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            16px / Regular
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            Body Small
          </span>
          <p className="m-0 text-sm text-[var(--surface-text-secondary)] flex-1">
            Secondary text size used in table cells, card body text, sidebar
            links, and form descriptions.
          </p>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            14px / Regular
          </span>
        </div>

        <div className="flex items-baseline justify-between border-b border-[var(--surface-card-border)] pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            Caption (xs)
          </span>
          <p className="m-0 text-xs text-[var(--surface-text-muted)] flex-1">
            Fine print, badge text, helper hints, timestamp indicators, and
            table headers.
          </p>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            12px / Medium
          </span>
        </div>

        <div className="flex items-baseline justify-between pb-3">
          <span className="font-mono text-xs text-[var(--surface-text-muted)] w-24">
            Monospace
          </span>
          <code className="font-mono text-xs bg-[var(--surface-hover-bg)] px-2 py-1 rounded text-[var(--surface-text-primary)] flex-1 max-w-fit">
            ssh -i ~/.ssh/id_rsa user@192.168.1.100
          </code>
          <span className="font-mono text-xs text-[var(--surface-text-muted)]">
            Code / Mono
          </span>
        </div>
      </div>
    </div>
  ),
};
