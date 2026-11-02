import { Feedback } from 'waldur-js-client';

import { PropertyItem } from 'waldur-ui';

import { translate } from '@/i18n';
import { ExpandableContainer } from '@/table/ExpandableContainer';

export const SupportFeedbackListExpandableRow = ({
  row,
}: {
  row: Feedback;
}) => (
  <ExpandableContainer asTable>
    <PropertyItem
      label={translate('Comment')}
      value={row.comment}
      hideIfEmpty={false}
    />
  </ExpandableContainer>
);
