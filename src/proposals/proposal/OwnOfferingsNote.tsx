import { translate } from '@/i18n';
import { Proposal } from '@/proposals/types';

/**
 * Says that what follows is only the viewer's own offerings' part: a provider
 * reads the proposal for the offerings it manages, and the requests, awards
 * and totals of the other providers' offerings are not sent to it.
 */
export const OwnOfferingsNote = ({
  proposal,
  className = 'mb-3',
}: {
  proposal: Pick<Proposal, 'reads_own_offerings_only'>;
  className?: string;
}) =>
  proposal.reads_own_offerings_only ? (
    <p className={`text-quaternary text-xs ${className}`}>
      {translate(
        "Only your offerings' part is shown. What is requested of other providers' offerings is not shown to you.",
      )}
    </p>
  ) : null;
