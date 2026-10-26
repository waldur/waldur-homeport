import { CubeIcon, FolderIcon, UserIcon } from '@phosphor-icons/react';
import type { Meta, StoryObj } from '@storybook/react-vite';

import {
  Avatar,
  AvatarFallback,
  AvatarGroup,
  AvatarImage,
  AvatarRoot,
} from './Avatar';

const meta: Meta<typeof Avatar> = {
  title: 'Data Display/Avatar',
  component: Avatar,
  subcomponents: {
    AvatarGroup: AvatarGroup as React.ComponentType<unknown>,
    AvatarRoot: AvatarRoot as React.ComponentType<unknown>,
    AvatarImage: AvatarImage as React.ComponentType<unknown>,
    AvatarFallback: AvatarFallback as React.ComponentType<unknown>,
  },
  parameters: {
    docs: {
      description: {
        component:
          'Avatar component with automatic acronym derivation, initials fallback, proportional font scaling, circle and square shapes, semantic tone variants, and responsive sizing. Built on top of Radix UI Avatar primitives.',
      },
    },
  },
  argTypes: {
    name: {
      control: 'text',
      description:
        'Full name or entity title. Automatically computes a two-letter acronym for initials fallback.',
    },
    initials: {
      control: 'text',
      description:
        'Explicit initials override when acronym derivation is not desired.',
    },
    src: {
      control: 'text',
      description:
        'Image URL. Renders with object-cover by default, and gracefully falls back to initials if unavailable.',
    },
    size: {
      control: 'number',
      description:
        'Proportional size in pixels (e.g. 24, 32, 40, 50, 60). Proportional font size is calculated automatically.',
    },
    shape: {
      control: 'radio',
      options: ['circle', 'square'],
      description:
        'Visual shape variant: circle (rounded-full) or square (rounded-md). Defaults to circle.',
    },
    tone: {
      control: 'select',
      options: ['subtle', 'brand', 'primary', 'success', 'warning', 'danger'],
      description:
        'Semantic background and text color variant for the fallback badge.',
    },
    isContain: {
      control: 'boolean',
      description:
        'Whether image should use object-contain (for logos/icons) rather than object-cover (for profile photos).',
    },
  },
};
export default meta;

type Story = StoryObj<typeof Avatar>;

/**
 * Interactive playground with full Controls support for name, src, shape, size, and tone.
 */
export const Default: Story = {
  args: {
    name: 'Alice Johnson',
    size: 40,
    shape: 'circle',
  },
};

/**
 * Demonstrates automatic two-letter acronym derivation, single-word names,
 * multi-word entity titles, explicit initials overrides, and edge cases.
 */
export const InitialsAndAcronyms: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Alice Cooper" size={44} />
        <span className="text-xs text-muted-foreground">
          Full Name (&quot;AC&quot;)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Administrator" size={44} />
        <span className="text-xs text-muted-foreground">
          Single Word (&quot;A&quot;)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="European High Performance Computing" size={44} />
        <span className="text-xs text-muted-foreground">
          Multi-word (&quot;EH&quot;)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar initials="VIP" size={44} tone="brand" />
        <span className="text-xs text-muted-foreground">Explicit Initials</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="?" size={44} />
        <span className="text-xs text-muted-foreground">
          Placeholder (&quot;?&quot;)
        </span>
      </div>
    </div>
  ),
};

/**
 * Circle (default, rounded-full) for users and team members, versus square
 * (rounded-md) for categories, projects, rooms, and organizations.
 */
export const Shapes: Story = {
  render: () => (
    <div className="flex items-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Circle User" size={48} shape="circle" />
        <span className="text-xs font-medium text-foreground">
          shape=&quot;circle&quot;
        </span>
        <span className="text-xs text-muted-foreground">
          Users, staff, team members
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar name="Square Project" size={48} shape="square" />
        <span className="text-xs font-medium text-foreground">
          shape=&quot;square&quot;
        </span>
        <span className="text-xs text-muted-foreground">
          Projects, categories, rooms
        </span>
      </div>
    </div>
  ),
};

