import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { UIViewContext } from '@uirouter/react';
import { FC, PropsWithChildren, useState } from 'react';
import { describe, expect, it } from 'vitest';

import {
  getShownOccupant,
  LayoutSlot,
  LayoutSlotsProvider,
  useLayoutSlots,
} from './slots';

let setShowHero: (show: boolean) => void;

// A small Layout: the hero element renders only while the slot is filled,
// and the announcements element is always there.
const Shell: FC<PropsWithChildren> = ({ children }) => {
  const { value, slotRef, filled } = useLayoutSlots();
  return (
    <LayoutSlotsProvider value={value}>
      <div data-testid="filled">{filled('hero') ? 'hero' : 'none'}</div>
      {filled('hero') && <div data-testid="hero" ref={slotRef.hero} />}
      <div data-testid="announcements" ref={slotRef.announcements} />
      {children}
    </LayoutSlotsProvider>
  );
};

const Page = () => {
  const [showHero, _setShowHero] = useState(true);
  setShowHero = _setShowHero;
  const [title, setTitle] = useState('Acme');
  return (
    <main>
      {showHero && (
        <LayoutSlot name="hero">
          <button type="button" onClick={() => setTitle('Beta')}>
            {title}
          </button>
        </LayoutSlot>
      )}
    </main>
  );
};

describe('LayoutSlot', () => {
  it('renders into the slot element, and Layout knows the slot is filled', () => {
    render(
      <Shell>
        <Page />
      </Shell>,
    );
    expect(screen.getByTestId('filled')).toHaveTextContent('hero');
    expect(screen.getByTestId('hero')).toHaveTextContent('Acme');
  });

  it('keeps the content in the page tree: page state updates it', async () => {
    render(
      <Shell>
        <Page />
      </Shell>,
    );
    await userEvent.click(screen.getByRole('button', { name: 'Acme' }));
    expect(screen.getByTestId('hero')).toHaveTextContent('Beta');
  });

  it('leaves the slot empty again when the page stops rendering it', () => {
    render(
      <Shell>
        <Page />
      </Shell>,
    );
    act(() => setShowHero(false));
    expect(screen.getByTestId('filled')).toHaveTextContent('none');
    expect(screen.queryByTestId('hero')).not.toBeInTheDocument();
  });

  it('takes bars from several components in the announcements slot', () => {
    render(
      <Shell>
        <LayoutSlot name="announcements">
          <span>Page bar</span>
        </LayoutSlot>
        <LayoutSlot name="announcements">
          <span>Security alert</span>
        </LayoutSlot>
      </Shell>,
    );
    const bars = screen.getByTestId('announcements');
    expect(bars).toHaveTextContent('Page bar');
    expect(bars).toHaveTextContent('Security alert');
  });

  it('renders nothing outside Layout', () => {
    render(
      <LayoutSlot name="hero">
        <span>Hero</span>
      </LayoutSlot>,
    );
    expect(screen.queryByText('Hero')).not.toBeInTheDocument();
  });

  describe('with nested pages', () => {
    // What UI-Router provides: each nested UIView adds a segment.
    const View: FC<PropsWithChildren<{ fqn: string }>> = ({
      fqn,
      children,
    }) => (
      <UIViewContext.Provider value={{ fqn, context: undefined }}>
        {children}
      </UIViewContext.Provider>
    );

    let setShowChild: (show: boolean) => void;

    // An organization page whose view holds a user's page, both with a hero.
    const Pages = () => {
      const [showChild, _setShowChild] = useState(true);
      setShowChild = _setShowChild;
      return (
        <View fqn="$default">
          <LayoutSlot name="hero">
            <span>Organization hero</span>
          </LayoutSlot>
          {showChild && (
            <View fqn="$default.$default">
              <LayoutSlot name="hero">
                <span>User hero</span>
              </LayoutSlot>
            </View>
          )}
        </View>
      );
    };

    it('shows only the innermost page’s hero', () => {
      render(
        <Shell>
          <Pages />
        </Shell>,
      );
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveTextContent('User hero');
      expect(hero).not.toHaveTextContent('Organization hero');
    });

    it('falls back to the outer page’s hero when the inner page goes', () => {
      render(
        <Shell>
          <Pages />
        </Shell>,
      );
      act(() => setShowChild(false));
      const hero = screen.getByTestId('hero');
      expect(hero).toHaveTextContent('Organization hero');
      expect(hero).not.toHaveTextContent('User hero');
    });
  });
});

describe('getShownOccupant', () => {
  it('picks the deepest occupant, the latest between equals', () => {
    expect(
      getShownOccupant([
        { id: 'outer', depth: 1 },
        { id: 'inner', depth: 3 },
        { id: 'middle', depth: 2 },
      ]),
    ).toBe('inner');
    expect(
      getShownOccupant([
        { id: 'first', depth: 2 },
        { id: 'second', depth: 2 },
      ]),
    ).toBe('second');
    expect(getShownOccupant([])).toBeUndefined();
  });
});
