import {
  ComponentPropsWithoutRef,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';

import { MenuItem } from './MenuItem';

type MenuCopyItemProps = Omit<
  ComponentPropsWithoutRef<typeof MenuItem>,
  'children' | 'onSelect'
> & {
  /** The text to copy. */
  value: string;
  /** Called once the value is on the clipboard (e.g. to show a toast). */
  onCopied?: () => void;
  /** Announced to screen readers after copying. */
  copiedAnnouncement?: string;
  /** The row's look; a function gets whether it was just copied, to show
   * "Copied" for a moment. */
  children: ReactNode | ((copied: boolean) => ReactNode);
};

/**
 * A row that copies a value (the support email, the API token). It is a
 * Menu.Item, so it is reached as any other row in its panel (the arrow keys
 * in a menu, Tab in a disclosure) and choosing it copies; the panel stays
 * open, so the confirmation can be seen. It has no look of its own: the caller
 * renders the row, for instance a field and a "Copy" button as visuals.
 */
export const MenuCopyItem = ({
  value,
  onCopied,
  copiedAnnouncement,
  children,
  ...props
}: MenuCopyItemProps) => {
  const [copied, setCopied] = useState(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timeout.current), []);

  return (
    <MenuItem
      {...props}
      onSelect={(event) => {
        event.preventDefault();
        void navigator.clipboard.writeText(value).then(() => {
          setCopied(true);
          clearTimeout(timeout.current);
          timeout.current = setTimeout(() => setCopied(false), 1500);
          onCopied?.();
        });
      }}
    >
      {typeof children === 'function' ? children(copied) : children}
      {copiedAnnouncement && (
        <span className="sr-only" aria-live="polite">
          {copied ? copiedAnnouncement : ''}
        </span>
      )}
    </MenuItem>
  );
};
