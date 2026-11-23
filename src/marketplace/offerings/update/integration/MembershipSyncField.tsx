import { FC } from 'react';

import { FieldWarning } from '@/form/FieldWarning';
import { SelectField } from '@/form/select/SelectField';
import { withEditField } from '@/form/withEditField';
import { translate } from '@/i18n';

type MembershipSyncFieldProps = Parameters<typeof SelectField>[0] & {
  stompEnabled?: boolean;
};

export const getMembershipSyncWarning = () =>
  translate(
    'With STOMP events off, the agent does not sync memberships at all. Turn on Receive events over STOMP, or choose another option.',
  );

// Membership sync over STOMP needs STOMP events: without them the agent
// starts no consumer and syncs nothing. Warned of, not refused: the other
// switch may be about to change.
const MembershipSyncField: FC<MembershipSyncFieldProps> = ({
  stompEnabled,
  ...props
}) => (
  <>
    <SelectField {...props} />
    {props.input?.value === 'on' && !stompEnabled && (
      <FieldWarning error={getMembershipSyncWarning()} />
    )}
  </>
);

/** The membership sync choice, warning when it would turn sync off. */
export const MembershipSyncEditField = withEditField(MembershipSyncField);
