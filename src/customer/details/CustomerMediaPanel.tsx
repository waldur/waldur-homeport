import { UploadSimple } from '@phosphor-icons/react';
import { useEffect, useMemo } from 'react';
import { Button, Card } from 'react-bootstrap';
import { connect, useDispatch } from 'react-redux';
import { Field, reduxForm } from 'redux-form';

import { WideImageField } from '@waldur/form/WideImageField';
import { translate } from '@waldur/i18n';
import { getItemAbbreviation } from '@waldur/navigation/workspace/context-selector/utils';

import { EDIT_CUSTOMER_IMAGE_ID } from './constants';
import { CustomerEditPanelProps } from './types';

export const CustomerMediaPanel = connect<{}, {}, CustomerEditPanelProps>(
  (_, ownProps) => ({
    initialValues: { image: ownProps.customer.image },
  }),
)(
  reduxForm<{ image }, CustomerEditPanelProps>({
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

    return (
      <Card className="card-bordered mb-7">
        <Card.Header>
          <Card.Title>
            <h3>{translate('Logo')}</h3>
          </Card.Title>
        </Card.Header>
        <Card.Body>
          <form onSubmit={props.handleSubmit(props.callback)}>
            <Field
              name="image"
              component={(fieldProps) => (
                <WideImageField
                  alt={abbreviation}
                  initialValue={props.customer.image}
                  max={2 * 1024 * 1024} // 2MB
                  size={65}
                  extraActions={({ isChanged, isTooLarge }) =>
                    isChanged || props.submitting ? (
                      <Button
                        type="submit"
                        variant="primary"
                        size="sm"
                        className="btn-icon-right"
                        disabled={props.submitting || isTooLarge}
                      >
                        {translate('Save')}
                        <span className="svg-icon svg-icon-5">
                          <UploadSimple />
                        </span>
                      </Button>
                    ) : null
                  }
                  {...fieldProps}
                />
              )}
            />
          </form>
        </Card.Body>
      </Card>
    );
  }),
);
