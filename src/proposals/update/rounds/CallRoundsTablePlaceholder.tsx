import { translate } from '@waldur/i18n';
import { Call } from '@waldur/proposals/types';
import { ImageTablePlaceholder } from '@waldur/table/ImageTablePlaceholder';

import { RoundCreateButton } from './RoundCreateButton';

const TwoDocumentsIllustration: string = require('@waldur/images/table-placeholders/undraw_no_data_qbuo.svg');

interface OwnProps {
  call: Call;
  refetch(): void;
}

export const CallRoundsTablePlaceholder = (props: OwnProps) => {
  return (
    <ImageTablePlaceholder
      illustration={TwoDocumentsIllustration}
      title={translate('Nothing to see here')}
      description={translate('You can set the first round for this call.')}
      action={<RoundCreateButton {...props} />}
    />
  );
};
