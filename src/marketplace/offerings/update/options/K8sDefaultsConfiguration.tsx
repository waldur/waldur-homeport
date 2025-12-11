import React from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import { Field } from 'redux-form';

import { InputField } from '@waldur/form/InputField';
import { translate } from '@waldur/i18n';

import { FormGroup } from '../../FormGroup';

interface K8sDefaultsConfigurationProps {
  name: string;
}

export const K8sDefaultsConfiguration: React.FC<
  K8sDefaultsConfigurationProps
> = ({ name }) => {
  return (
    <Card>
      <Card.Header>
        <h6 className="mb-0">
          {translate('Default Kubernetes Infrastructure Sizing')}
        </h6>
      </Card.Header>
      <Card.Body>
        {/* Configuration Guide */}
        <Alert variant="info" className="mb-4">
          <h6 className="mb-2">{translate('Configuration Guide')}</h6>
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
          <p className="text-muted mb-0">
            {translate(
              'Without Kubernetes versions configured, users will see a warning and cannot create clusters.',
            )}
          </p>
        </Alert>

        <p className="text-muted mb-4">
          {translate(
            'Configure default resource allocations for controller nodes, load balancers, and storage volumes. These values will be used as defaults when users create new clusters.',
          )}
        </p>

        {/* Resource Sizing - Optional but Recommended */}
        <Alert variant="light" className="mb-4 border-primary">
          <h6 className="text-primary mb-2">
            💡 {translate('Optional: Default Resource Sizing')}
          </h6>
          <p className="mb-2">
            {translate(
              'Configure default values for better user experience. If not set, system defaults will be used.',
            )}
          </p>
          <small className="text-muted">
            {translate(
              'These settings help users by pre-filling sensible defaults when they create clusters.',
            )}
          </small>
        </Alert>

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
                component={InputField}
                type="number"
                min="1"
                max="16"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="1"
                max="64"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="20"
                max="500"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="10"
                max="1000"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="1"
                max="16"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="1"
                max="64"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="20"
                max="500"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="10"
                max="1000"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="1"
                max="16"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="1"
                max="64"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="10"
                max="10000"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="10"
                max="10000"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
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
                component={InputField}
                type="number"
                min="100"
                max="50000"
                normalize={(value) => (value ? parseInt(value, 10) : undefined)}
              />
            </FormGroup>
          </Col>
        </Row>

        {/* Kubernetes Version Configuration - CRITICAL */}
        <Card className="border-warning mt-4">
          <Card.Header className="bg-warning bg-opacity-10">
            <h6 className="mb-0 text-warning">
              <strong>
                ⚠️ {translate('Required: Kubernetes Version Configuration')}
              </strong>
            </h6>
          </Card.Header>
          <Card.Body>
            <Alert variant="warning" className="mb-3">
              <strong>{translate('This field is mandatory!')}</strong>
              <br />
              {translate(
                'Users will see an error and cannot create clusters until you configure available Kubernetes versions.',
              )}
            </Alert>

            <Row>
              <Col md={12}>
                <FormGroup
                  label={
                    <span>
                      <strong>
                        {translate('Available Kubernetes Versions')}
                      </strong>
                      <span className="text-danger ms-1">*</span>
                    </span>
                  }
                  help={translate(
                    'Enter comma-separated list of Kubernetes versions (e.g., 1.32.0,1.33.0,1.34.0). This controls which versions users can select when creating clusters.',
                  )}
                >
                  <Field
                    name={`${name}.available_kubernetes_versions`}
                    component={InputField}
                    type="text"
                    placeholder="1.32.0,1.33.0,1.34.0"
                    className="border-warning"
                  />
                </FormGroup>

                <Alert variant="success" className="mt-2">
                  <small>
                    <strong>
                      {translate('✅ Example valid configuration:')}
                    </strong>
                    <br />
                    <code>1.32.0,1.33.0,1.34.0</code>
                    <br />
                    <span className="text-muted">
                      {translate(
                        'This will offer users 3 Kubernetes versions to choose from.',
                      )}
                    </span>
                  </small>
                </Alert>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      </Card.Body>
    </Card>
  );
};
