import { FC } from 'react';

import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';

interface CodeHeaderProps {
  language?: string;
  code: string;
  showCopyButton?: boolean;
}

export const CodeHeader: FC<CodeHeaderProps> = ({
  language,
  code,
  showCopyButton = true,
}) => {
  return (
    <div className="aui-code-header">
      <span className="aui-code-language">{language || 'text'}</span>
      {showCopyButton && (
        <CopyToClipboardButton
          value={code}
          buttonClassName="aui-code-copy-btn"
          onlyButton
          verbose="Code"
        />
      )}
    </div>
  );
};
