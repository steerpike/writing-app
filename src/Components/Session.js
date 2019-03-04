import React, { Component } from 'react';

class Session extends Component {

    render() {
        let { session } = this.props;
        return (
            <div>
                <h2>Choose a goal for this session</h2>
                {session ? <h3>{session.currentTargetValue}</h3>: ''}
                {session && session.completed && <h3>Goal completed</h3>}
                <button onClick={() => this.props.selectSessionGoal(250, 'words')}>250 Words</button>
                <button onClick={() => this.props.selectSessionGoal(500, 'words')}>500 Words</button>
                <button onClick={() => this.props.selectSessionGoal(1500, 'words')}>1500 Words</button>
                <button onClick={() => this.props.selectSessionGoal(3000, 'words')}>3000 Words</button>
                <button onClick={() => this.props.selectSessionGoal(1, 'minutes')}>1 Minute</button>
                <button onClick={() => this.props.selectSessionGoal(10, 'minutes')}>10 Minutes</button>
                <button onClick={() => this.props.selectSessionGoal(30, 'minutes')}>30 Minutes</button>
                <button onClick={() => this.props.selectSessionGoal(60, 'minutes')}>60 Minutes</button>
                {session && <button onClick={() => this.props.endSession()}>End Session</button>}
            </div>
        );
    }
}

export default Session;