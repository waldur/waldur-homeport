import * as React from 'react';

import { LoadingSpinner } from '@waldur/core/LoadingSpinner';
import { translate } from '@waldur/i18n';
import { ComparisonSection } from '@waldur/marketplace/compare/ComparisonSection';
import { Offering, Section } from '@waldur/marketplace/types';

import * as api from '../common/api';

interface ComparisonSectionsProps {
  items: Offering[];
}

interface ComparisonSectionsState {
  sections: Section[];
  loading: boolean;
  loaded: boolean;
  categoryUuid: string;
}

export class ComparisonSections extends React.Component<
  ComparisonSectionsProps,
  ComparisonSectionsState
> {
  state = {
    sections: [],
    loading: true,
    loaded: false,
    categoryUuid: '',
  };

  componentDidMount() {
    this.loadData();
  }

  async loadData() {
    try {
      // a temporary workaround to get the category before support for multiple categories is enabled.
      const categoryUuid = this.props.items[0].category_uuid;
      this.setState({
        categoryUuid,
      });
      const category = await api.getCategory(categoryUuid);
      this.setState({
        sections: category.sections,
        loading: false,
        loaded: true,
      });
    } catch (error) {
      this.setState({
        sections: [],
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    if (!this.state.categoryUuid || !this.props.items.length) {
      return null;
    }

    if (this.state.loading) {
      return (
        <tr>
          <td>
            <LoadingSpinner />
          </td>
        </tr>
      );
    }

    if (!this.state.loaded) {
      return (
        <h3 className="text-center">
          {translate('Unable to load sections for comparison.')}
        </h3>
      );
    }

    if (!this.state.sections.length) {
      return (
        <h3 className="text-center">
          {translate('There are no sections for comparison yet.')}
        </h3>
      );
    }

    return this.state.sections.map((section, index) => (
      <ComparisonSection
        key={index}
        section={section}
        items={this.props.items}
      />
    ));
  }
}
