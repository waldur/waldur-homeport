import { CopyIcon } from '@phosphor-icons/react';
import {
  createContext,
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

import { BaseButton } from '../Button';

export interface CopyButtonProps {
  value: string;
  /** Already translated by the caller, unlike LanguageMenu.tsx (which calls
   * translate() directly, since waldur-i18n-runtime is a real dependency of
   * this package) — that component has one fixed, non-reusable set of
   * strings; this component's label legitimately varies by call site
   * ("Copy", "Copy token", "Copy link", ...), so it stays a prop rather than
   * a hardcoded translate() call. */
  label: string;
  copiedLabel: string;
  /** What was copied, in words ("Backend ID"), for the feedback a
   * `CopyFeedbackProvider` gives. */
  name?: string;
  /** Render just the icon, with `label` / `copiedLabel` as its tooltip and
   * accessible name — for a copy affordance sitting inline after a value. */
  iconOnly?: boolean;
  className?: string;
}

export interface CopyFeedback {
  value: string;
  name?: string;
}

const CopyFeedbackContext = createContext<
  ((feedback: CopyFeedback) => void) | undefined
>(undefined);

/**
 * Lets the host app report a copy its own way. A notification system is the
 * app's (Homeport's toasts live in waldur-notifications, which this package
 * does not depend on), so every `CopyButton` below calls `onCopied` after a
 * successful copy. Without a provider the button's own label swap is the
 * only feedback.
 */
export const CopyFeedbackProvider: FC<
  PropsWithChildren<{ onCopied(feedback: CopyFeedback): void }>
> = ({ onCopied, children }) => (
  <CopyFeedbackContext.Provider value={onCopied}>
    {children}
  </CopyFeedbackContext.Provider>
);

/** What reports a copy to the app, when a `CopyFeedbackProvider` is above. */
export const useCopyFeedback = () => useContext(CopyFeedbackContext);

/**
 * Writes `value` to the clipboard. Resolves `false` instead of throwing when
 * the browser refuses — a denied permission, or no Clipboard API at all on an
 * insecure origin — so a caller gives no "copied" feedback for a failed copy.
 */
export const copyToClipboard = (value: string): Promise<boolean> => {
  if (!navigator.clipboard) return Promise.resolve(false);
  return navigator.clipboard.writeText(value).then(
    () => true,
    () => false,
  );
};

/**
 * The button swaps its label (label → copiedLabel, then back) after a copy,
 * and reports the copy to an enclosing `CopyFeedbackProvider`, which the app
 * turns into a toast. Extracted here since the same value/label/onClick/
 * useState shape shows up twice in waldur-shell's UserMenu.tsx (API token,
 * IP address) with nothing app-specific about it.
 */
export function CopyButton({
  value,
  label,
  copiedLabel,
  name,
  iconOnly,
  className,
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const onCopied = useContext(CopyFeedbackContext);
  // One timer at a time: a second copy restarts the 1.5s, and an unmount
  // cancels it.
  const resetTimer = useRef<number>();
  useEffect(() => () => window.clearTimeout(resetTimer.current), []);

  const handleClick = () => {
    copyToClipboard(value).then((ok) => {
      if (!ok) return;
      setCopied(true);
      onCopied?.({ value, name });
      window.clearTimeout(resetTimer.current);
      resetTimer.current = window.setTimeout(() => setCopied(false), 1500);
    });
  };

  const currentLabel = copied ? copiedLabel : label;

  return iconOnly ? (
    <BaseButton
      variant="text-secondary"
      size="sm"
      iconNode={<CopyIcon weight="bold" />}
      tooltip={currentLabel}
      onClick={handleClick}
      className={className}
    />
  ) : (
    <BaseButton
      variant="tertiary"
      size="sm"
      iconNode={<CopyIcon weight="bold" />}
      label={currentLabel}
      onClick={handleClick}
      className={className}
    />
  );
}
