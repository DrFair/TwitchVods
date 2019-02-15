import React, { Component } from 'react';

class Searchbar extends Component {
  constructor(props) {
    super(props);
    this.input = React.createRef();
    this.clearSearch = this.clearSearch.bind(this);
    this.searchSubmit = this.searchSubmit.bind(this);
  }

  clearSearch() {
    this.input.current.value = '';
  }

  searchSubmit(event) {
    event.preventDefault();
    const { value } = this.input.current;
    if (value.length > 0) {
      this.props.route.history.push('/' + value);
      this.clearSearch();
      this.props.setCollapse(false);
    }
  }

  render() {
    return (
      <form className="form-inline">
        <input
          ref={this.input}
          className="form-control"
          style={{flexGrow: '1'}}
          type="search"
          placeholder="Channel or VOD ID"
          autoCorrect="off"
          autofill="off"
          autoComplete="off"
          spellCheck="false"
          defaultValue=""
        />
        <button type="submit" className="btn btn-primary mx-1 mr-4" onClick={this.searchSubmit}>Search</button>
      </form>
    );
  }
}

export default Searchbar;
