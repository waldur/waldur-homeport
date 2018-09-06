import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';
import { getFormValues } from 'redux-form';

import { $state } from '@waldur/core/services';
import { withTranslation } from '@waldur/i18n';
import { TranslateProps } from '@waldur/i18n';
import { getOfferings } from '@waldur/marketplace/common/api';
import { FilterQuery } from '@waldur/marketplace/offerings/types';
import { Offering } from '@waldur/marketplace/types';

import { selectFilterQuery } from '../offerings/store/selectors';
import { OfferingGrid } from './OfferingGrid';

interface OfferingGridWrapperState {
  items: Offering[];
  loading: boolean;
  loaded: boolean;
}

interface OfferingGridWrapperProps {
  filterQuery: FilterQuery;
}

export class OfferingGridWrapper extends React.Component<OfferingGridWrapperProps & TranslateProps, OfferingGridWrapperState> {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
      loading: true,
      loaded: false,
    };
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.items.length !== this.state.items.length
        || prevProps.filterQuery !== this.props.filterQuery) {
      this.loadData(this.props.filterQuery);
    }
  }

  componentDidMount() {
    this.loadData();
  }

  async loadData(filterQuery?) {
    const options = {
      params: {
        category_uuid: $state.params.category_uuid,
        ...filterQuery,
      },
    };
    try {
      this.setState({
        loading: true,
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
      const attributeType = key.split('-')[0];
      const attributeKey = key.split('-')[1];
      const queryKey = query[key];
      if (attributeType === 'list') {
        if (Object.keys(formattedQuery).indexOf(attributeKey) === -1) {
          formattedQuery[attributeKey] = [queryKey];
        } else {
          formattedQuery[attributeKey].push(queryKey);
        }
      } else if (attributeType === 'boolean') {
        formattedQuery[attributeKey] = JSON.parse(queryKey);
      } else {
        formattedQuery[attributeKey] = queryKey;
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
