import type { Meta, StoryObj } from '@storybook/react-vite';

const meta: Meta = {
  title: 'Foundations/Elevation',
  parameters: {
    docs: {
      description: {
        component:
          'Shadow tokens and border radius definitions used to establish visual hierarchy, floating elevation layers, and container shapes.',
      },
    },
  },
};
export default meta;

type Story = StoryObj;

export const ShadowsAndRadius: Story = {
  render: () => (
    <div className="p-6 bg-[var(--surface-page-bg)] space-y-10 max-w-4xl">
      <div>
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] mb-4">
          Elevation & Shadows
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex flex-col items-center justify-center p-6 rounded-md bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] shadow-[var(--card-shadow)] h-32 text-center">
            <span className="text-sm font-medium text-[var(--surface-text-primary)]">
              Card Shadow
            </span>
            <span className="font-mono text-xs text-[var(--surface-text-muted)] mt-1">
              --card-shadow
            </span>
            <span className="text-[11px] text-[var(--surface-text-secondary)] mt-2">
              Default surface container
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-md bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] shadow-[var(--dropdown-shadow)] h-32 text-center">
            <span className="text-sm font-medium text-[var(--surface-text-primary)]">
              Dropdown Shadow
            </span>
            <span className="font-mono text-xs text-[var(--surface-text-muted)] mt-1">
              --dropdown-shadow
            </span>
            <span className="text-[11px] text-[var(--surface-text-secondary)] mt-2">
              Floating popovers & menus
            </span>
          </div>

          <div className="flex flex-col items-center justify-center p-6 rounded-md bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] shadow-[var(--drawer-shadow)] h-32 text-center">
            <span className="text-sm font-medium text-[var(--surface-text-primary)]">
              Drawer Shadow
            </span>
            <span className="font-mono text-xs text-[var(--surface-text-muted)] mt-1">
              --drawer-shadow
            </span>
            <span className="text-[11px] text-[var(--surface-text-secondary)] mt-2">
              Mobile sheet & drawers
            </span>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-base font-semibold text-[var(--surface-text-primary)] mb-4">
          Border Radius Scale
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-xs text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              xs (4px)
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Buttons sm
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-sm text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              sm (6px)
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Cards, Popovers
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-md text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              md (8px)
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Badges, Rows
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-lg text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              lg (12px)
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Modals
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-xl text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              xl (16px)
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Dialogs
            </span>
          </div>

          <div className="flex flex-col items-center p-3 bg-[var(--surface-card-bg)] border border-[var(--surface-card-border)] rounded-full text-center">
            <span className="text-xs font-semibold text-[var(--surface-text-primary)]">
              full
            </span>
            <span className="text-[10px] text-[var(--surface-text-muted)]">
              Pills, Avatars
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
};
