import { useQuery } from '@tanstack/react-query';
import { Col, Row } from 'react-bootstrap';

import { STALE_TIME } from '@/core/constants';
import { Image } from '@/core/Image';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { CustomerField } from '@/marketplace/details/CustomerField';
import { ProjectField } from '@/marketplace/details/ProjectField';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';
import { VStepperFormStepCard } from '@/wizard';

import { DetailsOverviewButton } from '../DetailsOverviewButton';
import { useOrderFormData } from '../selectors';
import { FormStepProps } from '../types';

export const FormDetailsOverviewStep = (props: FormStepProps) => {
  const { customer, project } = useOrderFormData();

  const { data: provider } = useQuery({
    queryKey: ['DeployDetailsOverview', 'provider', props.offering?.uuid],

    queryFn: () =>
      props.offering
        ? getServiceProviderByCustomer({
            customer_uuid: props.offering.customer_uuid,
          })
        : null,

    staleTime: STALE_TIME,
  });

  if (props.offering.shared) {
    // Render with organization and project fields
    return (
      <VStepperFormStepCard
        title={translate('General information')}
        id={props.id}
        disabled={props.disabled}
        actions={
          <DetailsOverviewButton
            offering={props.offering}
            customer={customer}
            project={project}
            className="ms-auto"
          />
        }
      >
        <Row className="text-sm">
          <Col sm={6}>
            <Field
              label={translate('Offering')}
              value={
                <div className="flex items-center self-stretch gap-1.5">
                  {props.offering.thumbnail ? (
                    <Image src={props.offering.thumbnail} size={24} circle />
                  ) : null}
                  {props.offering.name}
                </div>
              }
              labelClass="me-1.5"
              isStuck
            />
          </Col>
          <Col sm={6}>
            <Field
              label={translate('Service provider')}
              value={renderFieldOrDash(provider?.customer_name)}
              labelClass="me-1.5"
              isStuck
            />
          </Col>
        </Row>

        <Row className="items-end">
          <Col sm={6}>
            <CustomerField
              organizationGroups={props.offering.organization_groups}
              offering={props.offering}
            />
          </Col>
          <Col sm={6}>
            <ProjectField
              previewMode={props.previewMode}
              offering={props.offering}
            />
          </Col>
        </Row>
      </VStepperFormStepCard>
    );
  }

  return (
    <VStepperFormStepCard
      title={translate('Details overview')}
      id={props.id}
      actions={
        <DetailsOverviewButton offering={props.offering} className="ms-auto" />
      }
    >
      <Row className="text-sm">
        <Col sm={6}>
          <Field
            label={translate('Organization')}
            value={props.offering.customer_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Project')}
            value={props.offering.project_name}
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Offering')}
            value={
              <div className="flex items-center self-stretch gap-1.5">
                {props.offering.thumbnail ? (
                  <Image src={props.offering.thumbnail} size={24} circle />
                ) : null}
                {props.offering.name}
              </div>
            }
            labelCol={5}
            valueCol={7}
          />
        </Col>
        <Col sm={6}>
          <Field
            label={translate('Service provider')}
            value={renderFieldOrDash(provider?.customer_name)}
            labelCol={5}
            valueCol={7}
          />
        </Col>
      </Row>
    </VStepperFormStepCard>
  );
};
