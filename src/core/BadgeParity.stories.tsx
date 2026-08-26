import type { Meta, StoryObj } from '@storybook/react-vite';

import { Badge as BadgeTw } from 'waldur-ui';

import { Badge } from './Badge';

/**
 * Old (Bootstrap) Badge and the new (Tailwind) Badge side by side, tagged
 * data-pair/data-role, for e2e-visual/badge-parity.spec.ts to
 * screenshot-diff. Modeled on BaseButtonParity.stories.tsx — both
 * components forward arbitrary props to their own root element (BsBadge's
 * ...rest, the new Badge's ...props on <span>), so data-pair/data-role can
 * go directly on each Badge instance, same as BaseButton.
 *
 * Scoped to the 8 colors that account for 267 of 429 real call sites (see
 * the Badge migration audit) — warning/success/danger/secondary/primary/
 * info/purple by literal count, plus "default" (57 uses, the single most
 * common literal variant, always combined with outline in every real
 * caller — see Badge.tsx's own comment on why it maps to variant="neutral"
 * tone="outline", not a separate variant). "default" only gets an outline
 * case below (no solid/light case exists in real Metronic CSS to compare
 * against — bg-default/badge-light-default aren't real classes).
 *
 * blue/indigo/moss/pink added despite near-zero real usage specifically to
 * cover dark theme: purple slipped through the original 7-color pass at
 * 88/88 "passing" because its dark-solid/light-text color was wrong (used
 * the light-theme hex instead of Metronic's genuinely distinct dark-mode
 * shade — see badgeColors.css) and the harness's pixelmatch/chromaticity
 * checks don't reliably catch "right hue, wrong lightness" errors between
 * two similar purples. blue/indigo/moss/pink share purple's exact
 * structural bug pattern in src/metronic/sass/_colors.scss, so they're
 * included here as real regression coverage, not just for completeness.
 *
 * size/leftIcon/rightIcon/onlyIcon/hasBullet/tooltip are excluded from
 * this pass — near-zero or lower-priority real usage per the audit, and
 * the new Badge doesn't implement them yet (deliberately, see Badge.tsx).
 */

const COLORS = [
  'warning',
  'success',
  'danger',
  'secondary',
  'primary',
  'info',
  'purple',
  'blue',
  'indigo',
  'moss',
  'pink',
] as const;
const TONES = ['solid', 'light', 'outline'] as const;

const Pair = ({
  oldVariant,
  newVariant,
  tone,
  pill,
}: {
  oldVariant: string;
  newVariant: string;
  tone: (typeof TONES)[number];
  pill: boolean;
}) => {
  const pairId = `${newVariant}-${tone}${pill ? '-pill' : ''}`;
  return (
    <div className="flex items-center gap-3 bg-white p-2 dark:bg-neutral-950">
      <Badge
        variant={oldVariant}
        pill={pill}
        outline={tone === 'outline'}
        light={tone === 'light'}
        data-pair={pairId}
        data-role="old"
      >
        Label
      </Badge>
      <BadgeTw
        variant={newVariant as never}
        tone={tone}
        pill={pill}
        data-pair={pairId}
        data-role="new"
      >
        Label
      </BadgeTw>
    </div>
  );
};

const meta: Meta = {
  title: 'Migration/Badge Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Bootstrap) Badge and the new Badge side by side, tagged data-pair/data-role, for e2e-visual/badge-parity.spec.ts to screenshot-diff. Not a usage example — a migration verification fixture.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-2 bg-white p-10 dark:bg-neutral-950">
      {COLORS.map((color) =>
        TONES.map((tone) => (
          <div key={`${color}-${tone}`} className="flex flex-col gap-2">
            <Pair
              oldVariant={color}
              newVariant={color}
              tone={tone}
              pill={false}
            />
            <Pair
              oldVariant={color}
              newVariant={color}
              tone={tone}
              pill={true}
            />
          </div>
        )),
      )}
      <div className="flex flex-col gap-2">
        <Pair
          oldVariant="default"
          newVariant="neutral"
          tone="outline"
          pill={false}
        />
        <Pair
          oldVariant="default"
          newVariant="neutral"
          tone="outline"
          pill={true}
        />
      </div>
    </div>
  ),
};
