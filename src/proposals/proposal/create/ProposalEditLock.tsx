import { LockOpenIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { AlertItem, BaseButton } from 'waldur-ui';

import { StaffOnlyIndicator } from '@/core/StaffOnlyIndicator';
import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { Proposal } from '@/proposals/types';
import { useUser } from '@/workspace/hooks';

interface ProposalEditLockProps {
  proposal: Proposal;
  unlocked: boolean;
  /** Whether unlocking opens its form: a draft, or a proposal whose
   * applicant was asked for changes. Otherwise only its team can change. */
  formEditable: boolean;
  onChange(unlocked: boolean): void;
}

/**
 * For someone who may edit the proposal without being on its team -- staff,
 * say: the form stays locked until they unlock it on purpose, having been
 * told whose proposal it is, and a banner keeps saying so while it is open.
 * Once submitted, a proposal's answers are not edited, its team only:
 * the lock says so, rather than promise an edit the page does not offer.
 */
export const ProposalEditLock: FC<ProposalEditLockProps> = ({
  proposal,
  unlocked,
  formEditable,
  onChange,
}) => {
  const { confirm } = useModal();
  const user = useUser();
  const owner = proposal.created_by_name || translate('the applicant');
  const unlockLabel = formEditable
    ? translate('Unlock editing')
    : translate('Unlock team changes');

  const unlock = async () => {
    try {
      await confirm(
        formEditable
          ? translate('Edit someone else’s proposal?')
          : translate('Change someone else’s proposal team?'),
        formEditable
          ? translate(
              'This proposal belongs to {owner}’s team, and you are not on it. What you save changes their proposal without asking them first. Unlock only to correct something on their behalf.',
              { owner },
            )
          : translate(
              'This proposal belongs to {owner}’s team, and you are not on it. Who you add or remove changes their team without asking them first. Unlock only to correct it on their behalf.',
              { owner },
            ),
        { positiveButton: unlockLabel },
      );
      onChange(true);
    } catch {
      // Cancelled: the proposal stays locked.
    }
  };

  return unlocked ? (
    <AlertItem
      type="floating"
      variant="warning"
      className="mb-4 bg-primary"
      data-testid="proposal-edit-unlocked"
      title={
        formEditable
          ? translate('You are editing {owner}’s proposal', { owner })
          : translate('You are changing the team of {owner}’s proposal', {
              owner,
            })
      }
      body={translate(
        'You are not on its team. Lock it again when you are done.',
      )}
      actions={
        <BaseButton
          label={translate('Lock')}
          iconNode={<LockSimpleIcon weight="bold" />}
          variant="tertiary"
          size="sm"
          onClick={() => onChange(false)}
        />
      }
    />
  ) : (
    <AlertItem
      type="floating"
      variant="info"
      className="mb-4 bg-primary"
      data-testid="proposal-edit-locked"
      title={translate('Read-only: you are not on this proposal’s team')}
      body={
        formEditable
          ? translate(
              'You may edit it, but it belongs to {owner}’s team. It stays read-only until you unlock it.',
              { owner },
            )
          : proposal.state === 'draft'
            ? translate(
                'It belongs to {owner}’s team. Its draft is edited on the Applicant tab; here, its team stays read-only until you unlock it.',
                { owner },
              )
            : translate(
                'It belongs to {owner}’s team. It is submitted: its answers change only when the applicant is asked for changes, from a step of the Call manager view. Its team stays read-only until you unlock it.',
                { owner },
              )
      }
      actions={
        <div className="flex items-center gap-1.5">
          {user?.is_staff ? <StaffOnlyIndicator /> : null}
          <BaseButton
            label={unlockLabel}
            iconNode={<LockOpenIcon weight="bold" />}
            variant="tertiary"
            size="sm"
            onClick={unlock}
          />
        </div>
      }
    />
  );
};
