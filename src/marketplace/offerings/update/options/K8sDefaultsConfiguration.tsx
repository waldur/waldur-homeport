import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { Field } from 'react-final-form';

import { InputField } from '@/form/InputField';
import { translate } from '@/i18n';

import { FormGroup } from '../../FormGroup';

export const K8sDefaultsConfiguration: React.FC<{}> = () => {
  const name = 'default_configs';
  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">
          {translate('Default Kubernetes Infrastructure Sizing')}
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Configuration Guide */}
        <div className="rounded border border-primary bg-secondary p-4 mb-4">
          <h6 className="mb-2 text-primary">
            {translate('Configuration Guide')}
          </h6>
          <p className="mb-2">
            {translate(
              'To make this Kubernetes option fully functional, you need to configure:',
            )}
          </p>
          <ul className="mb-2">
            <li>
              <strong>{translate('Kubernetes Versions')}</strong>{' '}
              {translate('(Required - see section below)')}
            </li>
            <li>
              <strong>{translate('Default Resource Sizing')}</strong>{' '}
              {translate('(Optional - improves user experience)')}
            </li>
          </ul>
          <p className="mb-0 text-muted">
            {translate(
              'Without Kubernetes versions configured, users will see a warning and cannot create clusters.',
            )}
          </p>
        </div>

        <p className="text-muted mb-4">
          {translate(
            'Configure default resource allocations for controller nodes, load balancers, and storage volumes. These values will be used as defaults when users create new clusters.',
          )}
        </p>

        {/* Controller Node Defaults */}
        <h6 className="border-bottom pb-2 mb-3">
          {translate('Controller Node Defaults')}
          <small className="text-muted ms-2">({translate('Optional')})</small>
        </h6>
        <Row>
          <Col md={6}>
            <FormGroup
              label={translate('vCPUs per Controller')}
              help={translate(
                'Number of vCPUs allocated to each controller node',
              )}
            >
              <Field
                name={`${name}.default_controller_vcpus`}
                component={InputField as any}
                type="number"
                min="1"
                max="16"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              label={translate('RAM per Controller (GB)')}
              help={translate(
                'Amount of RAM in GB allocated to each controller node',
              )}
            >
              <Field
                name={`${name}.default_controller_ram_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="64"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormGroup
              label={translate('System Disk per Controller (GB)')}
              help={translate(
                'Size of system disk in GB for each controller node',
              )}
            >
              <Field
                name={`${name}.default_controller_system_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="500"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              label={translate('Data Disk per Controller (GB)')}
              help={translate(
                'Size of data disk in GB for each controller node',
              )}
            >
              <Field
                name={`${name}.default_controller_etcd_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="1000"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Load Balancer Defaults */}
        <h6 className="border-bottom pb-2 mb-3 mt-4">
          {translate('Load Balancer Defaults')}
          <small className="text-muted ms-2">({translate('Optional')})</small>
        </h6>
        <Row>
          <Col md={6}>
            <FormGroup
              label={translate('vCPUs per Load Balancer')}
              help={translate(
                'Number of vCPUs allocated to each load balancer node',
              )}
            >
              <Field
                name={`${name}.default_lb_vcpus`}
                component={InputField as any}
                type="number"
                min="1"
                max="16"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              label={translate('RAM per Load Balancer (GB)')}
              help={translate(
                'Amount of RAM in GB allocated to each load balancer node',
              )}
            >
              <Field
                name={`${name}.default_lb_ram_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="64"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        <Row>
          <Col md={6}>
            <FormGroup
              label={translate('System Disk per Load Balancer (GB)')}
              help={translate(
                'Size of system disk in GB for each load balancer node',
              )}
            >
              <Field
                name={`${name}.default_lb_system_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="500"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              label={translate('Data Disk per Load Balancer (GB)')}
              help={translate(
                'Size of data disk in GB for each load balancer node',
              )}
            >
              <Field
                name={`${name}.default_lb_logs_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="1000"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Worker Node Defaults */}
        <h6 className="border-bottom pb-2 mb-3 mt-4">
          {translate('Worker Node Requirements')}
          <small className="text-muted ms-2">({translate('Optional')})</small>
        </h6>
        <Row>
          <Col md={6}>
            <FormGroup
              label={translate('Minimal vCPUs per Worker')}
              help={translate(
                'Minimum number of vCPUs required for worker nodes when selecting flavors',
              )}
            >
              <Field
                name={`${name}.minimal_worker_vcpus`}
                component={InputField as any}
                type="number"
                min="1"
                max="16"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={6}>
            <FormGroup
              label={translate('Minimal RAM per Worker (GB)')}
              help={translate(
                'Minimum amount of RAM in GB required for worker nodes when selecting flavors',
              )}
            >
              <Field
                name={`${name}.minimal_worker_ram_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="64"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Volume Defaults */}
        <h6 className="border-bottom pb-2 mb-3 mt-4">
          {translate('Default Volume Sizes')}
          <small className="text-muted ms-2">({translate('Optional')})</small>
        </h6>
        <Row>
          <Col md={4}>
            <FormGroup
              label={translate('Worker Data Disk (GB)')}
              help={translate('Default size of data disk for worker nodes')}
            >
              <Field
                name={`${name}.default_worker_data_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="10000"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup
              label={translate('Storage Data Disk (GB)')}
              help={translate('Default size of data disk for storage nodes')}
            >
              <Field
                name={`${name}.default_storage_data_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="10000"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
          <Col md={4}>
            <FormGroup
              label={translate('Storage SAN Disk (GB)')}
              help={translate(
                'Default size of virtual SAN disk for storage nodes',
              )}
            >
              <Field
                name={`${name}.default_storage_san_disk_gb`}
                component={InputField as any}
                type="number"
                min="1"
                max="50000"
                parse={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Kubernetes Version Configuration */}
        <h6 className="border-bottom pb-2 mb-3 mt-4">
          {translate('Kubernetes Version Configuration')}
          <span className="text-danger ms-1">*</span>
        </h6>
        <p className="text-muted small mb-3">
          {translate(
            'Required: Users cannot create clusters until Kubernetes versions are configured.',
          )}
        </p>
        <Row>
          <Col md={12}>
            <FormGroup
              label={translate('Available Kubernetes Versions')}
              help={translate(
                'Enter comma-separated list of Kubernetes versions (e.g., 1.32.0,1.33.0,1.34.0). This controls which versions users can select when creating clusters.',
              )}
            >
              <Field
                name={`${name}.available_kubernetes_versions`}
                component={InputField as any}
                type="text"
                placeholder="1.32.0,1.33.0,1.34.0"
              />
            </FormGroup>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};
