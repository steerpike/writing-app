import React, { Component } from 'react';

class DocumentList extends Component {

    render() {
        const documents = this.props.documents.map((doc, key) =>
            <li key={key} onClick={() => this.props.changeCurrentDocument(doc.id) }>{doc.title}</li>
        )
        return (
            <div>
                <h2>List of documents for {this.props.name}</h2>
                <ul>
                {documents}
                </ul>
                <button onClick={() => this.props.createNewDocument()}>Add New Document</button>
            </div>
        );
    }
}

export default DocumentList;
