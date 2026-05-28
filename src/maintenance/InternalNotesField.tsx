import { useMemo } from 'react';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';
import { useCustomer, useUser } from '@/workspace/hooks';
import { checkIsOwnerOrStaff } from '@/workspace/selectors';

export const InternalNotes = ({ maintenance, space = undefined }) => {
  const user = useUser();
  const customer = useCustomer();
  const show = useMemo(
    () => checkIsOwnerOrStaff(customer, user),
    [customer, user],
  );

  if (!show) return null;

  return (
    <Field
      label={
        <>
          {translate('Internal notes')}:
          <span className="text-quaternary d-block">
            {translate('Providers/staff visible only')}
          </span>
        </>
      }
      value={renderFieldOrDash(maintenance.internal_notes)}
      space={space}
    />
  );
};
