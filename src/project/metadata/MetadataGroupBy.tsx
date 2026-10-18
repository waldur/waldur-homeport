import { FormHeading, SegmentedControl } from 'waldur-ui';

import { translate } from '@/i18n';

interface GroupByButton {
  value: string;
  label: string;
}

interface MetadataGroupByProps {
  value;
  onChange;
  buttons: GroupByButton[];
}

export const MetadataGroupBy = ({
  value,
  onChange,
  buttons,
}: MetadataGroupByProps) => {
  return (
    <>
      <FormHeading className="mb-0">{translate('Group by:')}</FormHeading>
      <SegmentedControl
        aria-label={translate('Group by')}
        size="sm"
        options={buttons}
        value={value}
        onValueChange={onChange}
      />
    </>
  );
};
