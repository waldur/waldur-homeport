import { createContext, FC, ReactNode, useContext } from 'react';
import { createPortal } from 'react-dom';

/**
 * Where a panel's own controls go in the header of the panel around it: the
 * Validation page's panels keep a view's filters and downloads beside its
 * title and Export. Undefined outside such a panel; null until its header has
 * mounted.
 */
const PanelHeaderSlotContext = createContext<
  { slot: HTMLElement | null } | undefined
>(undefined);

export const PanelHeaderSlotProvider = PanelHeaderSlotContext.Provider;

/**
 * A view's controls: in the header of the panel around it when there is
 * one, in place above the view otherwise (e.g. on a call template's page).
 */
export const PanelHeaderControls: FC<{
  children: ReactNode;
  /** The row's classes when it stays in place. */
  className?: string;
}> = ({ children, className }) => {
  const header = useContext(PanelHeaderSlotContext);
  if (!header) {
    return <div className={className}>{children}</div>;
  }
  return header.slot ? createPortal(children, header.slot) : null;
};
