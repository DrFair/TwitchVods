import React, { Component } from 'react';
import { Link } from 'react-router-dom';
// import Searchbar from './NavSearchbar';

class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapseShow: false
    };
    this.setCollapse = this.setCollapse.bind(this);
  }

  setCollapse(show) {
    this.setState({
      collapseShow: show
    });
  }

  render() {
    const { collapseShow } = this.state;
    return (
      <nav className="navbar navbar-expand-lg navbar-light bg-light">
        <div className="container">
          <Link to="/" className="navbar-brand">
            <img src="/favicon.ico" width="30" height="30" className="d-inline-block align-top" alt="" />
            <span> TwitchVods</span>
          </Link>

          <button
            className="navbar-toggler"
            onClick={(e) => {
              this.setState({
                collapseShow: !this.state.collapseShow
              });
            }}
            aria-controls="navbarCollapseContent"
            aria-expanded={this.state.collapseShow ? 'true' : 'false'}
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className={'collapse navbar-collapse' + (collapseShow ? ' show' : '')} id="navbarCollapseContent">
            <ul className="navbar-nav" style={{flexGrow: '1'}}>
              <li className={'nav-item' + (window.location.pathname === '/' ? ' active' : '')}>
                <Link to="/" className="nav-link" onClick={(e) => this.setCollapse(false)}>Home</Link>
              </li>
              <li className={'nav-item' + (window.location.pathname === '/about' ? ' active' : '')}>
                <Link to="/about" className="nav-link" onClick={(e) => this.setCollapse(false)}>About</Link>
              </li>
              {/* <li className="nav-item w-100">
                <Searchbar route={this.props.route} csrfToken={this.props.csrfToken} search="" setCollapse={this.setCollapse} />
              </li> */}
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}

export default Navbar;
