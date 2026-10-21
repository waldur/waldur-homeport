import { render } from '@testing-library/react';
import { useRef } from 'react';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { getChromeVariables, useChromeHeights } from './chromeHeights';

describe('getChromeVariables', () => {
  it('sums everything that sticks into --layout-sticky-top', () => {
    expect(
      getChromeVariables({
        pageBar: 64,
        header: 55,
        breadcrumbBar: 55,
        pageTabs: 99,
      }),
    ).toEqual({
      '--layout-page-bar-height': '64px',
      '--layout-header-height': '55px',
      '--layout-breadcrumb-bar-height': '55px',
      '--layout-sticky-top': '273px',
    });
  });

  it('is the header alone on a page without a bar or tabs', () => {
    expect(
      getChromeVariables({
        pageBar: 0,
        header: 65,
        breadcrumbBar: 0,
        pageTabs: 0,
      }),
    ).toEqual({
      '--layout-page-bar-height': '0px',
      '--layout-header-height': '65px',
      '--layout-breadcrumb-bar-height': '0px',
      '--layout-sticky-top': '65px',
    });
  });
});

const Chrome = ({ pageBar }: { pageBar: boolean }) => {
  const pageBarRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const breadcrumbBarRef = useRef<HTMLDivElement>(null);
  const pageTabsRef = useRef<HTMLDivElement>(null);
  useChromeHeights(
    {
      pageBar: pageBarRef,
      header: headerRef,
      breadcrumbBar: breadcrumbBarRef,
      pageTabs: pageTabsRef,
    },
    [pageBar],
  );
  return (
    <>
      {pageBar && <div ref={pageBarRef} data-height="64" />}
      <div ref={headerRef} data-height="65" />
    </>
  );
};

describe('useChromeHeights', () => {
  const style = document.documentElement.style;

  // jsdom has no layout: read heights from data-height instead.
  const offsetHeight = Object.getOwnPropertyDescriptor(
    HTMLElement.prototype,
    'offsetHeight',
  );
  beforeAll(() => {
    Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
      configurable: true,
      get() {
        return Number(this.dataset.height ?? 0);
      },
    });
  });
  afterAll(() => {
    if (offsetHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        'offsetHeight',
        offsetHeight,
      );
    }
  });

  it('writes the measured heights on <html> and removes them on unmount', () => {
    const { rerender, unmount } = render(<Chrome pageBar={false} />);
    expect(style.getPropertyValue('--layout-page-bar-height')).toBe('0px');
    expect(style.getPropertyValue('--layout-sticky-top')).toBe('65px');

    rerender(<Chrome pageBar />);
    expect(style.getPropertyValue('--layout-page-bar-height')).toBe('64px');
    expect(style.getPropertyValue('--layout-sticky-top')).toBe('129px');

    unmount();
    expect(style.getPropertyValue('--layout-sticky-top')).toBe('');
  });
});
