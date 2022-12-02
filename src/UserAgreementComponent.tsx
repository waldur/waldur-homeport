import Axios from 'axios';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { ENV } from '@waldur/configs/default';

import { LoadingSpinner } from './core/LoadingSpinner';
import { translate } from './i18n';

export const USER_AGREEMENT_TYPES = {
  privacy_policy: 'PP',
  terms_of_service: 'TOS',
};

interface TemplateComponentProps {
  agreement_type: string;
  title: string;
}

async function getUserAgreement(agreement_type) {
  const response = await Axios.get(`${ENV.apiEndpoint}api/user-agreements/`, {
    params: { agreement_type: agreement_type },
  });
  return response.data[0].content;
}

export const UserAgreementComponent: FunctionComponent<TemplateComponentProps> =
  (props) => {
    const { loading, error, value } = useAsync(
      () => getUserAgreement(props.agreement_type),
      [],
    );
    if (loading) {
      return <LoadingSpinner />;
    }
    if (error) {
      return <>{translate('Unable to load page')}</>;
    }

    return (
      <div className="m-b-lg">
        <div>
          <div className="container">
            <h1>{props.title}</h1>
          </div>

          <div
            className="white-box text-page"
            dangerouslySetInnerHTML={{ __html: value }}
          />
        </div>
      </div>
    );
  };
