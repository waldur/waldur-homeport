import { useDispatch } from 'react-redux';

import { translate } from '@waldur/i18n';
import { Field } from '@waldur/resource/summary';

import { openOfferingDetailsDialog } from '../offerings/details/OfferingDetailsButton';

export const OfferingDetailsField = ({ resource }) => {
  const dispatch = useDispatch();
  return (
    <Field
      label={translate('Offering name')}
      value={
        <>
          {resource.offering_name}{' '}
          <a
            className="text-dark text-decoration-underline text-hover-primary"
            onClick={() =>
              dispatch(openOfferingDetailsDialog(resource.offering_uuid))
            }
          >
            [{translate('Show offering')}]
          </a>
        </>
      }
    />
  );
};