/**
 * Scale matrix showing dynamic proportional typography across standard pixel sizes,
 * as well as Tailwind className sizing overrides (e.g. Shell UserMenu size-9 and size-[50px]).
 */
export const SizesAndScales: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
          Numeric Prop Sizes (with auto-proportional font size)
        </span>
        <div className="flex items-center gap-4">
          <Avatar name="Size 20" size={20} />
          <Avatar name="Size 24" size={24} />
          <Avatar name="Size 32" size={32} />
          <Avatar name="Size 40" size={40} />
          <Avatar name="Size 48" size={48} />
          <Avatar name="Size 56" size={56} />
          <Avatar name="Size 64" size={64} />
          <Avatar name="Size 80" size={80} />
        </div>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
          Tailwind className Sizing (precedence without inline override)
        </span>
        <div className="flex items-center gap-4">
          <Avatar className="size-9" name="Shell Trigger" />
          <Avatar className="size-10" name="Size 10" />
          <Avatar className="size-[50px]" name="User Menu" />
          <Avatar className="size-14" name="Size 14" />
        </div>
      </div>
    </div>
  ),
};

/**
 * Built-in semantic tone variants as well as custom tone styling via fallbackClassName.
 */
export const TonesAndColorVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
          Semantic Tone Variants
        </span>
        <div className="flex items-center gap-4">
          <Avatar name="Subtle Tone" size={40} tone="subtle" />
          <Avatar name="Brand Tone" size={40} tone="brand" />
          <Avatar name="Primary Tone" size={40} tone="primary" />
          <Avatar name="Success Tone" size={40} tone="success" />
          <Avatar name="Warning Tone" size={40} tone="warning" />
          <Avatar name="Danger Tone" size={40} tone="danger" />
        </div>
      </div>
      <div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
          Custom Chat Author Colors (via fallbackClassName)
        </span>
        <div className="flex items-center gap-4">
          <Avatar
            name="Alice Cooper"
            size={40}
            fallbackClassName="bg-brand-subtle text-brand"
          />
          <Avatar
            name="Bob Martin"
            size={40}
            fallbackClassName="bg-success-subtle text-success"
          />
          <Avatar
            name="Charlie Davis"
            size={40}
            fallbackClassName="bg-warning-subtle text-warning"
          />
          <Avatar
            name="Diana Prince"
            size={40}
            fallbackClassName="bg-danger-subtle text-danger"
          />
        </div>
      </div>
    </div>
  ),
};

/**
 * Image loading behavior demonstrating proportional photo fitting (object-cover),
 * logo fitting (object-contain), and graceful initials fallback on image errors.
 */
export const ImageLoadingAndFallback: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-8 p-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          name="Jane Doe"
          size={48}
        />
        <span className="text-xs font-medium text-foreground">
          User Portrait
        </span>
        <span className="text-xs text-muted-foreground">
          Default (object-cover)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar
          src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&auto=format&fit=crop&q=80"
          name="Abstract Shape"
          size={48}
          shape="square"
          isContain
        />
        <span className="text-xs font-medium text-foreground">Logo / Icon</span>
        <span className="text-xs text-muted-foreground">
          isContain (object-contain)
        </span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar
          src="https://invalid-url.example/broken.jpg"
          name="Broken Image"
          size={48}
        />
        <span className="text-xs font-medium text-foreground">Broken URL</span>
        <span className="text-xs text-muted-foreground">Initials fallback</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar
          src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
          size={48}
        />
        <span className="text-xs font-medium text-foreground">
          Image-only Logo
        </span>
        <span className="text-xs text-muted-foreground">
          Transparent fallback
        </span>
      </div>
    </div>
  ),
};

/**
 * Demonstrates custom children content (e.g. Phosphor icons) passed inside the fallback.
 */
