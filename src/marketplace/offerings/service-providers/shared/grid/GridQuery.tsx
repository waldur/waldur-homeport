import debounce from 'lodash.debounce';
import { Component } from 'react';

import './GridQuery.scss';
import { InputField } from '@waldur/marketplace/offerings/service-providers/shared/InputField';

interface GridQueryProps {
  placeholder?: string;
  query: string;
  setQuery: (query: string) => void;
}

interface State {
  query: string;
}

export class GridQuery extends Component<GridQueryProps, State> {
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
      <div className="text-right gridQuery">
        <InputField
          type="search"
          placeholder={this.props.placeholder}
          value={this.state.query}
          onChange={this.setQuery}
        />
      </div>
    );
  }
}
