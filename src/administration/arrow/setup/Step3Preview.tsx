import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';

import { SubmitButton } from '@waldur/form/SubmitButton';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';

import { arrowQueryKeys, useSaveArrowSettings } from '../api';
import type { ArrowDiscoveryState } from '../types';

interface Step3PreviewProps {
  state: ArrowDiscoveryState;
  onBack: () => void;
  onClose: () => void;
}

export const Step3Preview = ({ state, onBack, onClose }: Step3PreviewProps) => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const saveSettings = useSaveArrowSettings();

  const handleSave = async () => {
    setSaving(true);
    try {
      // Convert mappings Map to array format expected by API
      const customerMappings = Array.from(state.selectedMappings.entries()).map(
        ([arrowRef, waldurUuid]) => ({
          arrow_reference: arrowRef,
          waldur_customer_uuid: waldurUuid,
        }),
      );

      await saveSettings.mutateAsync({
        api_url: state.credentials!.api_url,
        api_key: state.credentials!.api_key,
        customer_mappings: customerMappings,
      });

      queryClient.invalidateQueries({ queryKey: arrowQueryKeys.all });
      dispatch(
        showSuccess(translate('Arrow integration configured successfully')),
      );
      dispatch(closeModalDialog());
    } catch (e: any) {
      dispatch(
        showErrorResponse(e, translate('Failed to save Arrow settings')),
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
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
                  <code>{state.credentials?.api_url}</code>
                </td>
              </tr>
              {state.partnerInfo && (
                <>
                  <tr>
                    <td className="text-muted">{translate('Partner Name')}</td>
                    <td>{String(state.partnerInfo.partner_name || '')}</td>
                  </tr>
                  <tr>
                    <td className="text-muted">
                      {translate('Partner Reference')}
                    </td>
                    <td>
                      <code>
                        {String(state.partnerInfo.partner_reference || '')}
                      </code>
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
          {state.selectedMappings.size > 0 ? (
            <Table borderless size="sm">
              <thead>
                <tr>
                  <th>{translate('Arrow Reference')}</th>
                  <th>{translate('Waldur Organization')}</th>
                </tr>
              </thead>
              <tbody>
                {Array.from(state.selectedMappings.entries()).map(
                  ([arrowRef, waldurUuid]) => {
                    const waldurCustomer = state.waldurCustomers.find(
                      (c) => c.uuid === waldurUuid,
                    );
                    const arrowCustomer = state.customers.find(
                      (c) => c.reference === arrowRef,
                    );
                    return (
                      <tr key={arrowRef}>
                        <td>
                          <code>{arrowRef}</code>
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

      <Alert variant="info">
        {translate(
          'Note: API credentials will be securely stored. You can add more customer mappings after setup.',
        )}
      </Alert>

      <div className="d-flex justify-content-end gap-2 mt-6">
        <ActionButton
          action={onClose}
          variant="secondary"
          title={translate('Cancel')}
        />
        <ActionButton
          action={onBack}
          variant="tertiary"
          title={translate('Back')}
        />
        <SubmitButton
          submitting={saving}
          onClick={handleSave}
          label={translate('Save & Complete')}
          type="button"
        />
      </div>
    </div>
  );
};
