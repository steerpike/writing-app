import React, { Component } from 'react'

import ReactQuill from 'react-quill';

import 'react-quill/dist/quill.core.css'; // ES6
import 'react-quill/dist/quill.bubble.css'; // ES6

class Document extends Component {
    changeTitle = (event) => {
        let newTitle = event.target.value
        this.props.changeCurrentDocumentTitle(newTitle)
    }
    changeContent = (content) => {
        this.props.changeCurrentDocumentContent(content)
    }
    render() {
        let { currentDocument } = this.props;
        return (
            <div className="editorContainer">
                <h2>
                    {currentDocument ? <input type="text" 
                        className="border border-grey-light my-5"
                        value={this.props.currentDocument.title} 
                        onChange={this.changeTitle}
                         /> : null}
                </h2>
                {currentDocument ?
                <ReactQuill
                    className="border border-grey-light reactQuill"
                    theme="bubble"
                    value={this.props.currentDocument.content}
                    onChange={this.changeContent}
                /> : null }
            </div>
        )
    }
}

export default Document