import React, { Component } from 'react';
import './TimeByVOD.css';

class TimeByVOD extends Component {
  constructor(props) {
    super(props);
    this.state = {
      result: null
    };
    this.input = React.createRef();
    this.submit = this.submit.bind(this);
  }

  submit(event) {
    event.preventDefault();
    const { value } = this.input.current;
    if (value.length > 0) {
      const reg = /^https?:\/\/(www.)?twitch.tv\/videos\/\d+(\?t=(\d+h)?(\d+m)?(\d+s)?)?$/i
      if (reg.test(value)) {
        const timeReg = /t=(\d+h)?(\d+m)?(\d+s)?$/i
        const timeMatch = value.match(timeReg);
        let finalSecs;
        if (timeMatch != null && timeMatch.length > 0) {
          const timeStr = timeMatch[0];
          const hours = this.parseNum(timeStr, /\d+h/i);
          const mins = this.parseNum(timeStr, /\d+m/i);
          const secs = this.parseNum(timeStr, /\d+s/i);
          finalSecs = (hours * 60 + mins) * 60 + secs;
        } else {
          finalSecs = 0;
        }
        const idReg = /videos\/(\d+)/i
        const idMatch = value.match(idReg);
        this.setState({
          result: <p>...</p>
        });
        fetch('/time?csrfToken=' + this.props.csrfToken + '&id=' + idMatch[1] + '&secs=' + finalSecs, {
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
            let result = (
              <table className="details">
                <tbody>
                  <tr>
                    <td>Channel:</td>
                    <td>{data.result.channel}</td>
                  </tr>
                  <tr>
                    <td>Video title:</td>
                    <td>{data.result.title}</td>
                  </tr>
                  <tr>
                    <td>Start time:</td>
                    <td>{new Date(data.result.start_time).toString()}<br />ISO: {data.result.start_time}</td>
                  </tr>
                  <tr>
                    <td>Seconds in:</td>
                    <td>{data.result.seconds_in}</td>
                  </tr>
                  <tr>
                    <td>URL time:</td>
                    <td>{new Date(data.result.final_time).toString()}<br />ISO: {data.result.final_time}</td>
                  </tr>
                  {data.result.note ? (
                    <tr>
                      <td>Note:</td>
                      <td>{data.result.note}</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            );
            this.setState({
              result: result
            });
          }
        }).catch((err) => {
          this.setState({
            result: <p style={{ color: '#A55', fontWeight: 'bold' }}>Unknown error requesting time</p>
          });
        });
      } else {
        this.setState({
          result: <p style={{ color: '#A55', fontWeight: 'bold' }}>Invalid Twitch video link</p>
        });
      }
    }
  }

  parseNum(str, reg) {
    const match = str.match(reg);
    if (match != null) {
      const numMatch = match[0].match(/(\d)+/);
      if (numMatch != null && numMatch.length > 1) {
        return parseInt(numMatch[1]);
      }
      return 0;
    }
    return 0;
  }

  render() {
    const { result } = this.state;
    return (
      <>
        <h3 className="text-center page-header mt-4">Get time by VOD</h3>
        <form>
          <div className="form-group">
            <label className="mb-0"><strong>Twitch VOD link</strong></label>
            <small className="form-text text-muted mt-0 mb-1">
              In Twitch VOD: Press settings -> Copy Video URL at
            </small>
            <input
              ref={this.input}
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
              Example: https://www.twitch.tv/videos/327720797?t=34m20s
            </small>
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.submit}>Get time</button>
          {result}
        </form>
      </>
    );
  }

}

export default TimeByVOD;
