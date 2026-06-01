import { FunctionComponent } from 'react';

import { StringGroup } from '@/form';
import { translate } from '@/i18n';

import { articleCodeValidator } from './utils';

export const ArticleCodeField: FunctionComponent = () => {
  return (
    <StringGroup
      name="article_code"
      validate={articleCodeValidator}
      label={translate('Article code')}
      tooltip={translate('Technical code used by accounting software.')}
      tooltipEnd={true}
      space={5}
    />
  );
};
