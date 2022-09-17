import React, { Component } from 'react';
import PropTypes from 'prop-types';
import SidebarLink from './SidebarLink';
import SidebarClientSearch from './SidebarClientSearch';
import SidebarCategory from './SidebarCategory';

class SidebarContent extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired
  };

  hideSidebar = () => {
    const { onClick } = this.props;
    onClick();
  };

  render() {
    return (
      <div className="sidebar__content">
        <ul className="sidebar__block">
          <SidebarCategory title="Envent Admin" icon="user">
            <SidebarCategory title="Change Client">
              <SidebarClientSearch />
            </SidebarCategory>
            <SidebarCategory title="Manage Clients">
              <SidebarLink title="View Clients" route="/view-clients" />
              <SidebarLink title="New Client" route="/new-client" />
            </SidebarCategory>
          </SidebarCategory>
        </ul>
        <ul className="sidebar__block">
          <SidebarCategory title="Account" icon="user">
            <SidebarLink title="Log In" route="/login" />
            <SidebarLink title="Register" route="/register" />
          </SidebarCategory>
        </ul>
        <ul className="sidebar__block">
          <SidebarCategory title="Wayfinder" icon="map">
            <SidebarLink title="Maps" route="/wayfinder/maps" />
            <SidebarLink title="Tenants" route="/wayfinder/tenants" />
            <SidebarLink title="Categories" route="/wayfinder/categories" />
          </SidebarCategory>
          <SidebarCategory title="Advertising" icon="film-play">
            <SidebarLink title="View" route="/advertising/view" />
            <SidebarLink title="Create" route="/advertising/create" />
            <SidebarLink
              title="Pending Approval"
              route="/advertising/pending"
            />
          </SidebarCategory>
        </ul>
        <ul className="sidebar__block">
          <SidebarCategory title="Billing" icon="store">
            <SidebarLink title="New Invoices" route="/maps" />
            <SidebarLink title="Paid Invoices" route="/maps" />
          </SidebarCategory>
          <SidebarCategory title="Support" icon="bug">
            <SidebarLink title="Create Ticket" route="/view-ads" />
            <SidebarLink title="View Tickets" route="/create-ads" />
          </SidebarCategory>
        </ul>
        <ul className="sidebar__block">
          <SidebarLink title="Log Out" icon="exit" route="/login" />
        </ul>
      </div>
    );
  }
}

export default SidebarContent;
