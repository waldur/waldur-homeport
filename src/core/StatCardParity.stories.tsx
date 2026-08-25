import type { Meta, StoryObj } from '@storybook/react-vite';

import { StatCard as StatCardTw } from 'waldur-ui';

import { StatsCard } from './StatsCard';

type CaseId = 'basic' | 'with-hint';
const CASES: CaseId[] = ['basic', 'with-hint'];

/**
 * Neither component forwards arbitrary props to its root element (unlike
 * BaseButton, which spreads ...rest onto the <button> — see
 * BaseButtonParity.stories.tsx), so data-pair/data-role live on a wrapping
 * div instead, and e2e-visual/stat-card-parity.spec.ts screenshots that
 * wrapper. Both wrappers get an identical fixed width: StatsCard/StatCard
 * are both plain block-level elements that size to whatever container real
 * usage gives them (a Bootstrap/CSS-grid column), so there's no "natural"
 * width to compare — fixing it lets the diff surface real HEIGHT bugs (e.g.
 * the CardHeader-zero-bottom-padding bug this component already had once)
 * instead of being swamped by an arbitrary, meaningless width delta.
 */
const Pair = ({ caseId }: { caseId: CaseId }) => (
  <div className="flex items-start gap-3 bg-white p-2 dark:bg-neutral-950">
    <div className="w-[240px]" data-pair={caseId} data-role="old">
      <StatsCard
        label="Active resources"
        value="128"
        footer={
          caseId === 'with-hint' ? (
            <span className="text-muted">vs last month</span>
          ) : undefined
        }
      />
    </div>
    <div className="w-[240px]" data-pair={caseId} data-role="new">
      <StatCardTw
        label="Active resources"
        value="128"
        hint={caseId === 'with-hint' ? 'vs last month' : undefined}
      />
    </div>
  </div>
);

const meta: Meta = {
  title: 'Migration/StatCard Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Bootstrap) StatsCard and the new (Tailwind) StatCard side by side, tagged data-pair/data-role, for e2e-visual/stat-card-parity.spec.ts to screenshot-diff. Not a usage example — a migration verification fixture. Only "basic" (label+value) and "with-hint" (label+value+plain-text caption) are covered: StatsCard\'s `icon` prop has no equivalent on the new StatCard yet (a real gap, not a rendering difference to diff), and the new StatCard\'s `trend` renders waldur-ui\'s own Badge, which packages/ui/src/Badge.tsx documents as NOT a port of src/core/Badge.tsx — diffing that would fail on Badge\'s own not-yet-done migration, not on StatCard.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2 bg-white p-10 dark:bg-neutral-950">
      {CASES.map((caseId) => (
        <Pair key={caseId} caseId={caseId} />
      ))}
    </div>
  ),
};
