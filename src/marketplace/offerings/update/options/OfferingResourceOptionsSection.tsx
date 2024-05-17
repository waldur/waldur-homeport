import { Question } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tip } from '@waldur/core/Tooltip';
import { translate } from '@waldur/i18n';

import { OfferingSectionProps } from '../types';

import { OfferingOptionsSectionPure } from './OfferingOptionsSectionPure';

export const OfferingResourceOptionsSection: FC<OfferingSectionProps> = (
  props,
) => {
  return (
    <OfferingOptionsSectionPure
      type="resource_options"
      title={
        <>
          {translate('Resource options')}{' '}
          <Tip
            id="form-field-tooltip"
            label={translate(
              'If you want user to be able to modify resource options after creation, please configure options for user below',
            )}
            className="mx-2 text-muted"
          >
            <Question size={24} weight="fill" />
          </Tip>
        </>
      }
      offering={props.offering}
      refetch={props.refetch}
      loading={props.loading}
    />
  );
};
