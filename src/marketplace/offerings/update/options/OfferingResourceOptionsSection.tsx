import { QuestionIcon } from '@phosphor-icons/react';
import { FC } from 'react';

import { Tooltip } from 'waldur-ui';

import { translate } from '@/i18n';

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
          <Tooltip
            label={translate(
              'If you want user to be able to modify resource options after creation, please configure options for user below',
            )}
          >
            <QuestionIcon size={20} weight="bold" className="text-muted" />
          </Tooltip>
        </>
      }
      verboseName={translate('resource options')}
      offering={props.offering}
      refetch={props.refetch}
    />
  );
};
