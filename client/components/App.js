import React, { Component } from 'react';
import NavBar from './NavBar.js';
import LoginPanel from './LoginPanel.js';
import QueryForm from './QueryForm.js';
import QueryResults from './QueryResults.js';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: null,
      result: null
    };
  }

  componentDidMount() {
    fetch('/auth/whoami', {
      method: 'get',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((response) => {
        if (response.ok) {
          response.json().then((json) => {
            this.setState({ user: json });
          });
        } else if (response.status !== 401) {
          console.error('Failed to retrieve logged user.', JSON.stringify(response));
        }
      })
      .catch((error) => {
        console.error('Error occurred while fetching logged in user.', error);
      });
  }

  handleQueryExecution = (data) => {
    const queryUrl = '/query?q=' + encodeURI(data.query);
    fetch(queryUrl, {
      headers: {
        Accept: 'application/json'
      },
      cache: 'no-store'
    })
      .then((response) => {
        response.json().then((json) => {
          if (response.ok) {
            this.setState({ result: JSON.stringify(json, null, 2) });
          } else {
            this.setState({
              result: 'Failed to retrieve query result.'
            });
          }
        });
      })
      .catch((error) => {
        console.error('Error occurred while executing query.', error);
      });
  };

  render() {
    const { user, result } = this.state;
    return (
      <div>
        <NavBar user={user} />
        {!user ? (
          <LoginPanel />
        ) : (
          <div className="slds-m-around--xx-large">
            <QueryForm onExecuteQuery={this.handleQueryExecution} />
            {result && <QueryResults result={result} />}
          </div>
        )}
      </div>
    );
  }
}
