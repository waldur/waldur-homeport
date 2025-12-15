import { CheckIcon, CopyIcon } from '@phosphor-icons/react';
import Markdown, { MarkdownToJSX } from 'markdown-to-jsx';
import React, { FC, memo, useState, ReactNode } from 'react';

import { MermaidDiagram } from '@waldur/ai-assistant/components/MermaidDiagram';
import {
  CodeBlockProps,
  MarkdownTextProps,
} from '@waldur/ai-assistant/lib/types';

const useCopyToClipboard = ({
  copiedDuration = 3000,
}: {
  copiedDuration?: number;
} = {}) => {
  const [isCopied, setIsCopied] = useState<boolean>(false);

  const copyToClipboard = (value: string) => {
    if (!value) return;

    navigator.clipboard.writeText(value).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), copiedDuration);
    });
  };

  return { isCopied, copyToClipboard };
};

const CodeHeader: FC<CodeBlockProps> = ({ language, code }) => {
  const { isCopied, copyToClipboard } = useCopyToClipboard();

  const onCopy = () => {
    if (!code || isCopied) return;
    copyToClipboard(code);
  };

  return (
    <div className="aui-code-header">
      <span className="aui-code-language">{language || 'text'}</span>
      <button
        className="aui-code-copy-btn"
        onClick={onCopy}
        aria-label="Copy code"
        title="Copy"
      >
        {!isCopied && <CopyIcon weight="bold" />}
        {isCopied && <CheckIcon weight="bold" />}
      </button>
    </div>
  );
};

const PreBlock: FC<{ children?: ReactNode }> = ({ children }) => {
  if (
    !React.isValidElement(children) ||
    children.type !== 'code' ||
    !children.props
  ) {
    return <pre className="aui-md-pre">{children}</pre>;
  }

  const codeElement = children as React.ReactElement;
  const className = codeElement.props.className || '';
  const language = className.replace('lang-', '');
  const codeContent = String(codeElement.props.children);

  if (language === 'mermaid') {
    return (
      <div className="aui-code-block-root">
        <CodeHeader language={language} code={codeContent} />
        <MermaidDiagram code={codeContent} className="aui-code-block-root" />
      </div>
    );
  }

  return (
    <div className="aui-code-block-root">
      <CodeHeader language={language} code={codeContent} />
      <pre className="aui-md-pre">{codeElement}</pre>
    </div>
  );
};

const markdownOptions: MarkdownToJSX.Options = {
  overrides: {
    pre: PreBlock,
  },
};

const MarkdownTextImpl: FC<MarkdownTextProps> = ({ text }) => {
  return (
    <div className="aui-md">
      <Markdown options={markdownOptions}>{text}</Markdown>
    </div>
  );
};

export const MarkdownText = memo(MarkdownTextImpl);
