import { LockOpenIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { StepContribution } from 'waldur-js-client';

import { AlertItem, BaseButton } from 'waldur-ui';

import { translate } from '@/i18n';
import { useModal } from '@/modal/actions';
import { User } from '@/workspace/types';

/**
 * Whether ``user`` would act on ``contribution`` from outside the team it
 * belongs to: a per-offering slot whose offering they hold no role on, and
 * that is neither handed to them nor written by them -- the call's
 * managers, staff. Its actions are theirs too, but not to take lightly.
 */
export const actsAsOutsider = (
  user: Pick<User, 'uuid' | 'permissions'> | null | undefined,
  contribution: Pick<
    StepContribution,
    | 'is_per_offering'
    | 'offering_uuid'
    | 'delegate_uuid'
    | 'contributor_uuid'
    | 'can_fill'
    | 'can_delegate'
  >,
): boolean => {
  if (!user || !contribution.is_per_offering || !contribution.offering_uuid) {
    return false;
  }
  if (!contribution.can_fill && !contribution.can_delegate) return false;
  if (
    user.uuid === contribution.delegate_uuid ||
    user.uuid === contribution.contributor_uuid
  ) {
    return false;
  }
  return !(user.permissions ?? []).some(
    (grant) =>
      grant.scope_type === 'offering' &&
      grant.scope_uuid === contribution.offering_uuid,
  );
};

interface ContributionActLockProps {
  contribution: Pick<StepContribution, 'offering_name'>;
  unlocked: boolean;
  onChange(unlocked: boolean): void;
}

/**
 * The proposal form's lock (ProposalEditLock), for an offering team's
 * contribution: someone off the team -- a call manager, staff -- may fill,
 * submit or hand it on, but only once they unlock it on purpose, told
 * whose work it is, and a banner keeps saying so while it is open.
 */
export const ContributionActLock: FC<ContributionActLockProps> = ({
  contribution,
  unlocked,
  onChange,
}) => {
  const { confirm } = useModal();
  const team = contribution.offering_name || translate('the offering');

  const unlock = async () => {
    try {
      await confirm(
        translate('Act for {team}’s team?', { team }),
        translate(
          'This contribution is {team}’s team’s, and you are not on it. What you fill in, submit or hand on is done for them, without asking them first. Unlock only to act on their behalf.',
          { team },
        ),
        { positiveButton: translate('Unlock contribution') },
      );
      onChange(true);
    } catch {
      // Cancelled: it stays locked.
    }
  };

  return unlocked ? (
    <AlertItem
      variant="warning"
      type="floating"
      data-testid="contribution-unlocked"
      title={translate('You are acting for {team}’s team', { team })}
      body={translate('Lock it again when you are done.')}
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
      variant="info"
      type="floating"
      data-testid="contribution-locked"
      title={translate('Read-only: {team}’s team’s contribution', { team })}
      body={translate(
        'You may act on it for them, but it is their work. It stays read-only until you unlock it.',
      )}
      actions={
        <BaseButton
          label={translate('Unlock')}
          iconNode={<LockOpenIcon weight="bold" />}
          variant="tertiary"
          size="sm"
          onClick={unlock}
        />
      }
    />
  );
};
