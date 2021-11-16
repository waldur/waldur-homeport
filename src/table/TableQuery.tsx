import { debounce } from 'lodash';
import { Component } from 'react';

import { translate } from '@waldur/i18n';

import './TableQuery.scss';

interface TableQueryProps {
  query: string;
  setQuery: (query: string) => void;
}

interface State {
  query: string;
}

export class TableQuery extends Component<TableQueryProps, State> {
  constructor(props) {
    super(props);
    this.state = { query: props.query || '' };
  }

  setQuery = (event) => {
    this.setState({
      query: event.target.value,
    });
    this.applyQuery();
  };

  applyQuery = debounce(() => {
    this.props.setQuery(this.state.query);
  }, 1000);

  render() {
    return (
      <div className="pull-right text-right table-query">
        <label>
          {translate('Search')}
          <input
            type="search"
            className="form-control input-sm"
            value={this.state.query}
            onChange={this.setQuery}
          />
        </label>
      </div>
    );
  }
}
