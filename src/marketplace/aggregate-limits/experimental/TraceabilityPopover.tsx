import { InfoIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { OverlayTrigger, Popover } from 'react-bootstrap';

import { translate } from '@/i18n';

export interface TraceabilityRow {
  label: string;
  value: string;
}

interface TraceabilityPopoverProps {
  id: string;
  title: string;
  rows: TraceabilityRow[];
}

// Renders a small info icon. On click, shows a popover that lists each
// rendered piece of data alongside the exact backend endpoint, function,
// or DB field it maps to. References are hand-curated from the codebase
// so a reader can grep them rather than guess.
export const TraceabilityPopover: FC<TraceabilityPopoverProps> = ({
  id,
  title,
  rows,
}) => (
  <OverlayTrigger
    trigger="click"
    placement="auto"
    rootClose
    overlay={
      <Popover id={`traceability-${id}`} style={{ maxWidth: 480 }}>
        <Popover.Header>{title}</Popover.Header>
        <Popover.Body>
          <dl className="mb-0">
            {rows.map((row, i) => (
              <div key={i} className="mb-2">
                <dt className="text-secondary fw-medium small">{row.label}</dt>
                <dd className="mb-0">
                  <code
                    style={{
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      fontSize: '0.8rem',
                    }}
                  >
                    {row.value}
                  </code>
                </dd>
              </div>
            ))}
          </dl>
          <small className="text-muted d-block mt-2">
            {translate(
              'Click the info icon again to dismiss. References are pinned to file paths and line numbers in the repo.',
            )}
          </small>
        </Popover.Body>
      </Popover>
    }
  >
    <button
      type="button"
      aria-label={title}
      className="btn btn-link btn-sm p-0 lh-1 text-info"
      style={{ verticalAlign: 'middle' }}
    >
      <InfoIcon weight="fill" size={16} />
    </button>
  </OverlayTrigger>
);
