import React, { Component } from 'react';
import { db, auth, googleAuthProvider } from './Services/firebase'
import swal from 'sweetalert';
import { NotificationContainer, NotificationManager } from 'react-notifications'
import 'react-notifications/lib/notifications.css';



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
   - Get all documents found under user's email in remote storage - DONE
   - Update any local or remote document that has non-matching last edit timestamps - DONE
   - Update the updated list of documents into app state with all found and updated documents - DONE
   - Notify user of any failure to sync data
   - Add flash messages to provide feedback to User
  
   - Edit document
   - Each edit of title or content update app[DONE], local[DONE], and remote document state[DONE]
  */
  constructor(props) {
    super(props)
    this.state = {
      user: null,
      name: 'Anonymous',
      documents: [],
      currentDocument: this.newDoc(),
      session: null,
      debug: true,
      showChrome: true,
      lastContent: '',
      lastTitle: ''
    }
    auth.onAuthStateChanged(function (user) {
      let name = user?user.email:'Anonymous'
      let localData = localStorage[name]?JSON.parse(localStorage[name]):null
      this.setStateAsync({ documents: [], currentDocument: this.newDoc() })
      if(localData) {
        this.setState({ ...localData })
      }
      //Get remote payload from firestore
      // - User, name, debug
      // - Document list
      // - Current document from document list
      this.setState({ user, name, session:null })
      this.getRemoteDocumentList(name)
    }.bind(this))
    this.onUnload = this.onUnload.bind(this)
    this.toggleChrome = this.toggleChrome.bind(this);
  }
  /* React lifecycle */
  async componentDidUpdate(prevProps) {
    if(this.state.documents.length) {
      localStorage[this.state.name] = JSON.stringify(this.state);
    }
  }
  componentDidMount() {
    window.addEventListener("beforeunload", this.onUnload)
  }
  componentWillUnmount() {
    this.loadSave && clearInterval(this.loadSave);
    this.loadSave = false;
    this.endSession()
    window.removeEventListener("beforeunload", this.onUnload)
  }
  setStateAsync(state) {
    return new Promise((resolve) => {
      this.setState(state, resolve)
    });
  }
  onUnload(event) {
    this.saveRemotePayload()
    this.saveRemoteDocumentList()
  }
  /* Display management */
  toggleChrome(e) {
    this.setState({
      showChrome: !this.state.showChrome
    })
    console.log('toggle', this.state.showChrome)
    e.stopPropagation();
  }
  closeChrome(e) {
    this.setState({
      showChrome: false
    })
    console.log('close', this.state.showChrome)
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
    NotificationManager.info(this.state.user.displayName + ' '+this.state.user.email);
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
    if(this.state.showChrome) {
      this.closeChrome()
    }
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
    if (this.state.showChrome) {
      this.closeChrome()
    }
  }
  updateDocumentList = async () => {
    console.log('update document list')
    if (this.state.currentDocument && 
      (this.state.currentDocument.title !== '' ||
      (this.state.currentDocument.content !== '' &&
      this.state.currentDocument.content !== '<p><br></p>'))) //TODO: Clean this up
      {
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
  }
  createNewDocument = () => {
    let newDocument = this.newDoc()
    this.setState({ currentDocument: newDocument })
  }
  newDoc = () => {
    let reference = db.collection('documents').doc()
    let uid = reference.id
    let newDocument = {
      id: new Date().toISOString(),
      uid: uid,
      title: '',
      content: ''
    }
    return newDocument
  }
  saveRemotePayload = async () => {
    let user = {
      name: this.state.name,
      debug: this.state.debug,
      currentDocumentUID: this.state.currentDocument.uid
    }
    
    const userConnection = db.collection('users').doc(user.name)
    userConnection.set({
      user
    })
    let session = this.state.session
    if(session) {
      const sessionConnection = db.collection('sessions').doc(session.uid)
      sessionConnection.set({
        session
      })
    }
    
  }
  saveRemoteDocumentList = async () => {
    let documents = this.state.documents
    console.log('saving document list')
    
    documents.map((doc) => {
      const ref = db.collection('documents').doc(doc.uid)
      ref.set({
        ...doc,
        user:this.state.name
      })
      return null
    })
  }
  getRemoteDocumentList = async (name) => {
    let docs = [...this.state.documents];
    let currentDocUID = this.state.currentDocument.uid
    let _this = this
    console.log('getting document list')
    if (name !== 'Anonymous') {
      db.collection("documents").where("user", "==", name)
        .get()
        .then(function (querySnapshot) {
          querySnapshot.forEach(function (doc) {
            let index = docs.findIndex(item => {
              return item['uid'] === doc.id;
            });
            if(docs[index] && doc.data()) {
              let localDate = new Date(docs[index].lastEdit)
              let remoteDate = new Date(doc.data().lastEdit.seconds * 1000)
              if (remoteDate > localDate) {
                docs[index].title = doc.data().title
                docs[index].content = doc.data().content
                NotificationManager.info('Updated ' + docs[index].title+' from remote storage','', 3000);
                if (currentDocUID === doc.id) {
                  _this.setState(prevState => ({
                    currentDocument: {
                      ...prevState.currentDocument,
                      content: doc.data().content,
                      title: doc.data().title,
                      lastEdit: remoteDate.toISOString()
                    }
                  }))
                }
              }
            } else {
              if(doc.data()) { //We have a remote document not found locally
                let remoteDate = null
                if (doc.data().lastEdit && doc.data().lastEdit.seconds){
                  remoteDate = new Date(doc.data().lastEdit.seconds * 1000)
                } else {
                  remoteDate = new Date(doc.data().lastEdit)
                }
                let remoteDoc = {
                  id: doc.data().id,
                  uid: doc.data().uid,
                  title: doc.data().title,
                  content: doc.data().content,
                  lastEdit: remoteDate.toISOString()
                }
                docs.push(remoteDoc)
              }
            }
            _this.setState(prevState => ({
              documents: docs
            }))
          }, this);
        },this)
        .catch(function (error) {
          console.log("Error getting documents: ", error);
        });
      this.loadSave = setInterval(() => {
        if(this.state.currentDocument.content !== this.state.lastContent ||
          this.state.currentDocument.title !== this.state.lastTitle) {
            this.saveRemotePayload()
            this.saveRemoteDocumentList()
            this.setState({ 
              lastContent: this.state.currentDocument.content,
              lastTitle: this.state.currentDocument.title
            })
          }
        
      }, 10000)
    }
    
  }
  deleteDocument = (id) => {
    swal({
      title: "Are you sure?",
      text: "Once deleted, you will not be able to recover this file!",
      icon: "warning",
      buttons: true,
      dangerMode: true,
    })
      .then((willDelete) => {
        if (willDelete) {
          var docs = [...this.state.documents];
          let index = docs.findIndex(item => {
            return item['id'] === id;
          });
          if (index !== -1) {
            let doc = docs[index]
            docs.splice(index, 1)
            if(this.state.currentDocument.id === doc.id)
            {
              this.setState({ currentDocument: this.newDoc() })
            }
            this.setState({ documents: docs })
            db.collection('documents').doc(doc.uid).delete().then(function () {
              console.log('Deleted in firestore')
            }).catch(function (error) {
              console.log('Error deleting', error)
            })
          }
          swal("Your file has been deleted.", {
            icon: "success",
          });
        } else {
          swal("Your file has not been deleted.");
        }
      });
  }
  /* End document management */
  /* Session management */
  selectSessionGoal = (goal, type) => {
    let content = this.state.currentDocument.content.trim()
    let currentWords = content.split(" ").length
    if (this.state.currentDocument.content === '<p><br></p>') {
      currentWords = 0
    }
    let reference = db.collection('sessions').doc()
    let uid = reference.id
    this.setState({
      session: {
        documentUID: this.state.currentDocument.uid,
        uid: uid,
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
        let content = this.state.currentDocument.content.trim()
        let wordCount = content.split(" ").length
        if (this.state.currentDocument.content === '<p><br></p>') {
          wordCount = 0
        }
        let sessionWordCount = wordCount - this.state.session.startingWordCount
        if (sessionWordCount < 0) { sessionWordCount = 0 }
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
      //Check if user has paused typing
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
    const isShowChrome = this.state.showChrome
    return (
        <div className="mx-10 my-5">
        {isShowChrome ? (
          <header>
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <a href ="/"><img src="/images/logo.png" 
                  alt=""
                  className="align-middle"
                  width="100px"
                  height="100px" />
                  Hall of Bright Carvings</a>
              </div>
              <Auth {...this.state} 
                signin={this.signIn} 
                signout={this.signOut} 
                showuser={this.showUser}/>
            </div>
            <DocumentList {...this.state}
              changeCurrentDocument={this.changeCurrentDocument}
              createNewDocument={this.createNewDocument}
              deleteDocument={this.deleteDocument} />
          </header>):(
            <button onClick={this.toggleChrome}>Show Header</button>
          )
        }
          <main className="container mx-auto">
          <NotificationContainer />
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
