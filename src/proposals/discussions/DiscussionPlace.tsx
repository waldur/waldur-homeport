import { FC } from 'react';

import { Link } from '@/core/Link';
import { translate } from '@/i18n';

interface DiscussionPlaceProps {
  proposal_uuid?: string | null;
  proposal_name?: string | null;
  proposal_slug?: string | null;
  round_name?: string | null;
  panel_name?: string | null;
}

/**
 * Where a discussion is held: its proposal, linked, or for a step run once
 * per round the round and its panel.
 */
export const DiscussionPlace: FC<DiscussionPlaceProps> = ({
  proposal_uuid,
  proposal_name,
  proposal_slug,
  round_name,
  panel_name,
}) =>
  proposal_uuid ? (
    <Link
      state="proposals.manage-proposal"
      params={{ proposal_uuid }}
      label={proposal_name || proposal_slug}
    />
  ) : (
    <span>
      {panel_name
        ? translate('{round}, {panel}', {
            round: round_name,
            panel: panel_name,
          })
        : round_name}
    </span>
  );
