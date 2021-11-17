import { debounce } from 'lodash';
import { Component } from 'react';

import { translate } from '@waldur/i18n';
import { InputField } from '@waldur/marketplace/offerings/service-providers/shared/InputField';

interface ServiceProviderOfferingsQueryFilterProps {
  onQueryChange: (query: string) => void;
}

interface ServiceProviderOfferingsQueryFilterState {
  query: string;
}

export class ServiceProviderOfferingsQueryFilter extends Component<
  ServiceProviderOfferingsQueryFilterProps,
  ServiceProviderOfferingsQueryFilterState
> {
  constructor(props) {
    super(props);
    this.state = {
      query: '',
    };
  }

  setQuery = (event) => {
    this.setState({
      query: event.target.value,
    });
    this.applyQuery();
  };

  applyQuery = debounce(() => {
    this.props.onQueryChange(this.state.query);
  }, 1000);

  render() {
    return (
      <div style={{ width: '288px', padding: '0 16px' }}>
        <InputField
          type="search"
          placeholder={translate('Search for offering by name')}
          value={this.state.query}
          onChange={this.setQuery}
        />
      </div>
    );
  }
}
