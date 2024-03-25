import { FC } from 'react';

import { translate } from '@waldur/i18n';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { AddUserButton } from './AddUserButton';
import { AddUserDialogProps } from './types';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

export const UsersListPlaceholder: FC<AddUserDialogProps> = (props) => (
  <ImageTablePlaceholder
    illustration={TwoDocumentsIllustration}
    title={translate('Nothing to see here')}
    action={<AddUserButton {...props} />}
  />
);
