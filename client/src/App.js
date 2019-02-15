import React, { Component } from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import Navbar from './components/NavBar';
import TimeByVOD from './components/TimeByVOD';
import VODByTime from './components/VODByTime';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loadingCSRF: true
    };
    this.getCSRF = this.getCSRF.bind(this);
  }

  // Get csrf on first mount
  componentDidMount() {
    this.getCSRF();
  }

  getCSRF() {
    fetch('/gettoken', {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      if (res.status === 200) { // Success
        // console.log('Got CSRF Token!');
        res.json().then((data) => {
          this.setState({
            loadingCSRF: false,
            csrfToken: data.token
          });
          this.setState(data);
        }).catch((err) => {
          this.setState({
            loadingCSRF: false
          });
        });
      } else {
        this.setState({
          loadingCSRF: false
        });
        console.log('Failed CSRF token:', res);
      }
    }).catch((err) => {
      this.setState({
        loadingCSRF: false
      });
      console.log('Error CSRF token:', err);
    });
  }

  render() {
    // Wait for loading complete
    if (this.state.loadingCSRF) return null;
    const props = {
      csrfToken: this.state.csrfToken
    }
    return (
      <Router>
        <div>
          <Route path="/" render={(route) => (
            <Navbar route={route} {...props} />
          )} />
          <div className="container" style={{ marginBottom: 50 }}>
            <Switch>
              <Route exact path="/" render={(route) => (
                <>
                  {/* <div className="row justify-content-center">
                    <div className="col-md-6">
                      <h3 className="text-center page-header">Home</h3>
                      <p className="text-center">Nothing here at the moment</p>
                    </div>
                  </div> */}
                  <div className="row justify-content-center">
                    <div className="col-md-8 col-sm-10">
                      <TimeByVOD route={route} {...props} />
                      <div className="row-divider" />
                    </div>
                  </div>
                  <div className="row justify-content-center">
                    <div className="col-md-8 col-sm-10">
                      <VODByTime route={route} {...props} />
                    </div>
                  </div>
                </>
              )} />
              {/* Illegal paths */}
              {/* <Route exact path="/get" component={Route404} />
              <Route exact path="/gettoken" component={Route404} />

              <Route exact path="/:id" render={(route) => (
                <DataWrapper id={route.match.params.id} {...props} />
              )} /> */}

              <Route component={Route404} />
            </Switch>
          </div>
        </div>
      </Router>
    );
  }
}

function Route404() {
  return (
    <div className="row justify-content-center">
      <div className="col-md-6">
        <h3 className="text-center page-header">Page not found</h3>
        <p className="text-center">
          Looks like you got off-track.
          <br/>
          <Link to="/">Go to home page</Link>
        </p>
      </div>
    </div>
  )
}

export default App;
