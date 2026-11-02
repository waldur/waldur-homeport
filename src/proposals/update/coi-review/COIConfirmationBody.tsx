import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { PropertyList, PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';

import './COIConfirmationBody.scss';

interface COIConfirmationBodyProps {
  intro: string;
  consequences: string[];
  row: ConflictOfInterest;
}

export const COIConfirmationBody: FC<COIConfirmationBodyProps> = ({
  intro,
  consequences,
  row,
}) => (
  <div>
    <p>{intro}</p>
    <div className="mb-2.5">
      <strong className="block mb-1.5">
        {translate('What happens next:')}
      </strong>
      <ul className="coi-consequences-list mb-0">
        {consequences.map((consequence, index) => (
          <li key={index}>{consequence}</li>
        ))}
      </ul>
    </div>
    <PropertyList variant="summary">
      <PropertyItem label={translate('Reviewer')} value={row.reviewer_name} />
      <PropertyItem label={translate('Proposal')} value={row.proposal_name} />
      <PropertyItem
        label={translate('Conflict type')}
        value={row.coi_type_display}
      />
    </PropertyList>
  </div>
);
