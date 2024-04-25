import { initializeApp, getApps } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { getFirestore } from 'firebase/firestore'

import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: 'AIzaSyCM2oUzVFXp2rlxaSv8BwFEwesChx8wgN0',
  authDomain: 'solidarity-fund-14693.firebaseapp.com',
  projectId: 'solidarity-fund-14693',
  storageBucket: 'solidarity-fund-14693.appspot.com',
  messagingSenderId: '949138500044',
  appId: '1:949138500044:web:b6a24df51b43b57debd569',
  measurementId: 'G-BWJ72CX7BW',
}

console.log('Before initialization:', firebaseConfig)

function initializeFirebaseApp() {
  console.log('getApps()', getApps())
  let app
  if (!getApps().length) {
    app = initializeApp(firebaseConfig)
  } else {
    app = getApps()[0] // if already initialized, use that one
  }
  console.log('After initialization:', firebaseConfig)
  return app
}

const app = initializeFirebaseApp()

const auth = getAuth(app)

let analytics

if (typeof window !== 'undefined') {
  analytics = getAnalytics(app)
}

const db = getFirestore(app)

export { app, analytics, db, auth }
