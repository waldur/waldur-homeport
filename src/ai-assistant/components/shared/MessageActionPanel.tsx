import { FC, ReactNode } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

interface MessageActionPanelProps {
  // Text to copy. Omit (or pass empty) to hide the copy button — e.g. a
  // guardrail refusal that has feedback attribution but no rendered content.
  copyValue?: string;
  // Extra actions rendered after the copy button (feedback thumbs, etc.).
  children?: ReactNode;
}

// Shared container for the row of actions below an assistant message (copy +
// feedback). Keeps the layout in one place so the authenticated and anonymous
// threads present the same panel.
export const MessageActionPanel: FC<MessageActionPanelProps> = ({
  copyValue,
  children,
}) => (
  <div className="aui-message-action-panel">
    {copyValue ? (
      <CopyToClipboardButton
        value={copyValue}
        onlyButton
        buttonClassName="aui-message-action-btn"
        size={16}
      />
    ) : null}
    {children}
  </div>
);
