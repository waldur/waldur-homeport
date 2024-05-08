import { useDispatch } from 'react-redux';

import { Tip } from '@waldur/core/Tooltip';
import { truncate } from '@waldur/core/utils';
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
          <Tip
            label={offering.name?.length > 30 ? offering.name : null}
            id={offering.uuid}
          >
            {truncate(offering.name)}
          </Tip>{' '}
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
