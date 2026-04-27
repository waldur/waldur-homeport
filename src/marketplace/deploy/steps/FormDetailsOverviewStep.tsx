import { useQuery } from '@tanstack/react-query';
import { Col, Row, Stack } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import { STALE_TIME } from '@/core/constants';
import { Image } from '@/core/Image';
import { VStepperFormStepCard } from '@/form/VStepperFormStep';
import { translate } from '@/i18n';
import { getServiceProviderByCustomer } from '@/marketplace/common/api';
import { CustomerField } from '@/marketplace/details/CustomerField';
import { ProjectField } from '@/marketplace/details/ProjectField';
import { Field } from '@/resource/summary';
import { renderFieldOrDash } from '@/table/utils';

import { DetailsOverviewButton } from '../DetailsOverviewButton';
import { orderCustomerSelector } from '../selectors';
import { orderProjectSelector } from '../selectors';
import { FormStepProps } from '../types';

export const FormDetailsOverviewStep = (props: FormStepProps) => {
  const project = useSelector(orderProjectSelector);
  const customer = useSelector(orderCustomerSelector);

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
        <Row className="fs-6">
          <Col sm={6}>
            <Field
              label={translate('Offering')}
              value={
                <Stack direction="horizontal" gap={2}>
                  {props.offering.thumbnail ? (
                    <Image src={props.offering.thumbnail} size={24} circle />
                  ) : null}
                  {props.offering.name}
                </Stack>
              }
              labelClass="me-2"
              isStuck
            />
          </Col>
          <Col sm={6}>
            <Field
              label={translate('Service provider')}
              value={renderFieldOrDash(provider?.customer_name)}
              labelClass="me-2"
              isStuck
            />
          </Col>
        </Row>

        <Row className="align-items-end">
          <Col sm={6}>
            <CustomerField
              organizationGroups={props.offering.organization_groups}
            />
          </Col>
          <Col sm={6}>
            <ProjectField previewMode={props.previewMode} />
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
      <Row className="fs-6">
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
              <Stack direction="horizontal" gap={2}>
                {props.offering.thumbnail ? (
                  <Image src={props.offering.thumbnail} size={24} circle />
                ) : null}
                {props.offering.name}
              </Stack>
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
