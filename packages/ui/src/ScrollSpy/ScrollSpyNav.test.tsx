import '@testing-library/jest-dom';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { act } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  scrollToSection,
  scrollToSectionById,
  ScrollSpyItem,
  ScrollSpyNav,
  useScrollTracker,
} from './index';

describe('ScrollSpy Suite', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    document.body.innerHTML = '';
  });

  describe('scrollToSection & scrollToSectionById', () => {
    it('returns false when target is not provided or not in DOM', () => {
      expect(scrollToSection(null)).toBe(false);
      expect(scrollToSection(undefined)).toBe(false);
      expect(scrollToSection('')).toBe(false);
      expect(scrollToSection('non-existent-id')).toBe(false);
    });

    it('scrolls window to target element position minus offset', () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      const el = document.createElement('div');
      el.id = 'section-1';
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 500,
        bottom: 800,
        height: 300,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 500,
        toJSON: () => {},
      });
      document.body.appendChild(el);

      const result = scrollToSection('section-1', {
        offset: 100,
        behavior: 'smooth',
      });
      expect(result).toBe(true);
      expect(scrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 400,
        behavior: 'smooth',
      });
    });

    it('supports HTMLElement reference as target', () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      const el = document.createElement('div');
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 300,
        bottom: 500,
        height: 200,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 300,
        toJSON: () => {},
      });
      document.body.appendChild(el);

      expect(scrollToSection(el, 50)).toBe(true);
      expect(scrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 250,
        behavior: 'smooth',
      });
    });

    it('supports container scrolling', () => {
      const container = document.createElement('div');
      const containerScrollToMock = vi.fn();
      container.scrollTo = containerScrollToMock;
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 50,
        bottom: 550,
        height: 500,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: 50,
        toJSON: () => {},
      });
      container.scrollTop = 100;

      const targetEl = document.createElement('div');
      vi.spyOn(targetEl, 'getBoundingClientRect').mockReturnValue({
        top: 350,
        bottom: 600,
        height: 250,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: 350,
        toJSON: () => {},
      });

      container.appendChild(targetEl);
      document.body.appendChild(container);

      expect(
        scrollToSection(targetEl, {
          container,
          offset: 20,
          behavior: 'instant',
        }),
      ).toBe(true);
      // top = container.scrollTop (100) + target.top (350) - container.top (50) - offset (20) = 380
      expect(containerScrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 380,
        behavior: 'instant',
      });
    });

    it('supports container as a React RefObject or selector string', () => {
      const container = document.createElement('div');
      container.id = 'my-scroll-box';
      const containerScrollToMock = vi.fn();
      container.scrollTo = containerScrollToMock;
      vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
        top: 0,
        bottom: 400,
        height: 400,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: 0,
        toJSON: () => {},
      });
      container.scrollTop = 0;

      const targetEl = document.createElement('div');
      targetEl.id = 'target-child';
      vi.spyOn(targetEl, 'getBoundingClientRect').mockReturnValue({
        top: 250,
        bottom: 450,
        height: 200,
        left: 0,
        right: 200,
        width: 200,
        x: 0,
        y: 250,
        toJSON: () => {},
      });

      container.appendChild(targetEl);
      document.body.appendChild(container);

      // Using a RefObject { current: container }
      const ref = { current: container };
      expect(
        scrollToSection('target-child', {
          container: ref,
          offset: 10,
        }),
      ).toBe(true);
      expect(containerScrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 240,
        behavior: 'smooth',
      });

      // Using a CSS selector string '#my-scroll-box'
      expect(
        scrollToSection('target-child', {
          container: '#my-scroll-box',
          offset: 20,
        }),
      ).toBe(true);
      expect(containerScrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 230,
        behavior: 'smooth',
      });
    });

    it('scrollToSectionById delegates to scrollToSection with extraOffset', () => {
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      const el = document.createElement('div');
      el.id = 'legacy-section';
      vi.spyOn(el, 'getBoundingClientRect').mockReturnValue({
        top: 600,
        bottom: 900,
        height: 300,
        left: 0,
        right: 100,
        width: 100,
        x: 0,
        y: 600,
        toJSON: () => {},
      });
      document.body.appendChild(el);

      expect(scrollToSectionById('legacy-section', 180)).toBe(true);
      expect(scrollToMock).toHaveBeenCalledWith({
        left: 0,
        top: 420,
        behavior: 'smooth',
      });
    });
  });

  describe('useScrollTracker', () => {
    beforeEach(() => {
      globalThis.__ioInstances = [];
    });

    const makeEntry = (id: string, ratio: number): IntersectionObserverEntry =>
      ({
        target: { id } as Element,
        intersectionRatio: ratio,
        isIntersecting: ratio > 0,
      }) as IntersectionObserverEntry;

    it('returns null when no sections are intersecting', () => {
      const el1 = document.createElement('div');
      el1.id = 'sec-1';
      document.body.appendChild(el1);

      const { result } = renderHook(() =>
        useScrollTracker({ sectionIds: ['sec-1'] }),
      );

      // No IO callback fired yet — should be null
      expect(result.current).toBe(null);
    });

    it('detects active section in area tracking mode (highest ratio wins)', () => {
      const el1 = document.createElement('div');
      el1.id = 'sec-1';
      const el2 = document.createElement('div');
      el2.id = 'sec-2';
      document.body.appendChild(el1);
      document.body.appendChild(el2);

      const { result } = renderHook(() =>
        useScrollTracker({
          sectionIds: ['sec-1', 'sec-2'],
          trackSide: 'area',
          offset: 50,
        }),
      );

      act(() => {
        // sec-2 has higher ratio — should become active
        const io = globalThis.__ioInstances.at(-1);
        io?.trigger([makeEntry('sec-1', 0.3), makeEntry('sec-2', 0.75)]);
      });

      expect(result.current).toBe('sec-2');

      act(() => {
        // sec-1 takes over
        const io = globalThis.__ioInstances.at(-1);
        io?.trigger([makeEntry('sec-1', 0.9), makeEntry('sec-2', 0.4)]);
      });

      expect(result.current).toBe('sec-1');
    });

    it('breaks ties by sectionIds order (topmost section wins)', () => {
      const el1 = document.createElement('div');
      el1.id = 'top-1';
      const el2 = document.createElement('div');
      el2.id = 'top-2';
      document.body.appendChild(el1);
      document.body.appendChild(el2);

      const { result } = renderHook(() =>
        useScrollTracker({
          sectionIds: ['top-1', 'top-2'],
          trackSide: 'top',
          offset: 50,
        }),
      );

      act(() => {
        // Equal ratio — top-1 comes first in sectionIds, should win
        const io = globalThis.__ioInstances.at(-1);
        io?.trigger([makeEntry('top-1', 0.5), makeEntry('top-2', 0.5)]);
      });

      expect(result.current).toBe('top-1');
    });

    it('disconnects IntersectionObserver on unmount', () => {
      const el = document.createElement('div');
      el.id = 'any';
      document.body.appendChild(el);

      const { unmount } = renderHook(() =>
        useScrollTracker({ sectionIds: ['any'] }),
      );

      const io = globalThis.__ioInstances.at(-1);
      const disconnectSpy = vi.spyOn(io!, 'disconnect');

      unmount();

      expect(disconnectSpy).toHaveBeenCalled();
    });
  });

  describe('ScrollSpyNav Component', () => {
    const SAMPLE_ITEMS: ScrollSpyItem[] = [
      { key: 'sec-general', title: 'General details' },
      { key: 'sec-components', title: 'Components' },
      { key: 'sec-review', title: 'Review & submit' },
    ];

    it('returns null when items array is empty', () => {
      render(<ScrollSpyNav items={[]} />);
      expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
    });

    it('renders navigation element with default aria-label and list items', () => {
      render(<ScrollSpyNav items={SAMPLE_ITEMS} />);

      const nav = screen.getByRole('navigation', { name: 'Page sections' });
      expect(nav).toBeInTheDocument();
      expect(nav).toHaveClass('scrollspy-nav');

      const links = screen.getAllByRole('link');
      expect(links).toHaveLength(3);
      expect(links[0]).toHaveTextContent('General details');
      expect(links[0]).toHaveAttribute('href', '#sec-general');
      expect(links[1]).toHaveTextContent('Components');
      expect(links[2]).toHaveTextContent('Review & submit');
    });

    it('supports tabs prop alias and custom aria-label', () => {
      render(
        <ScrollSpyNav
          tabs={SAMPLE_ITEMS}
          aria-label="Custom Form Navigation"
        />,
      );
      expect(
        screen.getByRole('navigation', { name: 'Custom Form Navigation' }),
      ).toBeInTheDocument();
    });

    it('marks the active item based on activeKey prop', () => {
      render(<ScrollSpyNav items={SAMPLE_ITEMS} activeKey="sec-components" />);

      const activeLink = screen.getByRole('link', { name: 'Components' });
      const inactiveLink = screen.getByRole('link', {
        name: 'General details',
      });

      expect(activeLink).toHaveAttribute('aria-current', 'true');
      expect(activeLink).toHaveClass('active');
      expect(activeLink).toHaveClass('text-brand-600');

      expect(inactiveLink).not.toHaveAttribute('aria-current');
      expect(inactiveLink).not.toHaveClass('active');
    });

    it('handles clicking an item: locks selection and calls onSelect', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();
      const scrollToMock = vi.fn();
      window.scrollTo = scrollToMock;

      const el = document.createElement('div');
      el.id = 'sec-review';
      document.body.appendChild(el);

      render(<ScrollSpyNav items={SAMPLE_ITEMS} onSelect={onSelect} />);

      const reviewLink = screen.getByRole('link', { name: 'Review & submit' });
      await user.click(reviewLink);

      expect(onSelect).toHaveBeenCalledWith('sec-review', SAMPLE_ITEMS[2]);
      expect(reviewLink).toHaveAttribute('aria-current', 'true');
      expect(reviewLink).toHaveClass('active');
    });

    it('supports custom scrollTo handler', async () => {
      const user = userEvent.setup();
      const customScrollTo = vi.fn();

      render(<ScrollSpyNav items={SAMPLE_ITEMS} scrollTo={customScrollTo} />);

      await user.click(screen.getByRole('link', { name: 'Components' }));
      expect(customScrollTo).toHaveBeenCalledWith('sec-components');
    });

    it('does not select disabled items', async () => {
      const user = userEvent.setup();
      const onSelect = vi.fn();

      const itemsWithDisabled: ScrollSpyItem[] = [
        { key: 'sec-1', title: 'Step 1' },
        { key: 'sec-2', title: 'Step 2 (Locked)', disabled: true },
      ];

      render(<ScrollSpyNav items={itemsWithDisabled} onSelect={onSelect} />);

      const disabledLink = screen.getByRole('link', {
        name: 'Step 2 (Locked)',
      });
      expect(disabledLink).toHaveClass('pointer-events-none');
      expect(disabledLink).toHaveClass('opacity-50');

      await user.click(disabledLink);
      expect(onSelect).not.toHaveBeenCalled();
    });

    it('marks parent item as active when a child section key is active', () => {
      const itemsWithChildren: ScrollSpyItem[] = [
        {
          key: 'parent-1',
          title: 'Parent Section',
          children: [
            { key: 'child-1-a', title: 'Child A' },
            { key: 'child-1-b', title: 'Child B' },
          ],
        },
        { key: 'parent-2', title: 'Next Section' },
      ];

      render(<ScrollSpyNav items={itemsWithChildren} activeKey="child-1-b" />);

      const parentLink = screen.getByRole('link', { name: 'Parent Section' });
      expect(parentLink).toHaveAttribute('aria-current', 'true');
      expect(parentLink).toHaveClass('active');
    });

    it('supports custom renderItem slot for router integrations', () => {
      render(
        <ScrollSpyNav
          items={SAMPLE_ITEMS}
          activeKey="sec-general"
          renderItem={({ item, isActive, className, onClick }) => (
            <button
              type="button"
              data-testid={`custom-${item.key}`}
              className={className}
              onClick={onClick}
              data-active={isActive ? 'yes' : 'no'}
            >
              Custom: {item.title}
            </button>
          )}
        />,
      );

      const customButton = screen.getByTestId('custom-sec-general');
      expect(customButton).toBeInTheDocument();
      expect(customButton).toHaveAttribute('data-active', 'yes');
      expect(customButton).toHaveClass('active');
      expect(customButton).toHaveTextContent('Custom: General details');
    });

    it('forwards ref to the nav element', () => {
      const ref = { current: null as HTMLElement | null };
      render(<ScrollSpyNav ref={ref} items={SAMPLE_ITEMS} />);
      expect(ref.current).toBeInstanceOf(HTMLElement);
      expect(ref.current?.tagName.toLowerCase()).toBe('nav');
    });
  });
});
