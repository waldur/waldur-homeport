/* eslint-disable waldur-custom/no-retired-bootstrap-utility -- Old role specifically renders retired Metronic symbol classes for visual parity verification */
/* eslint-disable waldur-custom/require-font-size-scale -- Old role specifically tests proportional font sizes */
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Avatar } from 'waldur-ui';

import { SymbolsGroup } from '@/customer/dashboard/SymbolsGroup';

import { Image } from './Image';

type CaseId =
  | 'size-24-circle'
  | 'size-32-circle'
  | 'size-40-circle'
  | 'size-50-square'
  | 'size-60-circle'
  | 'with-image'
  | 'avatar-group'
  | 'classname-size-9'
  | 'classname-size-50px';

const CASES: CaseId[] = [
  'size-24-circle',
  'size-32-circle',
  'size-40-circle',
  'size-50-square',
  'size-60-circle',
  'with-image',
  'avatar-group',
  'classname-size-9',
  'classname-size-50px',
];

const SAMPLE_IMAGE =
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

const MOCK_USERS = [
  { full_name: 'Alice Cooper', email: 'alice@example.com' },
  { full_name: 'Bob Martin', email: 'bob@example.com' },
  { full_name: 'Charlie Davis', email: 'charlie@example.com' },
  { full_name: 'Diana Prince', email: 'diana@example.com' },
  { full_name: 'Evan Wright', email: 'evan@example.com' },
];

/**
 * Renders old (Bootstrap/Metronic .symbol) and new (Tailwind / waldur-ui) Avatar
 * side by side with data-pair and data-role attributes for automated pixel-diff parity
 * verification.
 */
const Pair = ({ caseId }: { caseId: CaseId }) => {
  return (
    <div className="flex items-center gap-6 bg-white p-4 dark:bg-neutral-950">
      <div
        className="w-[180px] flex items-center justify-center"
        data-pair={caseId}
        data-role="old"
      >
        {caseId === 'size-24-circle' && (
          <div
            className="symbol symbol-24px symbol-circle"
            style={{ fontSize: '12px' }}
          >
            <div className="symbol-label">AC</div>
          </div>
        )}
        {caseId === 'size-32-circle' && (
          <div
            className="symbol symbol-32px symbol-circle"
            style={{ fontSize: '14px' }}
          >
            <div className="symbol-label">BM</div>
          </div>
        )}
        {caseId === 'size-40-circle' && (
          <div
            className="symbol symbol-40px symbol-circle"
            style={{ fontSize: '16px' }}
          >
            <div className="symbol-label">CD</div>
          </div>
        )}
        {caseId === 'size-50-square' && (
          <div className="symbol symbol-50px" style={{ fontSize: '20px' }}>
            <div className="symbol-label">DP</div>
          </div>
        )}
        {caseId === 'size-60-circle' && (
          <div
            className="symbol symbol-60px symbol-circle"
            style={{ fontSize: '24px' }}
          >
            <div className="symbol-label">EW</div>
          </div>
        )}
        {caseId === 'with-image' && (
          <div className="symbol symbol-40px symbol-circle symbol-contain">
            <div
              className="symbol-label"
              style={{ backgroundImage: `url(${SAMPLE_IMAGE})` }}
            />
          </div>
        )}
        {caseId === 'avatar-group' && (
          <div className="symbol-group symbol-hover">
            {MOCK_USERS.slice(0, 3).map((u, i) => (
              <div key={i} className="symbol symbol-35px symbol-circle">
                <div className="symbol-label text-base font-medium bg-tertiary text-quaternary">
                  {u.full_name.charAt(0)}
                </div>
              </div>
            ))}
            <div className="symbol symbol-35px symbol-circle">
              <div className="symbol-label text-lg font-medium bg-tertiary text-quaternary">
                +2
              </div>
            </div>
          </div>
        )}
        {caseId === 'classname-size-9' && (
          <div
            className="symbol symbol-circle"
            style={{ width: '36px', height: '36px', fontSize: '12px' }}
          >
            <div
              className="symbol-label font-semibold"
              style={{
                backgroundColor: 'var(--brand-600, #3699ff)',
                color: '#ffffff',
              }}
            >
              MS
            </div>
          </div>
        )}
        {caseId === 'classname-size-50px' && (
          <div
            className="symbol symbol-50px symbol-circle"
            style={{ fontSize: '18px' }}
          >
            <div
              className="symbol-label font-semibold"
              style={{
                backgroundColor: 'var(--brand-600, #3699ff)',
                color: '#ffffff',
              }}
            >
              VM
            </div>
          </div>
        )}
      </div>

      <div
        className="w-[180px] flex items-center justify-center"
        data-pair={caseId}
        data-role="new"
      >
        {caseId === 'size-24-circle' && (
          <Avatar name="Alice Cooper" size={24} />
        )}
        {caseId === 'size-32-circle' && <Avatar name="Bob Martin" size={32} />}
        {caseId === 'size-40-circle' && (
          <Avatar name="Charlie Davis" size={40} />
        )}
        {caseId === 'size-50-square' && (
          <Avatar name="Diana Prince" size={50} shape="square" />
        )}
        {caseId === 'size-60-circle' && <Avatar name="Evan Wright" size={60} />}
        {caseId === 'with-image' && (
          <Image src={SAMPLE_IMAGE} size={40} circle isContain />
        )}
        {caseId === 'avatar-group' && (
          <SymbolsGroup items={MOCK_USERS} max={3} size={35} />
        )}
        {caseId === 'classname-size-9' && (
          <Avatar className="size-9" initials="MS" tone="brand" />
        )}
        {caseId === 'classname-size-50px' && (
          <Avatar className="size-[50px]" initials="VM" tone="brand" />
        )}
      </div>
    </div>
  );
};

