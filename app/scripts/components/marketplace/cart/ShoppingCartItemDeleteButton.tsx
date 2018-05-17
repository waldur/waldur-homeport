import * as React from 'react';
import { connect } from 'react-redux';

import { removeItem } from './store/actions';

const PureShoppingCartItemDeleteButton = props => (
  <a className="btn btn-outline btn-success" onClick={props.onClick}>
    <i className="fa fa-times"/>
    {' '}
    Delete
  </a>
);

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    onClick: () => dispatch(removeItem(ownProps.item)),
  };
};

export const ShoppingCartItemDeleteButton = connect(null, mapDispatchToProps)(PureShoppingCartItemDeleteButton);
