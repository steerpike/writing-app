import React, { Component } from 'react';

class Session extends Component {

    render() {
        let { session } = this.props;
        return (
            <div>
                <h3>Select a writing goal</h3>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(250, 'words')}>250 Words</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(500, 'words')}>500 Words</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(1500, 'words')}>1500 Words</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(3000, 'words')}>3000 Words</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(1, 'minutes')}>1 Minute</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(10, 'minutes')}>10 Minutes</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(30, 'minutes')}>30 Minutes</button>
                <button className="button session-button"
                    onClick={() => this.props.selectSessionGoal(60, 'minutes')}>60 Minutes</button>
                {session && <button className="button session-button" onClick={() => this.props.endSession()}>End Session</button>}
                {session ? <h3>{session.currentTargetValue}</h3> : ''}
                {session && session.completed && <h3>Goal completed</h3>}
            </div>
        );
    }
}

export default Session;
