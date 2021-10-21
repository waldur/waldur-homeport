import { FunctionComponent, ReactNode } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';
import './CopyToClipboardContainer.scss';

/**
 * @param value Which is copied to the clipboard
 * @param label A JSX element which is a visual representation of value
 */
interface CopyToClipboardContainerProps {
  value: string;
  label?: ReactNode;
}

export const CopyToClipboardContainer: FunctionComponent<CopyToClipboardContainerProps> = ({
  value,
  label,
}) => (
  <div className="pre-container">
    <pre>
      <div className="copyable-content">{label ? label : value}</div>
      <div className="m-l-xs copy-to-clipboard-container">
        <CopyToClipboardButton value={value} />
      </div>
    </pre>
  </div>
);
