import { useSelector } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';
import { renderFieldOrDash } from '@waldur/table/utils';
import { isOwnerOrStaff } from '@waldur/workspace/selectors';

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
