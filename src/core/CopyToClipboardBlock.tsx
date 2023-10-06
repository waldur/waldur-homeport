import { FunctionComponent, ReactNode } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

/**
 * @param value Which is copied to the clipboard
 * @param label A JSX element which is a visual representation of value
 */
interface CopyToClipboardBlockProps {
  value: string;
  label?: ReactNode;
}

export const CopyToClipboardBlock: FunctionComponent<CopyToClipboardBlockProps> =
  ({ value, label }) => (
    <div className="pre-block">
      <pre>
        <div className="copyable-content">{label ? label : value}</div>
        <div className="ms-1 copy-to-clipboard-block">
          <CopyToClipboardButton value={value} />
        </div>
      </pre>
    </div>
  );
