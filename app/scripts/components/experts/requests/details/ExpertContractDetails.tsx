import * as React from 'react';

import { DownloadLink } from '@waldur/core/DownloadLink';
import { $filter } from '@waldur/core/services';
import { TranslateProps, withTranslation } from '@waldur/i18n';
import { connectAngularComponent } from '@waldur/store/connect';

import { ExpertContract } from './types';

interface ExpertContractDetailsProps extends TranslateProps {
  contract: ExpertContract;
}

const defaultCurrency = value => $filter('defaultCurrency')(value);

const ExpertContractDetails = ({contract, translate}: ExpertContractDetailsProps) => (
  <div className="ibox-content">
    <dl className="dl-horizontal">

      <dt>{translate('Contract price')}</dt>
      <dd>{defaultCurrency(contract.price)}</dd>

      <dt>{translate('Contract description')}</dt>
      <dd>{contract.description}</dd>

      <dt>{translate('Expert team')}</dt>
      <dd>{contract.team_name}</dd>

      {contract.file && (
        <span>
          <dt>{translate('Contract file')}</dt>
          <dd>
            <DownloadLink
              label={translate('Download PDF')}
              url={contract.file}
              filename={contract.filename}
            />
          </dd>
        </span>
      )}
    </dl>
  </div>
);

export default connectAngularComponent(withTranslation(ExpertContractDetails), ['contract']);
