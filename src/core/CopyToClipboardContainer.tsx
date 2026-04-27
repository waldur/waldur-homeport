import { FunctionComponent, ReactNode } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

/**
 * @param value Which is copied to the clipboard
 * @param label A JSX element which is a visual representation of value
 * @param maxWidth Maximum width for the copyable content (default: '280px' for backward compatibility)
 */
interface CopyToClipboardContainerProps {
  value: string;
  label?: ReactNode;
  maxWidth?: string | number;
}

export const CopyToClipboardContainer: FunctionComponent<
  CopyToClipboardContainerProps
> = ({ value, label, maxWidth = '280px' }) => (
  <div className="pre-container">
    <pre>
      <div
        className="copyable-content"
        style={{
          maxWidth,
          width: maxWidth === 'none' ? 'auto' : undefined,
        }}
      >
        {label ? label : value}
      </div>
      <div className="ms-1 copy-to-clipboard-container">
        <CopyToClipboardButton value={value} />
      </div>
    </pre>
  </div>
);
