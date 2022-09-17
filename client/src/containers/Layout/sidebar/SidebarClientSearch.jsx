import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SearchIcon from 'mdi-react/SearchIcon';
import CloseIcon from 'mdi-react/CloseIcon';
import classNames from 'classnames';

export default class SidebarClientSearch extends Component {
  static defaultProps = {
    icon: '',
    isNew: false
  };

  constructor() {
    super();

    this.state = {
      collapse: false
    };

    this.state = {
      recentClients: [
        'AMP Pacfair',
        'AMP Macquarie',
        'Harbourntown Gold Coast'
      ],
      allClients: [
        'AMP Pacfair',
        'AMP Macquarie',
        'Harbourntown Gold Coast',
        'test'
      ]
    };
  }

  render() {
    return (
      <div>
        <ClientSearch
          allClients={this.state.allClients}
          recentClients={this.state.recentClients}
        />
      </div>
    );
  }
}

class ClientSearch extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filtered: []
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentDidMount() {
    this.setState({
      filtered: this.props.recentClients
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      filtered: nextProps.recentClients
    });
  }

  handleChange(e) {
    // Variable to hold the original version of the list
    let currentList = [];
    // Variable to hold the filtered list before putting into state
    let newList = [];

    // If the search bar isn't empty
    if (e.target.value !== '') {
      // Assign the original list to currentList
      currentList = this.props.allClients;

      newList = currentList.filter(allClients => {
        // change current item to lowercase
        const lc = allClients.toLowerCase();
        const filter = e.target.value.toLowerCase();
        return lc.includes(filter);
      });
    } else {
      newList = this.props.recentClients;
    }

    // Set the filtered state based on what our rules added to newList
    this.setState({
      filtered: newList
    });
  }

  render() {
    return (
      <div className="sidebar__clientsearch">
        <input
          type="text"
          className="sidebar__link"
          onChange={this.handleChange}
          placeholder="Search..."
        />
        {this.state.filtered.map(clients => (
          <SidebarLink title={clients} route="/new" />
        ))}
      </div>
    );
  }
}
