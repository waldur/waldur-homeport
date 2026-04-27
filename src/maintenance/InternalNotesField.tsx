import { useSelector } from 'react-redux';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';
import { isOwnerOrStaff } from '@/workspace/selectors';

export const InternalNotes = ({ maintenance, space = undefined }) => {
  const show = useSelector(isOwnerOrStaff);

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
