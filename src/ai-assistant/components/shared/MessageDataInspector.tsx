import { CaretDownIcon, CaretRightIcon } from '@phosphor-icons/react';
import { FC, useId, useState } from 'react';

import { UIBlock } from '@/ai-assistant/lib/types';
import { CopyToClipboardButton } from '@/core/CopyToClipboardButton';
import { translate } from '@/i18n';

interface MessageDataInspectorProps {
  blocks: UIBlock[];
}

export const MessageDataInspector: FC<MessageDataInspectorProps> = ({
  blocks,
}) => {
  const toolBlocks = blocks.filter((b) => b.key === 'tool');
  const uiBlocks = blocks.filter((b) => b.key !== 'tool');

  if (toolBlocks.length === 0 && uiBlocks.length === 0) return null;

  return (
    <div className="d-flex flex-column gap-1 mt-2">
      {toolBlocks.length > 0 && (
        <InspectorSection
          label={translate('tool call data')}
          count={toolBlocks.length}
          blocks={toolBlocks}
        />
      )}
      {uiBlocks.length > 0 && (
        <InspectorSection
          label={translate('UI component data')}
          count={uiBlocks.length}
          blocks={uiBlocks}
        />
      )}
    </div>
  );
};

interface InspectorSectionProps {
  label: string;
  count: number;
  blocks: UIBlock[];
}

const InspectorSection: FC<InspectorSectionProps> = ({
  label,
  count,
  blocks,
}) => {
  const [expanded, setExpanded] = useState(false);
  const panelId = useId();
  const text = serializeBlocks(blocks);

  return (
    <div>
      <div className="d-flex align-items-center gap-2">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          aria-controls={panelId}
          className="btn btn-sm d-inline-flex align-items-center gap-1 p-0"
        >
          {expanded ? (
            <CaretDownIcon weight="bold" size={12} />
          ) : (
            <CaretRightIcon weight="bold" size={12} />
          )}
          <span className="small">
            {expanded
              ? translate('Hide {label} ({count})', { label, count })
              : translate('Show {label} ({count})', { label, count })}
          </span>
        </button>
        {expanded && (
          <CopyToClipboardButton
            value={text}
            verbose={label}
            onlyButton
            size={12}
          />
        )}
      </div>
      {expanded && (
        <pre id={panelId} className="p-2 rounded bg-light small mb-0 mt-1">
          <code>{text}</code>
        </pre>
      )}
    </div>
  );
};

const STRIPPED_KEYS = new Set(['id']);

const serializeBlocks = (blocks: UIBlock[]): string => {
  const cleaned = blocks.map((block) =>
    Object.fromEntries(
      Object.entries(block).filter(([key]) => !STRIPPED_KEYS.has(key)),
    ),
  );
  return JSON.stringify(cleaned.length === 1 ? cleaned[0] : cleaned, null, 2);
};