export const CustomChildrenFallback: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-6">
      <div className="flex flex-col items-center gap-2">
        <Avatar size={44}>
          <UserIcon weight="bold" className="size-5 text-quaternary" />
        </Avatar>
        <span className="text-xs text-muted-foreground">User Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size={44} shape="square">
          <CubeIcon weight="bold" className="size-5 text-quaternary" />
        </Avatar>
        <span className="text-xs text-muted-foreground">Cube Icon</span>
      </div>
      <div className="flex flex-col items-center gap-2">
        <Avatar size={44} shape="square">
          <FolderIcon weight="bold" className="size-5 text-quaternary" />
        </Avatar>
        <span className="text-xs text-muted-foreground">Folder Icon</span>
      </div>
    </div>
  ),
};

/**
 * Stacked avatar groups with automatic overflow counting, theme-aware notch border rings,
 * and hover micro-animations.
 */
export const AvatarGroupStacks: Story = {
  render: () => {
    const users = [
      {
        name: 'Alice Cooper',
        src: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
      },
      { name: 'Bob Martin' },
      { name: 'Charlie Davis' },
      { name: 'Diana Prince' },
      { name: 'Evan Wright' },
      { name: 'Fiona Gallagher' },
      { name: 'George Clark' },
    ];

    return (
      <div className="flex flex-col gap-6 p-6">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
            Automatic Truncation with Overflow Badge (max=3, total=7)
          </span>
          <AvatarGroup
            spacing="md"
            max={3}
            totalCount={users.length}
            className="p-1"
          >
            {users.map((user) => (
              <Avatar
                key={user.name}
                name={user.name}
                src={user.src}
                size={40}
                className="ring-2 ring-[var(--bg-primary)] transition-transform hover:z-10 hover:scale-105"
              />
            ))}
          </AvatarGroup>
        </div>

        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-3">
            Spacing Variants (sm, md, lg)
          </span>
          <div className="flex flex-col gap-4">
            <AvatarGroup spacing="sm">
              <Avatar name="Alice Cooper" size={32} />
              <Avatar name="Bob Martin" size={32} />
              <Avatar name="Charlie Davis" size={32} />
              <Avatar initials="+4" size={32} tone="subtle" />
            </AvatarGroup>
            <AvatarGroup spacing="md">
              <Avatar name="Alice Cooper" size={40} />
              <Avatar name="Bob Martin" size={40} />
              <Avatar name="Charlie Davis" size={40} />
              <Avatar initials="+4" size={40} tone="subtle" />
            </AvatarGroup>
            <AvatarGroup spacing="lg">
              <Avatar name="Alice Cooper" size={48} />
              <Avatar name="Bob Martin" size={48} />
              <Avatar name="Charlie Davis" size={48} />
              <Avatar initials="+4" size={48} tone="subtle" />
            </AvatarGroup>
          </div>
        </div>
      </div>
    );
  },
};

/**
 * Advanced composition using low-level Radix primitives directly
 * (e.g. adding an active online status badge indicator to an avatar).
 */
export const PrimitivesComposition: Story = {
  render: () => (
    <div className="flex items-center gap-6 p-6">
      <div className="relative inline-block">
        <AvatarRoot className="size-12">
          <AvatarImage
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            alt="Active User"
          />
          <AvatarFallback>AU</AvatarFallback>
        </AvatarRoot>
        <span
          className="absolute bottom-0 right-0 size-3.5 rounded-full bg-success ring-2 ring-[var(--bg-primary)]"
          title="Online"
        />
      </div>

      <div className="relative inline-block">
        <AvatarRoot className="size-12">
          <AvatarFallback tone="brand">VM</AvatarFallback>
        </AvatarRoot>
        <span
          className="absolute bottom-0 right-0 size-3.5 rounded-full bg-warning ring-2 ring-[var(--bg-primary)]"
          title="Away"
        />
      </div>

      <div className="relative inline-block">
        <AvatarRoot className="size-12">
          <AvatarFallback tone="subtle">JD</AvatarFallback>
        </AvatarRoot>
        <span
          className="absolute bottom-0 right-0 size-3.5 rounded-full bg-neutral-400 ring-2 ring-[var(--bg-primary)]"
          title="Offline"
        />
      </div>
    </div>
  ),
};
