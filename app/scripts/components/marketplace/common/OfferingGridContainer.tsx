import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { withTranslation } from '@waldur/i18n';
import { TranslateProps } from '@waldur/i18n';
import { getOfferings } from '@waldur/marketplace/common/api';
import { Offering } from '@waldur/marketplace/types';

import { selectFilterQuery } from '../offerings/store/selectors';
import { OfferingGrid } from './OfferingGrid';

interface OfferingGridWrapperState {
  items: Offering[];
  loading: boolean;
  loaded: boolean;
}

interface OfferingGridWrapperProps {
  filterQuery: string;
}

export class OfferingGridWrapper extends React.Component<OfferingGridWrapperProps & TranslateProps, OfferingGridWrapperState> {

  componentDidUpdate(prevProps) {
    if (prevProps.filterQuery !== this.props.filterQuery) {
      this.loadData(this.props.filterQuery);
    }
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData(filterQuery?) {
    const options = {
      params: {
        ...filterQuery,
      },
    };
    try {
      this.setState({
        items: [],
        loading: true,
        loaded: false,
      });
      const offerings = await getOfferings(options);
      this.setState({
        items: offerings,
        loading: false,
        loaded: true,
      });
    } catch {
      this.setState({
        items: [],
        loading: false,
        loaded: false,
      });
    }
  }

  render() {
    return <OfferingGrid {...this.state} width={4}/>;
  }
}

export const formatAttributesFilter = query => {
  if (query) {
    const formattedQuery = {};
    Object.keys(query).forEach(key => {
      const attributeKey = key.split('-')[0];
      if (Object.keys(formattedQuery).indexOf(attributeKey) === -1) {
        formattedQuery[attributeKey] = [query[key]];
      } else {
        formattedQuery[attributeKey].push(query[key]);
      }
    });
    return formattedQuery;
  }
};

const mapStateToProps = state => ({
  filterQuery: {
    name: selectFilterQuery(state),
    attributes: formatAttributesFilter(getFormValues('marketplaceFilter')(state)),
  },
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps),
);

export const OfferingGridContainer = enhance(OfferingGridWrapper);
