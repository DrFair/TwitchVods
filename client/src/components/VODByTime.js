import React, { Component } from 'react';
import './VODByTime.css';

class VODByTime extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null
    };
    this.channelInput = React.createRef();
    this.timeInput = React.createRef();
    this.dateSelect = React.createRef();
    this.timeSelect = React.createRef();

    this.submit = this.submit.bind(this);
    this.timeChange = this.timeChange.bind(this);
    this.selectChange = this.selectChange.bind(this);
  }

  submit(event) {
    event.preventDefault();
    this.setState({
      result: <p>...</p>
    });
    const channel = this.channelInput.current.value;
    const time = Date.parse(this.timeInput.current.value);
    if (isNaN(time)) {
      return this.setState({
        result: <p style={{ color: '#A55', fontWeight: 'bold' }}>ISO time input incorrect format</p>
      });
    }
    if (channel.length === 0) {
      return this.setState({
        result: <p style={{ color: '#A55', fontWeight: 'bold' }}>Missing channel name</p>
      });
    }
    fetch(`/vod?csrfToken=${this.props.csrfToken}&channel=${channel}&date=${new Date(time).toISOString()}`, {
      method: 'GET',
      credentials: 'include'
    }).then((res) => {
      return res.json();
    }).then((data) => {
      // console.log(data);
      if (data.error) {
        this.setState({
          result: <p style={{ color: '#A55', fontWeight: 'bold' }}>{data.error}</p>
        });
      } else {
        data = data.result;
        let result;
        if (data.vod) {
          const url = data.vod.url + '?t=' + data.vod.seconds_in + 's';
          result = (
            <table className="details">
              <tbody>
                <tr>
                  <td>Channel:</td>
                  <td>{data.channel}</td>
                </tr>
                <tr>
                  <td>Title:</td>
                  <td>{data.vod.title}</td>
                </tr>
                <tr>
                  <td>Start time:</td>
                  <td>{new Date(data.vod.start_time).toString()}<br />ISO: {data.vod.start_time}</td>
                </tr>
                <tr>
                  <td>Seconds in:</td>
                  <td>{data.vod.seconds_in}</td>
                </tr>
                <tr>
                  <td>Link to vod at time:</td>
                  <td><a target="_blank" rel="noopener noreferrer" href={url}>{url}</a></td>
                </tr>
              </tbody>
            </table>
          );
        } else {
          result = <p style={{ color: '#A55', fontWeight: 'bold' }}>Could not find VOD from {data.channel} at {data.time}</p>
        }
        this.setState({
          result: result
        });
      }
    }).catch((err) => {
      this.setState({
        result: <p style={{ color: '#A55', fontWeight: 'bold' }}>Unknown error requesting vod</p>
      });
    });
  }

  timeChange(event) {
    // TODO: Change this.dateSelect and this.timeSelect to match time
  }

  selectChange(event) {
    let iso = null;
    if (this.dateSelect.current.value) {
      iso = this.dateSelect.current.value;
      if (this.timeSelect.current.value) {
        iso += 'T' + this.timeSelect.current.value + ":00";
      } else {
        iso += 'T00:00:00';
      }
    }
    if (iso !== null) {
      const date = new Date(iso);
      this.timeInput.current.value = date.toISOString();
    }
    // console.log(this.dateSelect.current.value);
    // console.log(this.timeSelect.current.value);
  }

  render() {
    const timezoneMatch = new Date().toString().match(/\(([\w\d ]+)\)$/);
    let localTimeExtra = '';
    if (timezoneMatch != null && timezoneMatch.length > 1) {
      localTimeExtra = ', ' + timezoneMatch[1];
      // localTimeExtra = `, ${timezoneMatch[1]}`;
    }
    const { result } = this.state;
    return (
      <>
        <h3 className="text-center page-header mt-4">Find VOD by time</h3>
        <form>
          <div className="form-group">
            <label><strong>Channel name</strong></label>
            <input
              ref={this.channelInput}
              type="text"
              className="form-control"
              autoCorrect="off"
              autofill="off"
              autoComplete="off"
              spellCheck="false"
              defaultValue=""
              placeholder=""
            />
            <small className="form-text text-muted">
              Example: twitch
            </small>
          </div>
          <div className="form-group">
            <label><strong>Pick time (Local time{localTimeExtra})</strong></label>
            <div className="input-group">
              <input
                ref={this.dateSelect}
                type="date"
                className="form-control"
                onChange={this.selectChange}
              />
              <input
                ref={this.timeSelect}
                type="time"
                className="form-control"
                onChange={this.selectChange}
              />
            </div>
          </div>
          <div className="form-group">
            <label><strong>ISO Time (UTC time)</strong></label>
            <input
              ref={this.timeInput}
              type="text"
              className="form-control"
              autoCorrect="off"
              autofill="off"
              autoComplete="off"
              spellCheck="false"
              defaultValue=""
              placeholder=""
            />
            <small className="form-text text-muted">
              Example: 2019-02-15T15:09:39Z
            </small>
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.submit}>Find VOD</button>
          {result}
        </form>
      </>
    );
  }

}

export default VODByTime;
