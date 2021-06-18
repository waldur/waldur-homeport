import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useAsync } from 'react-use';
import { getFormValues, isValid, reduxForm } from 'redux-form';

import { FormattedHtml } from '@waldur/core/FormattedHtml';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ShoppingCartUpdateButton } from '@waldur/marketplace/cart/ShoppingCartUpdateButton';
import { flattenAttributes } from '@waldur/marketplace/cart/store/effects';
import { getOffering, getPlugins } from '@waldur/marketplace/common/api';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { FORM_ID } from '@waldur/marketplace/details/constants';
import {
  PureOfferingConfigurator,
  PureOfferingConfiguratorProps,
} from '@waldur/marketplace/details/OfferingConfigurator';
import { formatOrderItemForUpdate } from '@waldur/marketplace/details/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Plan } from '@waldur/marketplace/types';
import { useTitle } from '@waldur/navigation/title';
import { router } from '@waldur/router';
import { showError, showSuccess } from '@waldur/store/notify';

import { getFlow, updateFlow } from './api';

async function loadData(itemId) {
  const flow = await getFlow(itemId);
  const offering = await getOffering(
    flow.resource_create_request.offering_uuid,
  );
  const plugins = await getPlugins();
  const limits = plugins.find(
    (plugin) => plugin.offering_type === offering.type,
  ).available_limits;
  let plan = {} as Plan;
  if (offering && flow.resource_create_request.plan_uuid) {
    plan = offering.plans.find(
      (offeringPlan) =>
        offeringPlan.uuid === flow.resource_create_request.plan_uuid,
    );
  }
  return { flow, offering, plan, limits };
}

const FlowUpdateForm = reduxForm<{}, PureOfferingConfiguratorProps>({
  form: FORM_ID,
})(PureOfferingConfigurator);

export const FlowEditForm = () => {
  useTitle(translate('Flow update'));

  const state = useAsync(() => loadData(router.globals.params.flow_uuid), [
    router.globals.params.flow_uuid,
  ]);
  const formData = useSelector(getFormValues(FORM_ID));
  const formValid = useSelector(isValid(FORM_ID));
  const dispatch = useDispatch();
  const updateItem = async () => {
    const {
      attributes,
      plan,
      limits,
      customer_create_request,
      project_create_request,
    } = formatOrderItemForUpdate({ offering, formData });
    try {
      await updateFlow(router.globals.params.flow_uuid, {
        customer_create_request,
        project_create_request,
        resource_create_request: {
          name: attributes.name,
          plan: plan?.url,
          attributes: flattenAttributes(attributes),
          limits,
        },
      });
      dispatch(showSuccess('Flow has been updated.'));
    } catch (e) {
      dispatch(showError('Unable to update flow.'));
    }
  };

  if (state.loading) {
    return <LoadingSpinner />;
  }
  if (state.error) {
    return <>{translate('Unable to load flow.')}</>;
  }
  const { offering, plan, limits, flow } = state.value;
  return (
    <>
      {offering.description && (
        <div className="bs-callout bs-callout-success">
          <FormattedHtml html={offering.description} />
        </div>
      )}
      <Row>
        <Col md={9}>
          <FlowUpdateForm
            initialValues={{
              name: flow.resource_create_request.name,
              attributes: flow.resource_create_request.attributes,
              plan,
              project_create_request: flow.project_create_request,
              customer_create_request: flow.customer_create_request,
            }}
            offering={offering}
            limits={limits}
            plan={plan}
          />
        </Col>
        <Col md={3}>
          <h3 className="header-bottom-border">{translate('Summary')}</h3>
          <OfferingLogo src={offering.thumbnail} size="small" />
          <table className="table offering-details-section-table">
            <tbody>
              <tr>
                <td>
                  <strong>{translate('Offering')}</strong>
                </td>
                <td>{offering.name}</td>
              </tr>
              <tr>
                <td>
                  <strong>{translate('Service provider')}</strong>
                </td>
                <td>
                  <ProviderLink customer_uuid={offering.customer_uuid}>
                    {offering.customer_name}
                  </ProviderLink>
                </td>
              </tr>
            </tbody>
          </table>
          <div className="display-flex justify-content-between">
            <ShoppingCartUpdateButton
              updateItem={updateItem}
              flavor="primary"
              disabled={!formValid}
            />
          </div>
        </Col>
      </Row>
    </>
  );
};
