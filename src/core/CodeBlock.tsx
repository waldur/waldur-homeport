import { FunctionComponent } from 'react';

import { CopyToClipboardButton } from '@waldur/core/CopyToClipboardButton';

export const CodeBlock: FunctionComponent = ({ children }) => (
  <div className="code-block">
    <pre>
      <div className="me-1 code-block-pre">$</div>
      <div className="code-block-content">{children}</div>
      <div className="ms-1 code-block-post">
        <CopyToClipboardButton value={children} />
      </div>
    </pre>
  </div>
);
