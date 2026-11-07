import { createContext, useContext } from 'react';

/**
 * Which of the proposal page's cards are open. The page decides it in one
 * place (useProposalSections' openByDefault) and keeps what the viewer
 * toggled; each card only asks.
 */
export interface SectionOpenState {
  isOpen(id: string): boolean;
  setOpen(id: string, open: boolean): void;
}

const SectionOpenContext = createContext<SectionOpenState | null>(null);

export const SectionOpenProvider = SectionOpenContext.Provider;

export const useSectionOpenState = () => useContext(SectionOpenContext);

/**
 * The open/closed props of the card with ``id``: controlled by the page when
 * it decides, else the card's own default -- a card rendered elsewhere keeps
 * behaving as it did.
 */
export const sectionOpenProps = (
  state: SectionOpenState | null,
  id: string,
  fallback: boolean,
): {
  isOpen?: boolean;
  onToggle?(open: boolean): void;
  defaultOpen?: boolean;
} =>
  state
    ? {
        isOpen: state.isOpen(id),
        onToggle: (open: boolean) => state.setOpen(id, open),
      }
    : { defaultOpen: fallback };
