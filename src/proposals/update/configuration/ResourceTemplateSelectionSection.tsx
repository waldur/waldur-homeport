import { FC, useMemo } from 'react';

import { EditFieldProvider, SelectEditField } from '@/form/editFields';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';
import { Call } from '@/proposals/types';
import { useUpdateCall } from '@/proposals/update/useUpdateCall';
import { getCallReadOnlyReason } from '@/proposals/utils';

const getTemplateSelectionModeOptions = () => [
  { value: 'multiple', label: translate('Several templates') },
  { value: 'single', label: translate('One template') },
];

interface ResourceTemplateSelectionSectionProps {
  call: Call;
  refetch?: () => void;
  isReadOnly?: boolean;
}

export const ResourceTemplateSelectionSection: FC<
  ResourceTemplateSelectionSectionProps
> = (props) => {
  const updateCall = useUpdateCall(props.call, props.refetch);

  const options = useMemo(getTemplateSelectionModeOptions, []);

  return (
    <FormTable.Card
      title={translate('Template selection')}
      className="card-bordered mb-4"
    >
      <EditFieldProvider
        scope={props.call}
        callback={updateCall}
        readOnlyReason={
          props.isReadOnly ? getCallReadOnlyReason(props.call) : undefined
        }
      >
        <FormTable>
          {/* The backend refuses One template while a draft holds several
              requests; a refused save reports its reason. */}
          <SelectEditField
            name="resource_template_selection_mode"
            label={translate('Applicants can request')}
            description={translate(
              '{several} lets an applicant combine templates in one proposal. {one} treats them as alternatives, such as access tiers: a proposal holds one resource request at most. Cannot be set to {one} while a draft proposal holds several resource requests.',
              { several: options[0].label, one: options[1].label },
            )}
            options={options}
            simpleValue
            isClearable={false}
            disabled={props.isReadOnly}
            renderValue={(value) =>
              options.find((o) => o.value === value)?.label || options[0].label
            }
          />
        </FormTable>
      </EditFieldProvider>
    </FormTable.Card>
  );
};
