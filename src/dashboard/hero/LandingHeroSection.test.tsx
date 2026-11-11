import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { ENV } from '@/core/config';

import { LandingHeroSection } from './LandingHeroSection';

describe('LandingHeroSection', () => {
  const originalSidebarStyle = ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE;

  afterEach(() => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = originalSidebarStyle;
  });

  it('renders header, title and children', () => {
    render(
      <LandingHeroSection header="Welcome" title="Marketplace">
        <div data-testid="hero-child">Search box</div>
      </LandingHeroSection>,
    );

    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(
      'Welcome',
    );
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(
      'Marketplace',
    );
    expect(screen.getByTestId('hero-child')).toBeInTheDocument();
    expect(screen.getByTestId('landing-hero-search-slot')).toBeInTheDocument();
  });

  // The legacy search-box rules never won over the input's own utilities, so
  // the field has always looked like the default input; restyling it here
  // would change what users see.
  it.each(['dark', 'light', 'accent'])(
    'leaves the search field the default input look (%s sidebar)',
    (sidebarStyle) => {
      ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = sidebarStyle;
      render(
        <LandingHeroSection header="Welcome" title="Marketplace">
          <div data-testid="hero-child">Search box</div>
        </LandingHeroSection>,
      );

      const slot = screen.getByTestId('landing-hero-search-slot');
      expect(slot.className).not.toContain('--input-');
    },
  );

  it('does not render search slot when no children are provided', () => {
    render(<LandingHeroSection header="Welcome" title="Marketplace" />);
    expect(
      screen.queryByTestId('landing-hero-search-slot'),
    ).not.toBeInTheDocument();
  });

  it('applies default background styling when sidebar style is dark or default', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
    render(<LandingHeroSection header="Welcome" title="Marketplace" />);

    const hero = screen.getByTestId('landing-hero');
    expect(hero).toHaveClass('bg-brand-900');
    expect(hero).toHaveClass('bg-center');
    expect(hero).toHaveClass('dark:bg-media');
  });

  it('applies light background styling when sidebar style is light', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'light';
    render(<LandingHeroSection header="Welcome" title="Marketplace" />);

    const hero = screen.getByTestId('landing-hero');
    expect(hero).toHaveClass('bg-primary');
    expect(hero).toHaveClass('bg-[50%_40%]');
  });

  it('applies accent background styling when sidebar style is accent', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'accent';
    render(<LandingHeroSection header="Welcome" title="Marketplace" />);

    const hero = screen.getByTestId('landing-hero');
    expect(hero).toHaveClass('bg-brand-50');
    expect(hero).toHaveClass('bg-[50%_40%]');
  });

  it('renders overlay when context is provided', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
    render(
      <LandingHeroSection
        header="Welcome"
        title="Marketplace"
        context="marketplace"
      />,
    );

    const overlay = screen.getByTestId('landing-hero-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay).toHaveClass('absolute', 'inset-0', 'pointer-events-none');
    expect(overlay).toHaveClass('bg-brand-900/40');
    expect(overlay).toHaveClass('dark:bg-media/40');
  });

  it('renders light overlay when sidebar is light', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'light';
    render(
      <LandingHeroSection
        header="Welcome"
        title="Marketplace"
        context="marketplace"
      />,
    );

    const overlay = screen.getByTestId('landing-hero-overlay');
    expect(overlay).toHaveClass('bg-primary/60');
    expect(overlay).toHaveClass('dark:bg-media/40');
  });

  it('renders accent overlay when sidebar is accent', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'accent';
    render(
      <LandingHeroSection
        header="Welcome"
        title="Marketplace"
        context="marketplace"
      />,
    );

    const overlay = screen.getByTestId('landing-hero-overlay');
    expect(overlay).toHaveClass('bg-brand-100/60');
    expect(overlay).toHaveClass('dark:bg-media/40');
  });

  it('does not render overlay when context is omitted', () => {
    render(<LandingHeroSection header="Welcome" title="Marketplace" />);

    expect(screen.queryByTestId('landing-hero-overlay')).toBeNull();
  });

  it('styles headings with text-primary when context is marketplace and sidebar is light', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'light';
    render(
      <LandingHeroSection
        header="Welcome"
        title="Marketplace"
        context="marketplace"
      />,
    );

    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toHaveClass('text-primary');
  });

  // The calls hero has no image: on a light sidebar style it is white, and
  // white headings vanished on it.
  it.each(['light', 'accent'])(
    'styles calls headings with text-primary when sidebar is %s',
    (sidebarStyle) => {
      ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = sidebarStyle;
      render(
        <LandingHeroSection header="Calls" title="All calls" context="calls" />,
      );

      expect(screen.getByRole('heading', { level: 1 })).toHaveClass(
        'text-primary',
      );
      expect(screen.getByRole('heading', { level: 2 })).toHaveClass(
        'text-primary',
      );
    },
  );

  it('styles calls headings with text-white when sidebar is dark', () => {
    ENV.plugins.WALDUR_CORE.SIDEBAR_STYLE = 'dark';
    render(
      <LandingHeroSection header="Calls" title="All calls" context="calls" />,
    );

    expect(screen.getByRole('heading', { level: 1 })).toHaveClass('text-white');
  });

  it('applies background image when provided', () => {
    render(
      <LandingHeroSection
        header="Welcome"
        title="Marketplace"
        backgroundImage="url(/test.png)"
      />,
    );

    const hero = screen.getByTestId('landing-hero');
    expect(hero.style.backgroundImage).toContain('/test.png');
  });
});
