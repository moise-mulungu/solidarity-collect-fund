import React, { useState } from 'react'
import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from 'firebase/auth'
import { setDoc, doc } from 'firebase/firestore'
import { app, db } from '../firebase'
import Login from './login'
import Signup from './signup'

export default function AdminAuthentication({ onFormSubmit, fetchUserRole }) {
  const [isLogin, setIsLogin] = useState(true)
  const [error, setError] = useState(null)
  const [role, setRole] = useState(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false) // New state for authentication

  const auth = getAuth(app)

  const handleLogin = async (event) => {
    event.preventDefault()
    const email = event.target.elements.email.value
    const password = event.target.elements.password.value
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        role: 'admin', // Assign the role to the user
      })
      const userRole = await fetchUserRole(user.uid) // Fetch the user's role
      setRole(userRole) // Set the role in the state
      setIsAuthenticated(true) // Set isAuthenticated to true after successful login
      onFormSubmit(true, 'admin') // Add this line
    } catch (error) {
      console.error(`Error code: ${error.code}, Error message: ${error.message}`)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    const email = event.target.elements.email.value
    const password = event.target.elements.password.value
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        role: 'admin', // Assign the role to the user
      })
      const userRole = await fetchUserRole(user.uid) // Fetch the user's role
      setRole(userRole) // Set the role in the state
      onFormSubmit(true, 'admin') // Add this line
    } catch (error) {
      console.error(`Error code: ${error.code}, Error message: ${error.message}`)
    }
  }

  const handleLoginWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then(async (result) => {
        // This gives you a Google Access Token. You can use it to access the Google API.
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential.accessToken
        // The signed-in user info.
        const user = result.user
        console.log('user', user) // Log the user object
        const userRef = doc(db, 'users', user.uid)
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: 'admin', // Assign the role to the user
        })
        const userRole = await fetchUserRole(user.uid) // Fetch the user's role
        setRole(userRole) // Set the role in the state
        onFormSubmit(true)
      })
      .catch((error) => {
        // Handle Errors here.
        const errorCode = error.code
        const errorMessage = error.message
        // The email of the user's account used.
        const email = error.email
        // The AuthCredential type that was used.
        const credential = GoogleAuthProvider.credentialFromError(error)
        // ...
      })
  }

  const toggleAuthenticationMode = () => {
    setIsLogin(!isLogin)
  }

  const handleRoleSwitch = (newRole) => {
    setRole(newRole)
    setIsLogin(true) // Reset the login/signup state
  }

  return (
    <div>
      {isLogin ? (
        <Login
          handleLogin={handleLogin}
          handleSignup={handleSignup}
          error={error}
          toggleAuthenticationMode={toggleAuthenticationMode}
          handleLoginWithGoogle={handleLoginWithGoogle}
          className="p-10 bg-white flex flex-col items-start pb-5 w-72"
        />
      ) : (
        <Signup
          handleSignup={handleSignup}
          error={error}
          toggleAuthenticationMode={toggleAuthenticationMode}
          className="p-10 bg-white flex flex-col items-start pb-5 w-72"
        />
      )}
    </div>
  )
}
