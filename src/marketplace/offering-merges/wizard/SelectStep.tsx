import { FC } from 'react';
import { OfferingMerge, OfferingState } from 'waldur-js-client';

import { FormGroup } from '@/form';
import FormTable from '@/form/FormTable';
import { translate } from '@/i18n';

import {
  MergeOfferingOption,
  OfferingMergeOfferingSelect,
} from '../OfferingMergeOfferingSelect';
import { getAllowedOfferingTypes } from '../utils';

// An archived target is refused, so it is not offered.
const TARGET_STATES: OfferingState[] = [
  'Draft',
  'Active',
  'Paused',
  'Unavailable',
];

export interface MergeSelection {
  sources: MergeOfferingOption[];
  target: MergeOfferingOption | null;
}

export const getSelectionTypes = (selection: MergeSelection) => [
  ...selection.sources.map((source) => source.type),
  ...(selection.target ? [selection.target.type] : []),
];

interface SelectStepProps {
  merge?: OfferingMerge;
  selection: MergeSelection;
  onChange(selection: MergeSelection): void;
}

export const SelectStep: FC<SelectStepProps> = ({
  merge,
  selection,
  onChange,
}) => {
  if (merge) {
    // Once the record exists its offerings are fixed: the mappings refer to
    // them. Start a new merge to pick others.
    return (
      <div className="d-flex flex-column gap-4">
        <p className="text-muted mb-0">
          {translate(
            'The offerings are fixed once the draft exists. Delete the draft and start a new merge to pick others.',
          )}
        </p>
        <FormTable.Card>
          <FormTable>
            <FormTable.Item
              label={translate('Sources')}
              value={merge.source_offerings
                .map((offering) => offering.name)
                .join(', ')}
            />
            <FormTable.Item
              label={translate('Target')}
              value={merge.target_offering?.name}
            />
          </FormTable>
        </FormTable.Card>
      </div>
    );
  }

  const allowedTypes = getAllowedOfferingTypes(getSelectionTypes(selection));
  // An impossible mix (only reachable through a hand-edited link) leaves
  // the selects unfiltered so the offending offering can be removed.
  const selectableTypes = allowedTypes?.length ? allowedTypes : undefined;
  const sourceUuids = selection.sources.map((source) => source.uuid);

  return (
    <div className="d-flex flex-column gap-4">
      <p className="text-muted mb-0">
        {translate(
          'Resources, orders, usage and history of the sources move to the target; the sources are archived. Basic, Support and site agent offerings merge between themselves; any other type only into an offering of the same type.',
        )}
      </p>
      <FormGroup
        label={translate('Source offerings')}
        description={translate('The offerings to merge away.')}
        required
      >
        <OfferingMergeOfferingSelect
          id="merge-sources"
          isMulti
          value={selection.sources}
          onChange={(value) =>
            onChange({
              ...selection,
              sources: (value as MergeOfferingOption[] | null) ?? [],
            })
          }
          allowedTypes={selectableTypes}
          excludeUuids={selection.target ? [selection.target.uuid] : []}
          placeholder={translate('Select source offerings...')}
        />
      </FormGroup>
      <FormGroup
        label={translate('Target offering')}
        description={translate(
          'The offering that remains. Prepare its plans and components before merging.',
        )}
        required
      >
        <OfferingMergeOfferingSelect
          id="merge-target"
          value={selection.target}
          onChange={(value) =>
            onChange({
              ...selection,
              target: (value as MergeOfferingOption | null) ?? null,
            })
          }
          allowedTypes={selectableTypes}
          states={TARGET_STATES}
          excludeUuids={sourceUuids}
          placeholder={translate('Select target offering...')}
        />
      </FormGroup>
      {allowedTypes && allowedTypes.length === 0 && (
        <p className="text-danger mb-0">
          {translate(
            'These offerings cannot be merged: their types differ and are not Basic, Support or site agent.',
          )}
        </p>
      )}
    </div>
  );
};
