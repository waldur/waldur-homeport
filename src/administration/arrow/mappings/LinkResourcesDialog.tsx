import { FC, useCallback, useState } from 'react';
import { Alert, Card, Table } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import type { ArrowCustomerMapping } from 'waldur-js-client';

import { Badge } from '@waldur/core/Badge';
import { LoadingErred } from '@waldur/core/LoadingErred';
import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';
import { ActionButton } from '@waldur/table/ActionButton';
import { DASH_ESCAPE_CODE } from '@waldur/table/constants';

import { useDiscoverLicenses, useLinkResource } from '../api';

interface LinkResourcesDialogProps {
  resolve: {
    mapping: ArrowCustomerMapping;
  };
}

export const LinkResourcesDialog: FC<LinkResourcesDialogProps> = ({
  resolve,
}) => {
  const { mapping } = resolve;
  const dispatch = useDispatch();
  const { data, isLoading, error, refetch } = useDiscoverLicenses(mapping.uuid);
  const linkResource = useLinkResource();
  const [linkingResource, setLinkingResource] = useState<string | null>(null);

  const handleLink = useCallback(
    async (resourceUuid: string, licenseReference: string) => {
      setLinkingResource(resourceUuid);
      try {
        await linkResource.mutateAsync({
          mappingUuid: mapping.uuid,
          data: {
            resource_uuid: resourceUuid,
            license_reference: licenseReference,
          },
        });
        dispatch(showSuccess(translate('Resource linked to Arrow license')));
        refetch();
      } catch (e) {
        dispatch(
          showErrorResponse(
            e as Response,
            translate('Failed to link resource'),
          ),
        );
      } finally {
        setLinkingResource(null);
      }
    },
    [linkResource, mapping.uuid, dispatch, refetch],
  );

  const handleClose = useCallback(() => {
    dispatch(closeModalDialog());
  }, [dispatch]);

  return (
    <ModalDialog
      title={translate('Link Resources to Arrow Licenses')}
      subtitle={mapping.arrow_company_name}
      closeButton
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : error ? (
        <LoadingErred
          message={translate('Failed to load license data')}
          loadData={refetch}
        />
      ) : data ? (
        <div className="d-flex flex-column gap-6">
          {/* Explanation */}
          <Alert variant="info" className="mb-0">
            <strong>{translate('How linking works:')}</strong>{' '}
            {translate(
              'Set the backend_id of a Waldur resource to an Arrow License Reference to enable consumption tracking. The backend_id will be used to fetch consumption data from Arrow API.',
            )}
          </Alert>

          {/* Suggested Matches */}
          {data.suggestions && data.suggestions.length > 0 && (
            <Card>
              <Card.Header>
                <h5 className="mb-0">
                  {translate('Suggested Matches')}
                  <Badge bg="primary" className="ms-2">
                    {data.suggestions.length}
                  </Badge>
                </h5>
              </Card.Header>
              <Card.Body className="p-0">
                <Table className="mb-0" size="sm" hover>
                  <thead>
                    <tr>
                      <th>{translate('Waldur Resource')}</th>
                      <th>{translate('Arrow License')}</th>
                      <th>{translate('Confidence')}</th>
                      <th className="text-end">{translate('Action')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.suggestions.map((suggestion, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{suggestion.resource_name}</strong>
                        </td>
                        <td>
                          <span className="small">
                            {suggestion.license_reference}
                          </span>
                          {suggestion.license_name && (
                            <div className="text-muted small">
                              {suggestion.license_name}
                            </div>
                          )}
                        </td>
                        <td>
                          <Badge
                            bg={
                              suggestion.confidence >= 0.8
                                ? 'success'
                                : suggestion.confidence >= 0.5
                                  ? 'warning'
                                  : 'secondary'
                            }
                          >
                            {Math.round(suggestion.confidence * 100)}%
                          </Badge>
                        </td>
                        <td className="text-end">
                          <ActionButton
                            action={() =>
                              handleLink(
                                suggestion.resource_uuid,
                                suggestion.license_reference,
                              )
                            }
                            title={translate('Link')}
                            variant="success"
                            pending={
                              linkingResource === suggestion.resource_uuid
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </Card.Body>
            </Card>
          )}

          {/* Arrow Licenses */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {translate('Arrow Licenses')}
                <Badge variant="default" outline className="ms-2">
                  {data.arrow_licenses?.length || 0}
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {!data.arrow_licenses || data.arrow_licenses.length === 0 ? (
                <div className="text-center text-muted py-6">
                  {translate('No licenses found in Arrow billing export')}
                </div>
              ) : (
                <div
                  className="table-responsive"
                  style={{ maxHeight: '300px' }}
                >
                  <Table className="mb-0" size="sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>{translate('License Reference')}</th>
                        <th>{translate('Vendor')}</th>
                        <th>{translate('Offer')}</th>
                        <th>{translate('SKU')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.arrow_licenses.map((license, idx) => (
                        <tr key={idx}>
                          <td>
                            <span className="small">
                              {license.license_reference}
                            </span>
                          </td>
                          <td>{license.vendor_name || DASH_ESCAPE_CODE}</td>
                          <td>
                            {license.offer_name ||
                              license.friendly_name ||
                              DASH_ESCAPE_CODE}
                          </td>
                          <td>{license.offer_sku || DASH_ESCAPE_CODE}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Waldur Resources */}
          <Card>
            <Card.Header>
              <h5 className="mb-0">
                {translate('Waldur Resources')}
                <Badge variant="default" outline className="ms-2">
                  {data.waldur_resources?.length || 0}
                </Badge>
              </h5>
            </Card.Header>
            <Card.Body className="p-0">
              {!data.waldur_resources || data.waldur_resources.length === 0 ? (
                <div className="text-center text-muted py-6">
                  {translate('No resources found for this customer')}
                </div>
              ) : (
                <div
                  className="table-responsive"
                  style={{ maxHeight: '300px' }}
                >
                  <Table className="mb-0" size="sm">
                    <thead className="sticky-top bg-white">
                      <tr>
                        <th>{translate('Resource')}</th>
                        <th>{translate('Project')}</th>
                        <th>{translate('Offering')}</th>
                        <th>{translate('Current backend_id')}</th>
                        <th>{translate('State')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.waldur_resources.map((resource) => (
                        <tr key={resource.uuid}>
                          <td>
                            <strong>{resource.name}</strong>
                          </td>
                          <td>{resource.project_name || DASH_ESCAPE_CODE}</td>
                          <td>{resource.offering_name || DASH_ESCAPE_CODE}</td>
                          <td>
                            {resource.backend_id ? (
                              <span className="small text-success">
                                {resource.backend_id}
                              </span>
                            ) : (
                              <span className="text-muted">
                                {translate('Not set')}
                              </span>
                            )}
                          </td>
                          <td>
                            <Badge
                              bg={
                                resource.state === 'OK'
                                  ? 'success'
                                  : resource.state === 'Erred'
                                    ? 'danger'
                                    : 'secondary'
                              }
                            >
                              {resource.state}
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>

          {/* Manual linking form hint */}
          {data.waldur_resources &&
            data.waldur_resources.length > 0 &&
            data.arrow_licenses &&
            data.arrow_licenses.length > 0 && (
              <Alert variant="light">
                <strong>{translate('Manual linking:')}</strong>{' '}
                {translate(
                  'To manually link a resource, find the resource in Waldur and set its backend_id to the Arrow License Reference (e.g., XSP12345).',
                )}
              </Alert>
            )}

          {/* Close button */}
          <div className="d-flex justify-content-end">
            <ActionButton
              action={handleClose}
              variant="secondary"
              title={translate('Close')}
            />
          </div>
        </div>
      ) : null}
    </ModalDialog>
  );
};
