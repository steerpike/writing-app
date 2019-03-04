import React, { Component } from 'react';

class Auth extends Component {

    render() {
        return (
            <header className="login">
                {
                    this.props.user ? (
                        <button onClick={this.props.signout}>Logout</button>
                    ) : (
                        <button onClick={this.props.signin}>
                            Signup/Login
                        </button>
                    )
                }
                {
                    this.props.debug ? (<button onClick={ this.props.showuser }>Show User</button>) : ('')
                }
                <p>Logged in as {this.props.user ? this.props.user.email:'Anonymous'}</p>
            </header>
        );
    }
}

export default Auth;