const meta: Meta = {
  title: 'Migration/Avatar Parity',
  parameters: {
    docs: {
      description: {
        component:
          'Old (Bootstrap/Metronic .symbol) and new (Tailwind / waldur-ui Avatar) side by side, tagged data-pair/data-role for automated visual and dimension parity verification.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

const LEGACY_SYMBOL_CSS = `
  [data-role="old"] .symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    flex-shrink: 0;
    border-radius: 6px;
  }
  [data-role="old"] .symbol.symbol-circle {
    border-radius: 50%;
  }
  [data-role="old"] .symbol-24px { width: 24px; height: 24px; }
  [data-role="old"] .symbol-32px { width: 32px; height: 32px; }
  [data-role="old"] .symbol-35px { width: 35px; height: 35px; }
  [data-role="old"] .symbol-40px { width: 40px; height: 40px; }
  [data-role="old"] .symbol-50px { width: 50px; height: 50px; }
  [data-role="old"] .symbol-60px { width: 60px; height: 60px; }
  [data-role="old"] .symbol-label {
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
    line-height: 1;
    color: var(--text-quaternary);
    background-color: var(--bg-tertiary);
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
  }
  [data-role="old"] .symbol-contain .symbol-label {
    background-size: contain;
  }
  [data-role="old"] .symbol-group {
    display: flex;
    align-items: center;
  }
  [data-role="old"] .symbol-group > * + * {
    margin-left: -12px;
  }
  [data-role="old"] .symbol-group .symbol {
    border: 2px solid var(--bg-primary);
  }
`;

export const Default: Story = {
  render: () => (
    <div className="flex flex-col gap-4 bg-white p-6 dark:bg-neutral-950">
      <style>{LEGACY_SYMBOL_CSS}</style>
      <div className="flex gap-6 font-semibold text-xs text-secondary px-4">
        <span className="w-[180px] text-center">Legacy Metronic (.symbol)</span>
        <span className="w-[180px] text-center">New Tailwind / Avatar</span>
      </div>
      {CASES.map((caseId) => (
        <Pair key={caseId} caseId={caseId} />
      ))}
    </div>
  ),
};
