import { FunctionComponent } from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { Section } from '@waldur/marketplace/types';

import { prepareAttributeSections } from '../utils';

import { AttributeFilterSection } from './AttributeFilterSection';

interface AttributeFilterListContainerState {
  sections: Section[];
  loading: boolean;
  loaded: boolean;
}

export const AttributeFilterList: FunctionComponent<AttributeFilterListContainerState> =
  (props) => {
    if (props.loading) {
      return <LoadingSpinner />;
    }

    if (!props.loaded) {
      return (
        <h3 className="text-center">
          {translate('Unable to load category sections.')}
        </h3>
      );
    }

    if (!props.sections.length) {
      return null;
    }

    return (
      <form>
        {prepareAttributeSections(props.sections).map((section, index) => (
          <AttributeFilterSection key={index} section={section} />
        ))}
      </form>
    );
  };
