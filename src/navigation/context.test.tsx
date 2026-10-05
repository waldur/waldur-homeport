import { act, render, screen } from '@testing-library/react';
import { FC, PropsWithChildren, ReactNode, useMemo, useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  LayoutContext,
  useExtraAnnouncementBar,
  useExtraAnnouncementBars,
} from './context';

let setBreadcrumbs: (items: unknown[]) => void;

// Mirrors Layout: the context value changes whenever breadcrumbs do.
const Provider: FC<PropsWithChildren> = ({ children }) => {
  const [bars, setExtraAnnouncementBar] = useExtraAnnouncementBars();
  const [breadcrumbs, _setBreadcrumbs] = useState([]);
  setBreadcrumbs = _setBreadcrumbs;
  const context = useMemo(
    () => ({ setExtraAnnouncementBar, breadcrumbs }),
    [setExtraAnnouncementBar, breadcrumbs],
  );
  return (
    <LayoutContext.Provider value={context}>
      <div data-testid="bars">{bars}</div>
      {children}
    </LayoutContext.Provider>
  );
};

const Bar: FC<{ content: ReactNode }> = ({ content }) => {
  useExtraAnnouncementBar(content, [content]);
  return null;
};

describe('useExtraAnnouncementBar', () => {
  it('keeps a page bar when a later consumer has nothing to show', () => {
    render(
      <Provider>
        <Bar content={<span>Information requested</span>} />
        <Bar content={null} />
      </Provider>,
    );
    expect(screen.getByText('Information requested')).toBeInTheDocument();

    act(() => setBreadcrumbs([{ label: 'Resource' }]));

    expect(screen.getByText('Information requested')).toBeInTheDocument();
  });

  it('shows bars of several consumers together', () => {
    render(
      <Provider>
        <Bar content={<span>Page bar</span>} />
        <Bar content={<span>Security alert</span>} />
      </Provider>,
    );
    expect(screen.getByText('Page bar')).toBeInTheDocument();
    expect(screen.getByText('Security alert')).toBeInTheDocument();
  });

  it('removes the bar when the consumer unmounts', () => {
    const { rerender } = render(
      <Provider>
        <Bar content={<span>Page bar</span>} />
      </Provider>,
    );
    rerender(<Provider />);
    expect(screen.queryByText('Page bar')).not.toBeInTheDocument();
  });
});
