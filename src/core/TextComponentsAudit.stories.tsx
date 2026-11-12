import { FileIcon, TrashIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { memoryLocationPlugin, UIRouter, UIRouterReact } from '@uirouter/react';
import { ReactNode, useMemo, useState } from 'react';

import { LinkButton } from 'waldur-ui';

import { CaretUpDownButtons } from './CaretUpDownButtons';
import { CopyToClipboardButton } from './CopyToClipboardButton';
import { Link } from './Link';
import { TruncatedDescription } from './TruncatedDescription';

const StoryRouter = ({ children }: { children: ReactNode }) => {
  const router = useMemo(() => {
    const instance = new UIRouterReact();
    instance.plugin(memoryLocationPlugin);
    instance.stateRegistry.register({ name: 'home', url: '/' });
    instance.stateRegistry.register({
      name: 'profile.details',
      url: '/profile',
    });
    instance.urlService.rules.initial({ state: 'home' });
    return instance;
  }, []);
  return <UIRouter router={router}>{children}</UIRouter>;
};

/**
 * Visual verification story for retired text-anchor, text-btn, and text-link patterns.
 * This mounts all migrated component patterns side-by-side to visually inspect
 * colors, alignments, hover states, font inheritance, and focus rings.
 */
const meta: Meta = {
  title: 'Audit/TextComponentsAudit',
  parameters: {
    layout: 'padded',
  },
  decorators: [
    (Story) => (
      <StoryRouter>
        <Story />
      </StoryRouter>
    ),
  ],
};
export default meta;

type Story = StoryObj;

export const AllMigratedCases: Story = {
  render: function VisualAudit() {
    const [secretVisible, setSecretVisible] = useState(false);

    return (
      <div className="flex flex-col gap-8 max-w-2xl p-6 bg-[var(--page-bg)] border border-secondary rounded-xl text-sm">
        {/* Section 1: LinkButton Variants & Prose */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary border-b border-secondary pb-2">
            1. LinkButton (replaces .text-anchor & .text-link on buttons)
          </h3>
          <div className="flex flex-wrap gap-4 items-center">
            <LinkButton variant="brand">Brand action</LinkButton>
            <LinkButton variant="brand" disabled>
              Brand (disabled)
            </LinkButton>
            <LinkButton variant="danger">Danger action</LinkButton>
            <LinkButton variant="danger" disabled>
              Danger (disabled)
            </LinkButton>
            <LinkButton variant="subtle">Subtle action</LinkButton>
            <LinkButton variant="subtle" disabled>
              Subtle (disabled)
            </LinkButton>
          </div>
          <p className="text-secondary leading-relaxed bg-[var(--card-bg)] p-3 rounded-lg border border-secondary">
            Inline prose demonstration: You can{' '}
            <LinkButton variant="brand">view the activity logs</LinkButton> to
            inspect past events, or{' '}
            <LinkButton variant="subtle">adjust configuration</LinkButton> if
            required. To abort this workflow,{' '}
            <LinkButton variant="danger">cancel the request</LinkButton> at any
            time.
          </p>
        </section>

        {/* Section 2: Truncated Description */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary border-b border-secondary pb-2">
            2. TruncatedDescription (inline expand/collapse button)
          </h3>
          <div className="bg-[var(--card-bg)] p-3 rounded-lg border border-secondary">
            <TruncatedDescription
              max={80}
              text="OpenStack is an open source platform that uses pooled virtual resources to build and manage private and public clouds. It delivers massive scalability and enterprise reliability."
            />
          </div>
        </section>

        {/* Section 3: Text Buttons (formerly .text-btn) */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary border-b border-secondary pb-2">
            3. Unstyled Action Buttons (replaces legacy .text-btn)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            {/* Copy button */}
            <div className="bg-[var(--card-bg)] p-3 rounded-lg border border-secondary flex items-center justify-between">
              <div>
                <span className="text-xs text-quinary block">
                  CopyToClipboardButton
                </span>
                <span className="font-mono text-xs text-primary">
                  192.168.1.104
                </span>
              </div>
              <CopyToClipboardButton value="192.168.1.104" size={16} />
            </div>

            {/* Carets */}
            <div className="bg-[var(--card-bg)] p-3 rounded-lg border border-secondary flex items-center justify-between">
              <div>
                <span className="text-xs text-quinary block">
                  CaretUpDownButtons
                </span>
                <span className="text-primary">Storage Priority</span>
              </div>
              <CaretUpDownButtons
                upLabel="Increase priority"
                downLabel="Decrease priority"
              />
            </div>
          </div>

          {/* Secret field reveal */}
          <div className="bg-[var(--card-bg)] p-3 rounded-lg border border-secondary flex items-center justify-between">
            <div>
              <span className="text-xs text-quinary block">
                SecretField Action Buttons
              </span>
              <span className="font-mono text-xs text-primary">
                {secretVisible ? 'secret-token-xyz-12345' : '••••••••••••••••'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <LinkButton
                variant="subtle"
                onClick={() => setSecretVisible(!secretVisible)}
              >
                {secretVisible ? 'Hide' : 'Show'}
              </LinkButton>
              <CopyToClipboardButton
                value="secret-token-xyz-12345"
                size={16}
                onlyButton
              />
            </div>
          </div>

          {/* Attachment list item button */}
          <div className="bg-[var(--card-bg)] p-3 rounded-lg border border-secondary flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileIcon size={18} weight="bold" className="text-quaternary" />
              <span>certificate.pem</span>
              <span className="text-xs text-quinary">(2.4 KB)</span>
            </div>
            <button
              type="button"
              className="bg-transparent border-0 p-0 m-0 cursor-pointer text-quaternary hover:text-danger inline-flex items-center"
              aria-label="Remove certificate"
            >
              <TrashIcon size={16} weight="bold" />
            </button>
          </div>
        </section>

        {/* Section 4: Navigational Links */}
        <section className="space-y-3">
          <h3 className="font-semibold text-primary border-b border-secondary pb-2">
            4. Navigational Link (core Link.tsx styling)
          </h3>
          <div className="flex flex-col gap-2 bg-[var(--card-bg)] p-3 rounded-lg border border-secondary">
            <div>
              <span className="text-xs text-quinary block mb-1">
                Default plain text link (brand-secondary + hover underline):
              </span>
              <Link state="profile.details">Go to user profile</Link>
            </div>
            <div>
              <span className="text-xs text-quinary block mb-1">
                With className override (text-secondary):
              </span>
              <Link state="profile.details" className="text-secondary">
                Secondary color link
              </Link>
            </div>
            <div>
              <span className="text-xs text-quinary block mb-1">
                With buttonVariant="secondary":
              </span>
              <Link state="profile.details" buttonVariant="secondary">
                Button styled link
              </Link>
            </div>
          </div>
        </section>
      </div>
    );
  },
};
