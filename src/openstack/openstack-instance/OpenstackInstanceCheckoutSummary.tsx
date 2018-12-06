import * as React from 'react';
import * as Table from 'react-bootstrap/lib/Table';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import Panel from '@waldur/core/Panel';
import { defaultCurrency } from '@waldur/core/services';
import { formatFilesize } from '@waldur/core/utils';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { Flavor, ServiceComponent, LimitsType } from '@waldur/openstack/openstack-instance/types';
import { PriceTooltip } from '@waldur/price/PriceTooltip';
import { QuotaUsageBarChart } from '@waldur/quotas/QuotaUsageBarChart';
import { Customer, Project } from '@waldur/workspace/types';

interface OpenstackInstanceCheckoutSummaryProps extends TranslateProps {
  loading?: boolean;
  formData: {
    vmName?: string;
    service?: {name: string};
    image?: {name: string};
    flavor?: Flavor;
  };
  components: ServiceComponent;
  usages: ServiceComponent;
  limits: ServiceComponent;
  limitsType: LimitsType;
  customer: Customer;
  project: Project;
}

const getTotalStorage = formData =>
  formData.system_volume_size + (formData.data_volume_size || 0);

const getDailyPrice = (formData, components) => {
  if (components && formData.flavor) {
    return formData.flavor.cores *
            components.cores + formData.flavor.ram *
              components.ram + getTotalStorage(formData) * components.disk;
  } else {
    return 0;
  }
};

const getMonthlyPrice = (formData, components) => getDailyPrice(formData, components) * 30;

const getQuotas = ({formData, project, components, usages, limits, limitsType}) => [
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
  {
    name: 'cost',
    usage: project.billing_price_estimate.total,
    limit: project.billing_price_estimate.limit,
    required: getMonthlyPrice(formData, components),
  },
];

const getFlavor = props =>
  props.formData.flavor ? props.formData.flavor : {};

const isValid = (formData, components) => !!getDailyPrice(formData, components);

export const PureOpenstackInstanceCheckoutSummary = (props: OpenstackInstanceCheckoutSummaryProps) => {
  if (props.loading) {
    return <LoadingSpinner/>;
  }

  const serviceName = props.formData.service ? props.formData.service.name : '';
  return (
    <Panel title={props.translate('Checkout summary')}>
      {!isValid(props.formData, props.components) && (
        <p id="invalid-info">
          {props.formData.flavor && props.translate('Resource configuration is invalid. Please fix errors in form.')}
          {!props.formData.flavor && props.translate('No items yet.')}
        </p>
      )}
      {props.components && (
        <p dangerouslySetInnerHTML={{
          __html: props.translate('Note that this virtual machine is charged as part of <strong>{serviceName}</strong> package.', {serviceName}),
        }}/>
      )}
      {isValid(props.formData, props.components) && (
        <Table bordered={true}>
          <tbody>
            {props.formData.vmName && (
              <tr>
                <td>
                  <strong>{props.translate('VM name')}</strong>
                </td>
                <td>{props.formData.vmName}</td>
              </tr>
            )}
            <tr>
              <td>
                <strong>{props.translate('Image')}</strong>
              </td>
              <td>{props.formData.image.name}</td>
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
                <strong>{props.translate('Price per month')}</strong>
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
              <td>{props.project.name}</td>
            </tr>
          </tbody>
        </Table>
      )}
      {props.components && (
        <Panel title={props.translate('Package limits')}>
          <QuotaUsageBarChart quotas={getQuotas(props)}/>
        </Panel>
      )}
    </Panel>
  );
};

export const OpenstackInstanceCheckoutSummary = withTranslation(PureOpenstackInstanceCheckoutSummary);
