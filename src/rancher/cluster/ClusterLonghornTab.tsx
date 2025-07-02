import { Card } from 'react-bootstrap';

import { ENV } from '@waldur/core/config';
import { translate } from '@waldur/i18n';
import { DangerActionPanel } from '@waldur/user/support/DangerActionPanel';

export const ClusterLonghornTab = ({ resource }) =>
  !resource.attributes.install_longhorn ? (
    <Card className="mb-4">
      <Card.Header>
        <Card.Title>{translate('Longhorn status')}</Card.Title>
      </Card.Header>
      <Card.Body>
        <p>{translate('Longhorn is not installed.')}</p>
      </Card.Body>
    </Card>
  ) : (
    <DangerActionPanel
      resource={resource}
      panelTitle={translate('Remove Loghorn in cluster')}
      buttonTitle={translate('Request deletion')}
      panelDescription={
        <ul className="text-gray-500 mb-7">
          <li>{translate('Permanently remove Longhorn.')}</li>
          <li>{translate('This action cannot be undone.')}</li>
        </ul>
      }
      checkboxLabel={translate(
        'I confirm that I understand the impact and want to remove Longhorn',
      )}
      issueSummary={translate('Longhorn removal')}
      sucessMessage={translate(
        'Request for Longhorn removal has been submitted.',
      )}
      dialogTitle={translate('Longhorn removal')}
      dialogSubtitle={translate(
        'Removing Longhorn may result in the loss of attached volumes. Do you want to delete existing backups as well, or keep them for future use?',
      )}
      fallbackMessage={
        <>
          <p>
            {translate(
              'To remove Longhorn, please send a request to {support}.',
              {
                support:
                  ENV.plugins.WALDUR_CORE.SITE_EMAIL || translate('support'),
              },
            )}
          </p>
          <p>
            {translate(
              'Please note that request should specify what to with the volumes.',
            )}
          </p>
        </>
      }
    />
  );
