import React, { Component } from 'react';

class Auth extends Component {

    render() {
        return (
            <div className="login">
                {
                    this.props.user ? (
                        <button className="button user-button" onClick={this.props.signout}>Logout</button>
                    ) : (
                        <button className="button user-button" onClick={this.props.signin}>
                            Login with Google
                        </button>
                    )
                }
                {
                    this.props.debug ? (<button className="button user-button" onClick={ this.props.showuser }>Show User</button>) : ('')
                }
                <p>Logged in as {this.props.user ? this.props.user.email:'Anonymous'}</p>
            </div>
        );
    }
}

export default Auth;
