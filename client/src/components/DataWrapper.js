import React, { Component } from 'react';

class DataWrapper extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      data : null
    };
    this.requestData = this.requestData.bind(this);
  }

  componentDidMount() {
    this.requestData();
  }

  requestData() {
    this.setState({
      loading: true,
      data: null
    });
    const { id } = this.props;
    fetch('/get/' + id + "?csrfToken=" + this.props.csrfToken, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      return res.json();
    }).then((data) => {
      console.log(data);
      this.setState({
        loading: false,
        data: data
      });
    }).catch((err) => {
      this.setState({
        loading: false,
        data: {
          success: false,
          error: 'Error parsing server response'
        }
      });
    });
  }

  render() {
    const { loading, data } = this.state;
    if (loading) return <p>...</p>
    if (data == null) return null;
    if (data.success) {
      return <>
        <p>{JSON.stringify(data)}</p>
      </>;
    } else {
      if (data.error) {
        return <p>{data.error}</p>
      } else {
        return <p>Unknown error</p>
      }
    }
  }
}

export default DataWrapper;
