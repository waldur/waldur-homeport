import debounce from 'lodash.debounce';
import * as React from 'react';

import { TranslateProps } from '@waldur/i18n/types';

import './TableQuery.scss';

interface Props extends TranslateProps {
  query: string;
  setQuery: (query: string) => void;
}

interface State {
  query: string;
}

class TableQuery extends React.Component<Props, State> {
  state = {query: ''};

  setQuery = event => {
    this.setState({
      query: event.target.value,
    });
    this.applyQuery();
  }

  applyQuery = debounce(() => {
    this.props.setQuery(this.state.query);
  }, 1000);

  render() {
    return (
      <div className="pull-right text-right table-query">
        <label>{this.props.translate('Search')}
          <input
            type="search"
            className="form-control input-sm"
            value={this.state.query}
            onChange={this.setQuery}/>
        </label>
      </div>
    );
  }
}

export default TableQuery;
