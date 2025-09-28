import { XIcon } from '@phosphor-icons/react';
import { useCallback } from 'react';
import { Button } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { marketplaceUserOfferingConsentsRevoke } from 'waldur-js-client';

import { formatDateTime } from '@waldur/core/dateUtils';
import { translate } from '@waldur/i18n';
import { ResourceNameField } from '@waldur/marketplace/resources/list/ResourceNameField';
import { ResourceStateField } from '@waldur/marketplace/resources/list/ResourceStateField';
import { closeModalDialog } from '@waldur/modal/actions';
import { ModalDialog } from '@waldur/modal/ModalDialog';
import { showErrorResponse, showSuccess } from '@waldur/store/notify';

export const RevokeTosDialog = ({
  resolve: { tos, offering, refetch, resources },
}) => {
  const dispatch = useDispatch();

  const handleRevoke = useCallback(async () => {
    try {
      await marketplaceUserOfferingConsentsRevoke({
        path: { uuid: tos.user_consent.uuid },
      });

      dispatch(
        showSuccess(
          translate('Terms of service consent has been revoked successfully.'),
        ),
      );
      if (refetch) await refetch();
      dispatch(closeModalDialog());
    } catch (error) {
      dispatch(
        showErrorResponse(
          error,
          translate('Unable to revoke Terms of service consent.'),
        ),
      );
    }
  }, [dispatch, tos.user_consent.uuid, refetch]);

  return (
    <ModalDialog
      title={translate('Revoke ToS Consent')}
      iconNode={<XIcon weight="bold" />}
      iconColor="danger"
      footer={
        <>
          <Button
            variant="outline btn-outline-default"
            className="flex-equal"
            onClick={() => dispatch(closeModalDialog())}
          >
            {translate('Cancel')}
          </Button>
          <Button
            variant="light-danger"
            className="flex-equal"
            onClick={handleRevoke}
          >
            {translate('Revoke')}
          </Button>
        </>
      }
    >
      <p className="mb-4">
        {translate(
          'Are you sure you want to revoke your consent for Terms of service version {version} for {offeringName}? This action can be reversed by accepting the ToS again.',
          {
            version: tos.version || 'v1.0',
            offeringName: offering.name,
          },
        )}
      </p>

      {resources && resources.length > 0 && (
        <div className="mb-4">
          <h6 className="mb-3">
            {translate('Resources that will be affected:')}
          </h6>
          <div className="card card-table card-bordered">
            <div className="card-body">
              <table className="table align-middle">
                <thead>
                  <tr className="align-middle">
                    <th>{translate('Name')}</th>
                    <th>{translate('Project')}</th>
                    <th>{translate('Category')}</th>
                    <th>{translate('Created')}</th>
                    <th>{translate('State')}</th>
                  </tr>
                </thead>
                <tbody>
                  {resources.map((resource: any, index: number) => (
                    <tr key={index}>
                      <td>
                        <ResourceNameField row={resource} />
                      </td>
                      <td>{resource.project_name || '-'}</td>
                      <td>{resource.category_title}</td>
                      <td>{formatDateTime(resource.created)}</td>
                      <td>
                        <ResourceStateField resource={resource} outline pill />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </ModalDialog>
  );
};
