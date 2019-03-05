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
export const auth = firebase.auth()
export const googleAuthProvider = new firebase.auth.GoogleAuthProvider()