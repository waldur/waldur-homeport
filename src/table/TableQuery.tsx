import { debounce } from 'lodash';
import { Component } from 'react';
import { Button, FormControl, FormGroup, InputGroup } from 'react-bootstrap';

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
      <FormGroup className="pull-right text-right table-query">
        <InputGroup>
          <FormControl
            type="search"
            placeholder={translate('Search') + ' ...'}
            value={this.state.query}
            onChange={this.setQuery}
          />
          <Button size="sm">
            <i className="fa fa-search" />
          </Button>
        </InputGroup>
      </FormGroup>
    );
  }
}
