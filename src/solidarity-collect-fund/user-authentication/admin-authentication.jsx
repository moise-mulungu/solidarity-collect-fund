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
  const [isAuthenticated, setIsAuthenticated] = useState(false)

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
        role: 'admin',
      })
      const userRole = await fetchUserRole(user.uid)
      setRole(userRole)
      setIsAuthenticated(true)
      onFormSubmit(true, 'admin')
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
        role: 'admin',
      })
      const userRole = await fetchUserRole(user.uid)
      setRole(userRole)
      onFormSubmit(true, 'admin')
    } catch (error) {
      console.error(`Error code: ${error.code}, Error message: ${error.message}`)
    }
  }

  const handleLoginWithGoogle = () => {
    const provider = new GoogleAuthProvider()
    signInWithPopup(auth, provider)
      .then(async (result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result)
        const token = credential.accessToken
        const user = result.user
        const userRef = doc(db, 'users', user.uid)
        await setDoc(userRef, {
          email: user.email,
          displayName: user.displayName,
          role: 'admin',
        })
        const userRole = await fetchUserRole(user.uid)
        setRole(userRole)
        onFormSubmit(true, 'admin')
      })
      .catch((error) => {
        console.error(`Error code: ${error.code}, Error message: ${error.message}`)
      })
  }

  const toggleAuthenticationMode = () => {
    setIsLogin(!isLogin)
  }

  return (
    <div className="w-full h-full flex items-center justify-center">
      <div className="bg-white p-10 rounded shadow-md w-full max-w-md">
        {isLogin ? (
          <Login
            handleLogin={handleLogin}
            handleSignup={handleSignup}
            error={error}
            toggleAuthenticationMode={toggleAuthenticationMode}
            handleLoginWithGoogle={handleLoginWithGoogle}
            className="w-full"
          />
        ) : (
          <Signup
            handleSignup={handleSignup}
            error={error}
            toggleAuthenticationMode={toggleAuthenticationMode}
            className="w-full"
          />
        )}
      </div>
    </div>
  )
}
