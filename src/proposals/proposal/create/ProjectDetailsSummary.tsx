import { Card } from 'react-bootstrap';

import { ReadOnlyFormControl } from '@waldur/form/ReadOnlyFormControl';
import { translate } from '@waldur/i18n';

export const ProjectDetailsSummary = ({ proposal }) => (
  <Card>
    <Card.Header>
      <Card.Title>{translate('Proposal summary')}</Card.Title>
    </Card.Header>
    <Card.Body>
      <ReadOnlyFormControl
        label={translate('Project title')}
        value={proposal.name}
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Project summary')}
        value={proposal.project_summary}
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Detailed description')}
        value={proposal.description || 'N/A'}
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Project for civilian purpose?')}
        value={
          proposal.project_has_civilian_purpose
            ? translate('Yes')
            : translate('No')
        }
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Research field (OECD code)')}
        value={proposal.oecd_fos_2007_label || 'N/A'}
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Is the project confidential?')}
        value={
          proposal.project_is_confidential ? translate('Yes') : translate('No')
        }
        className="col-12 col-md-6"
        floating
      />

      <ReadOnlyFormControl
        label={translate('Project duration in days')}
        value={proposal.duration_in_days || 0}
        className="col-12 col-md-6"
        floating
      />
    </Card.Body>
  </Card>
);
