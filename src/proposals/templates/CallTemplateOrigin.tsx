import { FC } from 'react';
import { CallTemplateOrigin as Origin } from 'waldur-js-client';

import { BaseButton, Tooltip } from 'waldur-ui';

import { ExternalLink } from '@/core/ExternalLink';
import { translate } from '@/i18n';

/** Who a process belongs to: its programme, else its organisation. */
export const originOwner = (origin: Origin) =>
  origin.programme || origin.organization || '';

/** "Process — Programme", or "Process — Organisation" for a process of no
 * programme; just the process for a generic pattern naming neither. */
export const originLabel = (origin: Origin) => {
  const owner = originOwner(origin);
  return owner ? `${origin.process} — ${owner}` : origin.process;
};

/** The origin's label, with the reference page in a popover. */
export const CallTemplateOrigin: FC<{
  origin: Origin;
  referenceTitle?: string | null;
}> = ({ origin, referenceTitle }) => {
  const text = originLabel(origin);
  if (!origin.reference_url) {
    return <span>{text}</span>;
  }
  return (
    <Tooltip
      trigger="click"
      label={translate('Reference')}
      body={
        <ExternalLink
          url={origin.reference_url}
          label={referenceTitle || origin.reference_url}
          className="text-inherit underline"
        />
      }
    >
      <BaseButton variant="text-primary" label={text} />
    </Tooltip>
  );
};
