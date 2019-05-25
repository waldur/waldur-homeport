import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues, isValid as isFormValid } from 'redux-form';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { defaultCurrency, $sanitize } from '@waldur/core/services';
import { formatFilesize } from '@waldur/core/utils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { ShoppingCartButtonContainer } from '@waldur/marketplace/cart/ShoppingCartButtonContainer';
import { OfferingLogo } from '@waldur/marketplace/common/OfferingLogo';
import { RatingStars } from '@waldur/marketplace/common/RatingStars';
import { OfferingCompareButtonContainer } from '@waldur/marketplace/compare/OfferingCompareButtonContainer';
import { pricesSelector } from '@waldur/marketplace/details/plan/utils';
import { formatOrderItemForCreate } from '@waldur/marketplace/details/utils';
import { ProviderLink } from '@waldur/marketplace/links/ProviderLink';
import { Offering } from '@waldur/marketplace/types';
import * as api from '@waldur/openstack/api';
import { Flavor, ServiceComponent, LimitsType } from '@waldur/openstack/openstack-instance/types';
import { Quota } from '@waldur/openstack/types';
import { parseQuotas, parseQuotasUsage, aggregateQuotasFromSPL } from '@waldur/openstack/utils';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { getCustomer, getProject } from '@waldur/workspace/selectors';
import { Customer, Project } from '@waldur/workspace/types';

const getTotalStorage = formData =>
  formData.system_volume_size + (formData.data_volume_size || 0);

const getDailyPrice = (formData, components) => {
  /**
   * In Marketplace OpenStack plugin storage prices are stored per GB.
   * But in UI storage is storead in MB.
   * Therefore we should convert storage from GB to MB for price estimatation.
   */
  if (components && formData.flavor) {
    const cpu = formData.flavor.cores * components.cores;
    const ram = formData.flavor.ram * components.ram / 1024.0;
    const disk = getTotalStorage(formData) * components.storage / 1024.0;
    return cpu + ram + disk;
  } else {
    return 0;
  }
};

const getMonthlyPrice = (formData, components) => getDailyPrice(formData, components) * 30;

const getQuotas = ({formData, usages, limits, limitsType, project, components}) => {
  const quotas: Quota[] = [
    {
      name: 'vcpu',
      usage: usages.cores,
      limit: limits.cores,
      limitType: limitsType.cores,
      required: formData.flavor ? formData.flavor.cores : 0,
    },
    {
      name: 'ram',
      usage: usages.ram,
      limit: limits.ram,
      limitType: limitsType.ram,
      required: formData.flavor ? formData.flavor.ram : 0,
    },
    {
      name: 'storage',
      usage: usages.disk,
      limit: limits.disk,
      limitType: limitsType.disk,
      required: getTotalStorage(formData) || 0,
    },
  ];
  if (project && project.billing_price_estimate) {
    quotas.push({
      name: 'cost',
      usage: project.billing_price_estimate.total,
      limit: project.billing_price_estimate.limit,
      required: getMonthlyPrice(formData, components),
    });
  }
  return quotas;
};

const getFlavor = props =>
  props.formData.flavor ? props.formData.flavor : {};

const isValid = (formData, components) => !!getDailyPrice(formData, components);

interface OpenstackInstanceCheckoutSummaryProps extends TranslateProps {
  formData: {
    name?: string;
    service?: {name: string};
    image?: {name: string};
    flavor?: Flavor;
  };
  formValid?: boolean;
  components: ServiceComponent;
  usages: ServiceComponent;
  limits: ServiceComponent;
  limitsType: LimitsType;
  customer: Customer;
  project: Project;
  offering: Offering;
  total?: number;
}

