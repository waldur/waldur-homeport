import { MagnifyingGlassIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import { Input, InputGroup } from 'waldur-ui';

import { ENV } from '@/core/config';

import { LandingHeroSection } from './LandingHeroSection';
import DefaultDarkImage from './servers-room-dark.png';

/**
 * `LandingHeroSection` is the top hero banner for public landing views
 * such as the marketplace catalog and calls for proposals.
 *
 * It supports background images, an automatic semi-transparent overlay
 * when context (`marketplace` | `calls`) is provided, and adapts its
 * colors to `sidebarStyle` (dark, light, accent) and the active theme.
 */
const meta: Meta<typeof LandingHeroSection> = {
  title: 'Dashboard/LandingHeroSection',
  component: LandingHeroSection,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    header: 'Welcome to',
    title: 'Service Marketplace',
    context: 'marketplace',
    backgroundImage: `url(${DefaultDarkImage})`,
  },
};
export default meta;

type Story = StoryObj<typeof LandingHeroSection>;

const SearchInputPlaceholder = () => (
  <div className="w-full max-w-[432px] px-3">
    <InputGroup start={<MagnifyingGlassIcon size={20} weight="bold" />}>
      <Input
        type="search"
        placeholder="Search offerings..."
        className="w-full"
      />
    </InputGroup>
  </div>
);

export const MarketplaceDefault: Story = {
  render: (args) => (
    <LandingHeroSection {...args}>
      <SearchInputPlaceholder />
    </LandingHeroSection>
  ),
};

export const CallsHero: Story = {
  args: {
    header: 'Waldur MasterMind',
    title: 'All calls for proposals',
    context: 'calls',
    backgroundImage: undefined,
  },
};

export const WithoutOverlay: Story = {
  args: {
    header: 'Explore Resources',
    title: 'Public Cloud Services',
    context: undefined,
  },
};

export const LightSidebarMode: Story = {
  render: (args) => (
    <LandingHeroSection {...args}>
      <SearchInputPlaceholder />
    </LandingHeroSection>
  ),
  decorators: [
    (Story) => {
      ENV.plugins = ENV.plugins || ({} as any);
      ENV.plugins.WALDUR_CORE = ENV.plugins.WALDUR_CORE || ({} as any);
      const prev = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE;
      ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'light';
      return (
        <div>
          <Story />
          {/* Restore after render */}
          <span
            ref={() => {
              ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = prev;
            }}
          />
        </div>
      );
    },
  ],
};

export const AccentSidebarMode: Story = {
  render: (args) => (
    <LandingHeroSection {...args}>
      <SearchInputPlaceholder />
    </LandingHeroSection>
  ),
  decorators: [
    (Story) => {
      ENV.plugins = ENV.plugins || ({} as any);
      ENV.plugins.WALDUR_CORE = ENV.plugins.WALDUR_CORE || ({} as any);
      const prev = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE;
      ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'accent';
      return (
        <div>
          <Story />
          <span
            ref={() => {
              ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = prev;
            }}
          />
        </div>
      );
    },
  ],
};
