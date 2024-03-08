import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { openOfferingDetailsDialog } from '../../offerings/details/OfferingDetailsButton';

export const OfferingDetailsField = ({ offering }) => {
  const dispatch = useDispatch();
  return (
    <Field
      label={translate('Offering name')}
      value={
        <>
          {offering.name}{' '}
          <button
            className="text-link"
            type="button"
            onClick={() => dispatch(openOfferingDetailsDialog(offering))}
          >
            [{translate('Show offering')}]
          </button>
        </>
      }
    />
  );
};