export const PureOpenstackInstanceCheckoutSummary = (props: OpenstackInstanceCheckoutSummaryProps) => {
  return (
    <>
      {!isValid(props.formData, props.components) && (
        <p id="invalid-info">
          {props.formData.flavor && props.translate('Resource configuration is invalid. Please fix errors in form.')}
          {!props.formData.flavor && props.translate('Please select flavor to see price estimate.')}
        </p>
      )}
      {(!props.offering.shared && !props.offering.billable) && (
        <p dangerouslySetInnerHTML={{
          __html: props.translate('Note that this virtual machine will not be charged separately for {organization}.', {
            organization: $sanitize(props.customer.name),
          }),
        }}/>
      )}
      <OfferingLogo src={props.offering.thumbnail} size="small"/>
      {isValid(props.formData, props.components) && (
        <Table bordered={true}>
          <tbody>
            {props.formData.name && (
              <tr>
                <td>
                  <strong>{props.translate('VM name')}</strong>
                </td>
                <td>{props.formData.name}</td>
              </tr>
            )}
            <tr>
              <td>
                <strong>{props.translate('Image')}</strong>
              </td>
              <td>{props.formData.image && props.formData.image.name}</td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Flavor')}</strong>
              </td>
              <td>{getFlavor(props).name}</td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('vCPU')}</strong>
              </td>
              <td>{`${getFlavor(props).cores} cores`}</td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('RAM')}</strong>
              </td>
              <td>
                {formatFilesize(getFlavor(props).ram)}
              </td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Total storage')}</strong>
              </td>
              <td>
                {formatFilesize(getTotalStorage(props.formData))}
              </td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Price per day')}</strong>
                {' '}
                <PriceTooltip/>
              </td>
              <td>
                {defaultCurrency(getDailyPrice(props.formData, props.components))}
              </td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Price per 30 days')}</strong>
                {' '}
                <PriceTooltip/>
              </td>
              <td>
                {defaultCurrency(getMonthlyPrice(props.formData, props.components))}
              </td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Invoiced to')}</strong>
              </td>
              <td>{props.customer.name}</td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Project')}</strong>
              </td>
              <td>{props.project ? props.project.name : <span>&mdash;</span>}</td>
            </tr>
            <tr>
              <td>
                <strong>{props.translate('Offering')}</strong>
              </td>
              <td>{props.offering.name}</td>
            </tr>
            <tr>
            <td>
              <strong>{props.translate('Vendor')}</strong>
            </td>
            <td>
              <ProviderLink customer_uuid={props.offering.customer_uuid}>
                {props.offering.customer_name}
              </ProviderLink>
            </td>
          </tr>
          {props.offering.rating && (
            <tr>
              <td><strong>{props.translate('Rating')}</strong></td>
              <td><RatingStars rating={props.offering.rating} size="medium"/></td>
            </tr>
          )}
          </tbody>
        </Table>
      )}
      {props.components && (
        <Panel title={props.translate('Limits')}>
          <QuotaUsageBarChart quotas={getQuotas({
            formData: props.formData,
            usages: props.usages,
            limits: props.limits,
            limitsType: props.limitsType,
            project: props.project,
            components: props.components,
          })}/>
        </Panel>
      )}
    </>
  );
};

interface OpenstackInstanceCheckoutSummaryComponentState {
  loading: boolean;
  loaded: boolean;
  components: ServiceComponent;
  usages: ServiceComponent;
  limits: ServiceComponent;
  limitsType: LimitsType;
}

interface OpenstackInstanceCheckoutSummaryComponentProps extends TranslateProps {
  formData: {
    name?: string;
    service?: {name: string};
    image?: {name: string};
    flavor?: Flavor;
  };
  formValid: boolean;
  customer: Customer;
  project: Project;
  offering: Offering;
  total: number;
}

class OpenstackInstanceCheckoutSummaryComponent extends React.Component<OpenstackInstanceCheckoutSummaryComponentProps, OpenstackInstanceCheckoutSummaryComponentState> {
  state = {
    loading: false,
    loaded: false,
    components: null,
    usages: null,
    limits: null,
    limitsType: null,
  };

  async loadData() {
    try {
      this.setState({loading: true});
      let projectQuotas = [];
      if (this.props.project) {
        projectQuotas = await api.loadProjectQuotas(this.props.offering.scope_uuid, this.props.project.uuid);
      }
      const components = this.props.offering.plans.length > 0 ? this.props.offering.plans[0].prices : {};
      const usages = parseQuotasUsage(this.props.offering.quotas || []);
      const limits = parseQuotas(this.props.offering.quotas || []);
      const aggregatedData = aggregateQuotasFromSPL({components, usages, limits}, projectQuotas);
      this.setState({
        loading: false,
        loaded: true,
        components: aggregatedData.components,
        limits: aggregatedData.limits,
        usages: aggregatedData.usages,
        limitsType: aggregatedData.limitsType,
      });
    } catch (error) {
      this.setState({loading: false, loaded: false});
    }
  }

  componentDidMount() {
    this.loadData();
  }

  render() {
    const props = this.props;
    if (this.state.loading) {
      return <LoadingSpinner/>;
    }

    if (!this.state.loading && !this.state.loaded) {
      return (
        <h3 className="header-bottom-border text-center">
          {props.translate('Unable to get checkout summary data.')}
        </h3>
      );
    }

    if (this.state.loaded) {
      const { offering, customer, project, total, formData, formValid } = props;
      return (
        <>
          <PureOpenstackInstanceCheckoutSummary {...this.props} {...this.state}/>
          <div className="display-flex justify-content-between">
            <ShoppingCartButtonContainer
              item={formatOrderItemForCreate({
                formData: {attributes: formData},
                offering,
                customer,
                project,
                total,
                formValid,
              })}
              flavor="primary"
              disabled={!props.formValid}
            />
            <OfferingCompareButtonContainer offering={props.offering} flavor="secondary"/>
        </div>
      </>
      );
    }
  }
}

const mapStateToProps = (state, ownProps) => {
  const formData: any = getFormValues('marketplaceOffering')(state);
  return {
    formData: formData && formData.attributes || {attributes: {}},
    formValid: isFormValid('marketplaceOffering')(state),
    customer: getCustomer(state),
    project: getProject(state),
    total: pricesSelector(state, ownProps).total,
  };
};

const enhance = compose(
  connect(mapStateToProps),
  withTranslation,
);

export const OpenstackInstanceCheckoutSummary = enhance(OpenstackInstanceCheckoutSummaryComponent);
