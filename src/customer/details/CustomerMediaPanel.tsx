import { UploadSimpleIcon } from '@phosphor-icons/react';
import { useEffect, useMemo } from 'react';
import { Card } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { CompactSubmitButton } from '@waldur/form/CompactSubmitButton';
import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

import { EDIT_CUSTOMER_IMAGE_ID } from './constants';
import { CustomerEditPanelProps } from './types';

interface CustomerMediaPanelOwnProps extends CustomerEditPanelProps {
  embedded?: boolean;
}

export const CustomerMediaPanel = connect<{}, {}, CustomerMediaPanelOwnProps>(
  (_, ownProps) => ({
    initialValues: { image: ownProps.customer.image },
  }),
)(
  reduxForm<{ image }, CustomerMediaPanelOwnProps>({
    form: EDIT_CUSTOMER_IMAGE_ID,
  })((props) => {
    const abbreviation = useMemo(
      () => getItemAbbreviation(props.customer),
      [props.customer],
    );

    const dispatch = useDispatch<any>();
    useEffect(() => {
      // Can not use enableReinitialize on reduxForm because of infinite render loop issue
      dispatch(props.change('image', props.customer.image));
    }, [dispatch, props.customer]);

    const content = (
      <form onSubmit={props.handleSubmit(props.callback)}>
        <Field
          name="image"
          component={(fieldProps) => (
            <WideImageField
              alt={abbreviation}
              initialValue={props.customer.image}
              max={2 * 1024 * 1024} // 2MB
              size={64}
              extraActions={({ isChanged, isTooLarge }) =>
                isChanged || props.submitting ? (
                  <CompactSubmitButton
                    submitting={props.submitting}
                    label={translate('Save')}
                    disabled={isTooLarge}
                    iconNode={<UploadSimpleIcon weight="bold" />}
                  />
                ) : null
              }
              {...fieldProps}
            />
          )}
        />
      </form>
    );

    if (props.embedded) {
      return <div className="p-7">{content}</div>;
    }

    return (
      <Card className="card-bordered mb-5">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Logo')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>{content}</Card.Body>
      </Card>
    );
  }),
);
