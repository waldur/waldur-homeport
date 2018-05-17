import * as React from 'react';

import './CategoryCard.scss';

export const CategoryCard = props => (
  <div className="category-card">
    <a className="category-thumb">
      <img src={props.category.icon}/>
    </a>
    <div className="category-card-body">
      <h3 className="category-title">
        <a>{props.category.title}</a>
      </h3>
      {props.category.counter} items
    </div>
  </div>
);
