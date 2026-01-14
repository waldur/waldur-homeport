import { CheckIcon, CopyIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { useCopyToClipboard } from '@waldur/ai-assistant/hooks/useCopyToClipboard';

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
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="aui-code-header">
      <span className="aui-code-language">{language || 'text'}</span>
      {showCopyButton && (
        <button
          className="aui-code-copy-btn"
          onClick={onCopy}
          aria-label="Copy code"
          title="Copy"
        >
          {!isCopied && <CopyIcon weight="bold" />}
          {isCopied && <CheckIcon weight="bold" />}
        </button>
      )}
    </div>
  );
};
