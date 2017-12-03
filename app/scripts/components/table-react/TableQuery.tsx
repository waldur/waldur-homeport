import * as React from 'react';
import debounce from 'lodash.debounce';
import { TranslateProps } from '@waldur/i18n/types';
import './TableQuery.scss';

type Props = TranslateProps & {
  query: string,
  setQuery: (query: string) => void,
};

type State = {
  query: string;
};

class TableQuery extends React.Component<Props, State> {
  state = {query: ''};

  setQuery = event => {
    this.setState({
      query: event.target.value
    });
    this.applyQuery()
  };

  applyQuery = debounce(() => {
    this.props.setQuery(this.state.query);
  }, 1000);

  render() {
    return (
      <div className='text-right table-query'>
        <label>{this.props.translate('Search')}
          <input
            type='search'
            className='form-control input-sm'
            value={this.state.query}
            onChange={this.setQuery}/>
        </label>
      </div>
    );
  }
}

export default TableQuery;
