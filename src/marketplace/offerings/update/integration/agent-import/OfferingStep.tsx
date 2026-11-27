import { FC, useMemo } from 'react';

import { AlertItem, Badge, Code, FormText, RadioGroup } from 'waldur-ui';

import { translate } from '@/i18n';
import { renderFieldOrDash } from '@/table/utils';

import { AgentConfigurationBlock } from './api';

interface OfferingStepProps {
  blocks: AgentConfigurationBlock[];
  selectedIndex: number | undefined;
  /** The server's request to choose a block, as it named them. */
  notices: string[];
  errors: string[];
  disabled: boolean;
  onSelect(index: number): void;
}

export const OfferingStep: FC<OfferingStepProps> = ({
  blocks,
  selectedIndex,
  notices,
  errors,
  disabled,
  onSelect,
}) => {
  const options = useMemo(
    () =>
      blocks.map((block) => ({
        value: block.index,
        label: (
          <span className="inline-flex flex-wrap items-center gap-2">
            {block.name}
            {block.matches_offering ? (
              <Badge variant="success" data-testid="matches-offering">
                {translate('Matches this offering')}
              </Badge>
            ) : null}
          </span>
        ),
        description: (
          <Code>{renderFieldOrDash(block.waldur_offering_uuid)}</Code>
        ),
      })),
    [blocks],
  );

  return (
    <>
      {notices.map((notice) => (
        <AlertItem
          key={notice}
          type="floating"
          variant="info"
          className="mb-4"
          title={notice}
        />
      ))}
      {blocks.length ? (
        <RadioGroup<number>
          label={translate('Offering to import')}
          description={translate(
            'The file configures several offerings. Choose the one to import into this offering.',
          )}
          options={options}
          value={selectedIndex}
          onValueChange={onSelect}
          disabled={disabled}
        />
      ) : (
        <p className="text-secondary">
          {translate('No offerings were found in the file.')}
        </p>
      )}
      {errors.map((error) => (
        <FormText key={error} variant="danger">
          {error}
        </FormText>
      ))}
    </>
  );
};
