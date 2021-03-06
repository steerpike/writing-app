import firebase from 'firebase/app'
require('firebase/firestore')
require('firebase/auth')

var config = {
    apiKey: "AIzaSyCAV5DvEDsZhT_ZdSzErFLbgkveGYXL--8",
    authDomain: "writing-26428.firebaseapp.com",
    databaseURL: "https://writing-26428.firebaseio.com",
    projectId: "writing-26428",
    storageBucket: "writing-26428.appspot.com",
    messagingSenderId: "1066133947580"
};
firebase.initializeApp(config);

export const db = firebase.firestore()
db.enablePersistence()
    .catch(function (err) {
        if (err.code === 'failed-precondition') {
            // Multiple tabs open, persistence can only be enabled
            // in one tab at a a time.
            // ...
            console.log('failed-precondition', err)
        } else if (err.code === 'unimplemented') {
            // The current browser does not support all of the
            // features required to enable persistence
            // ...
            console.log('unimplemented', err)
        }
    });
export const auth = firebase.auth()
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()