import { CaretLeftIcon } from '@phosphor-icons/react';
import { FC } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useFormState } from 'react-final-form';
import { adminArrowSettingsSaveSettings } from 'waldur-js-client';

import { Badge } from '@/core/Badge';
import { ExternalLink } from '@/core/ExternalLink';
import { SubmitButton } from '@/form/SubmitButton';
import { translate } from '@/i18n';
import { CloseDialogButton } from '@/modal/CloseDialogButton';
import { useManagedMutation } from '@/modal/useManagedMutation';
import { WizardModal, WizardStepProps } from '@/wizard';

import { arrowQueryKeys } from '../api';
import type { ArrowSetupFormValues } from '../types';

export const Step3Preview: FC<WizardStepProps> = (props) => {
  const { values } = useFormState<ArrowSetupFormValues>();

  const handleSaveMutation = useManagedMutation<any, any, void>({
    mutationFn: () => {
      const customerMappings = Object.entries(values.selectedMappings).map(
        ([arrowRef, waldurUuid]) => ({
          arrow_reference: arrowRef,
          waldur_customer_uuid: waldurUuid,
        }),
      );

      return adminArrowSettingsSaveSettings({
        body: {
          api_url: values.api_url,
          api_key: values.api_key,
          customer_mappings: customerMappings,
        },
      });
    },

    successMessage: translate('Arrow integration configured successfully'),
    errorMessage: translate('Failed to save Arrow settings'),
    invalidateQueries: [{ queryKey: arrowQueryKeys.all }],
  });

  const mappingCount = Object.keys(values.selectedMappings).length;

  const renderFooter = () => (
    <>
      <SubmitButton
        submitting={false}
        variant="tertiary"
        className="min-w-125px me-auto"
        onClick={() => props.onPrev(values)}
        type="button"
        label={translate('Back')}
        iconNode={<CaretLeftIcon weight="bold" />}
        iconOnLeft
      />
      <CloseDialogButton className="min-w-125px" />
      <SubmitButton
        submitting={handleSaveMutation.isPending}
        label={translate('Save & Complete')}
        onClick={() => handleSaveMutation.mutate()}
        type="button"
      />
    </>
  );

  return (
    <WizardModal {...props} renderFooter={renderFooter}>
      <h4 className="mb-4">{translate('Preview Settings')}</h4>
      <p className="text-muted mb-4">
        {translate(
          'Review the settings below before saving. These will configure the Arrow integration.',
        )}
      </p>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Connection')}</h5>
        </Card.Header>
        <Card.Body>
          <Table borderless size="sm">
            <tbody>
              <tr>
                <td className="text-muted" style={{ width: '40%' }}>
                  {translate('API URL')}
                </td>
                <td>
                  <ExternalLink url={values.api_url} label={values.api_url} />
                </td>
              </tr>
              {values.partnerInfo && (
                <>
                  <tr>
                    <td className="text-muted">{translate('Partner Name')}</td>
                    <td>
                      {String(
                        (values.partnerInfo as Record<string, unknown>)
                          .company_name || '',
                      )}
                    </td>
                  </tr>
                  <tr>
                    <td className="text-muted">
                      {translate('Partner Reference')}
                    </td>
                    <td>
                      {String(
                        (values.partnerInfo as Record<string, unknown>)
                          .reference || '',
                      )}
                    </td>
                  </tr>
                </>
              )}
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      <Card className="mb-4">
        <Card.Header>
          <h5 className="mb-0">{translate('Customer Mappings')}</h5>
        </Card.Header>
        <Card.Body>
          {mappingCount > 0 ? (
            <Table borderless size="sm">
              <thead>
                <tr>
                  <th>{translate('Arrow Reference')}</th>
                  <th>{translate('Waldur Organization')}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(values.selectedMappings).map(
                  ([arrowRef, waldurUuid]) => {
                    const waldurCustomer = values.waldurCustomers.find(
                      (c) => c.uuid === waldurUuid,
                    );
                    const arrowCustomer = values.customers.find(
                      (c) => c.reference === arrowRef,
                    );
                    return (
                      <tr key={arrowRef}>
                        <td>
                          {arrowRef}
                          {arrowCustomer && (
                            <span className="text-muted ms-2">
                              ({arrowCustomer.companyName})
                            </span>
                          )}
                        </td>
                        <td>{waldurCustomer?.name || waldurUuid}</td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </Table>
          ) : (
            <span className="text-muted">
              {translate('No customer mappings configured')}
            </span>
          )}
        </Card.Body>
      </Card>

      {values.exportTypes.length > 0 && (
        <Card className="mb-4">
          <Card.Header>
            <h5 className="mb-0">{translate('Available Export Types')}</h5>
          </Card.Header>
          <Card.Body>
            <p className="text-muted small mb-3">
              {translate(
                'These billing export types are available from your Arrow account. Compatible types have all required fields.',
              )}
            </p>
            <Table borderless size="sm">
              <thead>
                <tr>
                  <th>{translate('Export Type')}</th>
                  <th>{translate('Status')}</th>
                  <th>{translate('Fields')}</th>
                </tr>
              </thead>
              <tbody>
                {values.exportTypes.map((et) => (
                  <tr key={et.reference}>
                    <td>
                      <span className="fw-bold">{et.name}</span>
                      <br />
                      <span className="text-muted small">{et.reference}</span>
                    </td>
                    <td>
                      {et.recommended ? (
                        <Badge variant="success" pill outline>
                          {translate('Recommended')}
                        </Badge>
                      ) : et.compatible ? (
                        <Badge variant="primary" pill outline>
                          {translate('Compatible')}
                        </Badge>
                      ) : (
                        <Badge variant="danger" pill outline>
                          {translate('Missing fields')}
                        </Badge>
                      )}
                    </td>
                    <td>
                      <small className="text-muted">
                        {translate('{found}/{total} required', {
                          found: et.required_fields_found,
                          total: et.required_fields_total,
                        })}
                        {', '}
                        {translate('{found}/{total} important', {
                          found: et.important_fields_found,
                          total: et.important_fields_total,
                        })}
                      </small>
                      {et.missing_required_fields.length > 0 && (
                        <div className="mt-1">
                          <small className="text-danger">
                            {translate('Missing: {fields}', {
                              fields: et.missing_required_fields.join(', '),
                            })}
                          </small>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      <Alert variant="info">
        {translate(
          'Note: API credentials will be securely stored. You can add more customer mappings after setup.',
        )}
      </Alert>
    </WizardModal>
  );
};
