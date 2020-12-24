import Axios from 'axios';
import { FunctionComponent } from 'react';
import { useAsync } from 'react-use';

import { FormattedHtml } from './core/FormattedHtml';
import { LoadingSpinner } from './core/LoadingSpinner';
import { translate } from './i18n';

interface Props {
  url: string;
}

export const TemplateComponent: FunctionComponent<Props> = (props) => {
  const { loading, error, value } = useAsync(
    () => Axios.get(props.url).then((response) => response.data),
    [],
  );
  if (loading) {
    return <LoadingSpinner />;
  }
  if (error) {
    return <>{translate('Unable to load page')}</>;
  }
  return <FormattedHtml html={value} />;
};
