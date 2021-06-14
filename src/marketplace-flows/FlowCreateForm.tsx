import { triggerTransition } from '@uirouter/redux';
import { ToggleButton } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { Field, formValueSelector, reduxForm } from 'redux-form';

import { required } from '@waldur/core/validators';
import { FormContainer, StringField, SubmitButton } from '@waldur/form';
import { AsyncSelectField } from '@waldur/form/AsyncSelectField';
import { ToggleButtonGroupInput } from '@waldur/form/ToggleButtonGroupInput';
import { reactSelectMenuPortaling } from '@waldur/form/utils';
import { translate } from '@waldur/i18n';
import { getOffering } from '@waldur/marketplace/common/api';
import {
  offeringsAutocomplete,
  organizationAutocomplete,
} from '@waldur/marketplace/common/autocompletes';
import { OfferingConfigurator } from '@waldur/marketplace/details/OfferingConfigurator';
import { closeModalDialog } from '@waldur/modal/actions';
import { useTitle } from '@waldur/navigation/title';
import { showError, showSuccess } from '@waldur/store/notify';

import { createFlow } from './api';

const FORM_ID = 'FlowCreateForm';

const enhance = reduxForm<{}, {}>({
  form: FORM_ID,
  initialValues: {
    customer_mode: 'new',
  },
});

const selector = formValueSelector(FORM_ID);

export const FlowCreateForm = enhance(
  ({ invalid, submitting, handleSubmit }) => {
    const dispatch = useDispatch();
    const mode = useSelector((state) => selector(state, 'customer_mode'));
    const offeringData = useSelector((state) =>
      selector(state, 'resource_create_request.offering'),
    );
    const offeringState = useAsync(
      () =>
        offeringData
          ? getOffering(offeringData.uuid)
          : Promise.resolve(undefined),
      [offeringData?.uuid],
    );
    const setRoutes = async (formData) => {
      const payload: Record<string, any> = {
        project_create_request: formData.project_create_request,
        resource_create_request: {
          name: formData.resource_create_request.name,
          offering: formData.resource_create_request.offering.url,
          attributes: {},
        },
      };
      if (mode === 'new') {
        payload.customer_create_request = formData.customer_create_request;
      } else {
        payload.customer = formData.customer.url;
      }
      try {
        await createFlow(payload);
        dispatch(triggerTransition('profile.flows-list', {}));
        dispatch(
          showSuccess(translate('Resource creation flow has been created.')),
        );
        dispatch(closeModalDialog());
      } catch (e) {
        dispatch(showError(translate('Unable to submit data.')));
      }
    };
    useTitle(translate('Create resource flow'));

    return (
      <form onSubmit={handleSubmit(setRoutes)} className="form-horizontal">
        <FormContainer submitting={submitting}>
          <Field
            name="customer_mode"
            component={ToggleButtonGroupInput}
            customer_mode
            type="radio"
            defaultValue="new"
          >
            <ToggleButton value="new">
              {translate('Create new organization')}
            </ToggleButton>
            <ToggleButton value="existing">
              {translate('Select existing organization')}
            </ToggleButton>
          </Field>
          {mode === 'new' ? (
            <StringField
              label={translate('Organization name')}
              name="customer_create_request.name"
              validate={[required]}
              required={true}
            />
          ) : (
            <AsyncSelectField
              label={translate('Client organization')}
              name="customer"
              validate={[required]}
              required={true}
              loadOptions={(query, prevOptions, page) =>
                organizationAutocomplete(query, prevOptions, page, false, [
                  'name',
                  'url',
                ])
              }
              {...reactSelectMenuPortaling()}
              getOptionLabel={({ name }) => name}
            />
          )}
          <StringField
            label={translate('Project name')}
            name="project_create_request.name"
            validate={[required]}
            required={true}
          />
          <StringField
            label={translate('Resource name')}
            name="resource_create_request.name"
            validate={[required]}
            required={true}
          />
          <AsyncSelectField
            label={translate('Service offering')}
            name="resource_create_request.offering"
            validate={[required]}
            required={true}
            loadOptions={(query, prevOptions, page) =>
              offeringsAutocomplete(
                { name: query, shared: true },
                prevOptions,
                page,
                ['name', 'uuid', 'url', 'type'],
              )
            }
            {...reactSelectMenuPortaling()}
            getOptionLabel={({ name }) => name}
            getOptionValue={({ url }) => url}
          />
        </FormContainer>
        {offeringState.value && (
          <OfferingConfigurator offering={offeringState.value} limits={[]} />
        )}
        <SubmitButton
          disabled={invalid}
          submitting={submitting}
          label={translate('Submit')}
        />
      </form>
    );
  },
);
