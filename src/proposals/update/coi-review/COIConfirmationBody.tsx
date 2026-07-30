import { FC } from 'react';
import { ConflictOfInterest } from 'waldur-js-client';

import { translate } from '@/i18n';
import { Field } from '@/resource/summary';

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
    <div className="mb-3">
      <strong className="d-block mb-2">
        {translate('What happens next:')}
      </strong>
      <ul className="coi-consequences-list mb-0">
        {consequences.map((consequence, index) => (
          <li key={index}>{consequence}</li>
        ))}
      </ul>
    </div>
    <Field label={translate('Reviewer')} value={row.reviewer_name} />
    <Field label={translate('Proposal')} value={row.proposal_name} />
    <Field label={translate('Conflict type')} value={row.coi_type_display} />
  </div>
);
