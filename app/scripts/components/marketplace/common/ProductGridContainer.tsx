import * as React from 'react';
import { connect } from 'react-redux';
import { compose } from 'redux';

import { withTranslation } from '@waldur/i18n';
import { TranslateProps } from '@waldur/i18n';
import { getProducts } from '@waldur/marketplace/common/api';
import { Product } from '@waldur/marketplace/types';

import { selectFilterQuery } from '../offerings/store/selectors';
import { ProductGrid } from './ProductGrid';

interface ProductGridWrapperState {
  items: Product[];
  loading: boolean;
  loaded: boolean;
}

interface ProductGridWrapperProps {
  filterQuery: string;
}

export class ProductGridWrapper extends React.Component<ProductGridWrapperProps & TranslateProps, ProductGridWrapperState> {

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
        name: filterQuery,
      },
    };
    try {
      this.setState({
        items: [],
        loading: true,
        loaded: false,
      });
      const products = await getProducts(options);
      this.setState({
        items: products,
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
    return <ProductGrid {...this.state} width={4}/>;
  }
}

const mapStateToProps = state => ({
  filterQuery: selectFilterQuery(state),
});

const enhance = compose(
  withTranslation,
  connect(mapStateToProps),
);

export const ProductGridContainer = enhance(ProductGridWrapper);
