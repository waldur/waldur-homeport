import { createElement, FunctionComponent } from 'react';
import { connect } from 'react-redux';
import { getFormValues, isValid } from 'redux-form';

import { defaultCurrency } from '@waldur/core/formatCurrency';
import { translate } from '@waldur/i18n';
import { getActiveFixedPricePaymentProfile } from '@waldur/invoices/details/utils';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { ShoppingCartUpdateButtonContainer } from '@waldur/marketplace/cart/ShoppingCartUpdateButtonContainer';
import { BillingPeriod } from '@waldur/marketplace/common/BillingPeriod';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

import { pricesSelector } from './plan/utils';
import { OfferingFormData, OrderSummaryProps } from './types';
import { formatOrderItemForCreate, formatOrderItemForUpdate } from './utils';

export const SummaryTable: FunctionComponent<OrderSummaryProps> = (props) => (
  <table className="table offering-details-section-table">
    <tbody>
      <tr>
        <td>
          <strong>{translate('Offering')}</strong>
        </td>
        <td>{props.offering.name}</td>
      </tr>
      <tr>
        <td>
          <strong>{translate('Service provider')}</strong>
        </td>
        <td>
          <ProviderLink customer_uuid={props.offering.customer_uuid}>
            {props.offering.customer_name}
          </ProviderLink>
        </td>
      </tr>
      {props.offering.rating && (
        <tr>
          <td>
            <strong>{translate('Rating')}</strong>
          </td>
          <td>
            <RatingStars rating={props.offering.rating} size="medium" />
          </td>
        </tr>
      )}
      <tr>
        <td>
          <strong>{translate('Invoiced to')}</strong>
        </td>
        <td>{props.customer.name}</td>
      </tr>
      {props.project && (
        <tr>
          <td>
            <strong>{translate('Project')}</strong>
          </td>
          <td>{props.project.name}</td>
        </tr>
      )}
      {props.extraComponent ? createElement(props.extraComponent, props) : null}
      {!getActiveFixedPricePaymentProfile(props.customer.payment_profiles) &&
        props.formData &&
        props.formData.plan && (
          <tr>
            <td className="text-lg">
              <BillingPeriod unit={props.formData.plan.unit} />
            </td>
            <td className="text-lg">{defaultCurrency(props.total)}</td>
          </tr>
        )}
    </tbody>
  </table>
);

const PureOrderSummary: FunctionComponent<OrderSummaryProps> = (props) => (
  <>
    <OfferingLogo src={props.offering.thumbnail} size="small" />
    <SummaryTable {...props} />
    <div className="display-flex justify-content-between">
      {!props.updateMode ? (
        <ShoppingCartButtonContainer
          item={formatOrderItemForCreate(props)}
          flavor="primary"
          disabled={!props.formValid}
        />
      ) : (
        <ShoppingCartUpdateButtonContainer
          item={formatOrderItemForUpdate(props)}
          flavor="primary"
          disabled={!props.formValid}
        />
      )}
      <OfferingCompareButtonContainer
        offering={props.offering}
        flavor="secondary"
      />
    </div>
  </>
);

interface OrderSummaryStateProps {
  customer: Customer;
  project?: Project;
  total: number;
  formData: OfferingFormData;
  formValid: boolean;
}

const mapStateToProps = (state, ownProps) => ({
  customer: getCustomer(state),
  project: getProject(state),
  total: pricesSelector(state, ownProps).total,
  formData: getFormValues('marketplaceOffering')(state),
  formValid: isValid('marketplaceOffering')(state),
});

export const OrderSummary = connect<
  OrderSummaryStateProps,
  {},
  { offering: Offering }
>(mapStateToProps)(PureOrderSummary);
