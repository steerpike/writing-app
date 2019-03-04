import React, { Component } from 'react';
import { auth, googleAuthProvider } from './Services/firebase'

import DocumentList from './Components/DocumentList';
import Auth from './Components/Auth';
import Session from './Components/Session';
import Document from './Components/Document';

import './App.css';

class App extends Component {
  /*
  TODO:
   - Get authenticated user from firebase or default as anonymous - DONE
   - Globally register list of all documents as app state - DONE
   - Register current document as app state - DONE
   - Get all documents found under user's email in local storage - DONE
   - Get all documents found under user's email in remote storage
   - Update any local or remote document that has non-matching last edit timestamps
   - Update the updated list of documents into app state with all found and updated documents
   - Notify user of any failure to sync data
   - Add flash messages to provide feedback to User
  
   - Edit document
   - Each edit of title or content update app[DONE], local[DONE], and remote document state
  */
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      name: 'Anonymous',
      documents: [],
      currentDocument: {
        id: new Date().toISOString(),
        uid: null,
        title: '',
        content: ''
      },
      session: null,
      debug: true
    }
    auth.onAuthStateChanged(function (user) {
      let name = user?user.email:'Anonymous'
      let localData = localStorage[name]?JSON.parse(localStorage[name]):null
      if(localData) {
        this.setState({ ...localData })
      }
      this.setState({ user, name, session:null })
    }.bind(this))
  }
  /* React lifecycle */
  async componentDidUpdate(prevProps) {
    localStorage[this.state.name] = JSON.stringify(this.state);
  }
  componentWillUnmount() {
    this.endSession()
  }
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }
  /* Auth management */
  signIn = () => {
    auth.signInWithPopup(googleAuthProvider)
  }
  signOut = () => {
    auth.signOut()
  }
  showUser = () => {
    console.log(this.state.user)
  }
  /* End Auth management */
  /* Document management */
  changeCurrentDocument = async (id) => {
    var docs = [...this.state.documents];
    let index = docs.findIndex(item => {
      return item['id'] === id;
    });
    this.setState({
      currentDocument: docs[index]
    })
  }
  changeCurrentDocumentTitle = async (newTitle) => {
    let lastEdit = new Date()
    await this.setStateAsync(prevState => ({
      currentDocument: {
        ...prevState.currentDocument,
        title: newTitle,
        lastEdit: lastEdit
      }
    }))
    this.updateDocumentList()
  }
  changeCurrentDocumentContent = async (content) => {
    let lastEdit = new Date()
    await this.setStateAsync(prevState => ({
      currentDocument: {
        ...prevState.currentDocument,
        content: content,
        lastEdit: lastEdit
      }
    }))
    if (this.state.session) {
      this.setState(prevState => ({
        session: {
          ...prevState.session,
          secondsSinceLastEdit: 0,
        }
      }));
    }
    this.updateDocumentList()
  }
  updateDocumentList = async () => {
    var docs = [...this.state.documents];
    let index = docs.findIndex(item => {
      return item['id'] === this.state.currentDocument.id;
    });
    if (index === -1) {
      docs.push(this.state.currentDocument);
    } else {
      docs[index] = this.state.currentDocument
    }
    await this.setStateAsync(prevState => ({
      documents: docs
    }))
  }
  createNewDocument = () => {
    let newDocument = {
      id: new Date().toISOString(),
      uid: null,
      title: '',
      content: ''
    }
    this.setState({ currentDocument: newDocument })
  }
  /* End document management */
  /* Session management */
  selectSessionGoal = (goal, type) => {
    let currentWords = this.state.currentDocument.content.split(" ").length
    this.setState({
      session: {
        target: goal,
        currentTargetValue: 0,
        type:type,
        startTime: new Date(),
        secondsSinceLastEdit: 0,
        startingWordCount: currentWords,
        totalPausedTime: 0,
        completed: false
      }
    })
    this.startSession()
  }
  startSession = () => {
    this.loadInterval = setInterval(() => {
      
      this.setState(prevState => ({
        session: {
          ...prevState.session,
          secondsSinceLastEdit: (this.state.session.secondsSinceLastEdit + 1),
          endTime: new Date()
        }
      }));
      if (this.state.session.type === "minutes") {
        //compare elapsed time vs target time
        if(this.state.session.currentTargetValue <= (this.state.session.target*60)) {
          this.setState(prevState => ({
            session: {
              ...prevState.session,
              currentTargetValue: (this.state.session.currentTargetValue + 1)
            }
          }));
        } else {
          this.setState(prevState => ({
            session: {
              ...prevState.session,
              completed: true
            }
          }));
        }
      }
      if (this.state.session.type === "words") {
        //calc the number of words in the content and compare to target
        let wordCount = this.state.currentDocument.content.split(" ").length
        let sessionWordCount = wordCount - this.state.session.startingWordCount
        this.setState(prevState => ({
          session: {
            ...prevState.session,
            currentTargetValue: sessionWordCount
          }
        }));
        if (sessionWordCount >= this.state.session.target) {
          this.setState(prevState => ({
            session: {
              ...prevState.session,
              completed: true
            }
          }));
        }
      }
      //Check if user is paused typing
      if (this.state.session.secondsSinceLastEdit >= 4) {
        this.setState(prevState => ({
          session: {
            ...prevState.session,
            totalPausedTime: (this.state.session.totalPausedTime + 1)
          }
        }));
      }
    }, 1000)
  }
  endSession = () => {
    this.loadInterval && clearInterval(this.loadInterval);
    this.loadInterval = false;
  }
  /* End Session management */

  render() {

    return (
        <div className="App">
          <header className="App-header">
          <Auth {...this.state} signin={this.signIn} signout={this.signOut} showuser={this.showUser}/>
          </header>
          <main>
          <DocumentList {...this.state} 
            changeCurrentDocument={this.changeCurrentDocument} 
            createNewDocument={this.createNewDocument} />
          <Session {...this.state} 
            selectSessionGoal={this.selectSessionGoal}
            endSession={this.endSession} />
          <Document {...this.state} 
            changeCurrentDocumentTitle={this.changeCurrentDocumentTitle}
            changeCurrentDocumentContent={this.changeCurrentDocumentContent} />
          </main>
        </div>
    );
  }
}

export default App;
