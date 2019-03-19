import React, { Component } from 'react';

class DocumentList extends Component {

    render() {
        const documents = this.props.documents.map((doc, key) =>
            <li className="m-2 flex justify-between"
                key={key}> 
                <button 
                    onClick={() => this.props.changeCurrentDocument(doc.id) }>{doc.title}</button>
                <button
                    className="button my-0 bg-white text-red-darkest border-red-light hover:bg-red-lightest" 
                    onClick={() => this.props.deleteDocument(doc.id)}>X</button>
            </li>
        )
        return (
            <div>
                <h2>List of documents for {this.props.name}</h2>
                <ul>
                {documents}
                </ul>
                <button className="button document-button" onClick={() => this.props.createNewDocument()}>Add New Document</button>
            </div>
        );
    }
}

export default DocumentList;
