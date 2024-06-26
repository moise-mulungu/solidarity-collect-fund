import React, { useState } from 'react'
import { FaGoogle, FaSignInAlt } from 'react-icons/fa'
import { collection, addDoc, setDoc, doc } from 'firebase/firestore'
import {
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
} from 'firebase/auth'
import { auth, db } from '../firebase'

export default function CollectorAuthenticationForm(props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [solidarityName, setSolidarityName] = useState('')
  const [address, setAddress] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoginMode, setIsLoginMode] = useState(true)

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (isLoginMode) {
      handleLogin(event)
    } else {
      handleSignup(event)
    }
  }

  const handleSignup = async (event) => {
    event.preventDefault()
    console.log('Submitting signup form with values:', {
      email,
      password,
      fullName,
      solidarityName,
      address,
    })

    // Validate email
    const emailRegex = /.+@.+/
    if (!emailRegex.test(email)) {
      console.error('Invalid email format')
      return
    }

    try {
      // create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('User created with ID: ', user.uid)

      // add document to Firestore
      const docRef = await addDoc(collection(db, 'collectors'), {
        uid: user.uid, // store the user's ID
        email: user.email,
        fullName,
        solidarityName,
        address,
        role: 'collector',
      })
      console.log('Document written with ID: ', docRef.id)

      // Call onFormSubmit prop to update isAuthenticated state
      if (typeof props.onFormSubmit === 'function') {
        props.onFormSubmit(true, 'collector', user.uid)
      } else {
        console.error('onFormSubmit is not a function', props.onFormSubmit)
      }
      setIsAuthenticated(true)
      setEmail('')
      setPassword('')
      setFullName('')
      setSolidarityName('')
      setAddress('')
    } catch (e) {
      console.error('Error during form submission:', e)
      setIsAuthenticated(false)
    }
  }

  const handleLogin = async (event) => {
    event.preventDefault()
    console.log('Submitting login form with values:', {
      email,
      password,
    })

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      console.log('User signed in:', user)
      setIsAuthenticated(true)
      if (typeof props.onFormSubmit === 'function') {
        props.onFormSubmit(true, 'collector', user.uid)
      } else {
        console.error('onFormSubmit is not a function', props.onFormSubmit)
      }
    } catch (error) {
      console.error('Error during login:', error)
      setIsAuthenticated(false)
    }
  }

  const handleLoginWithGoogle = async () => {
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const credential = GoogleAuthProvider.credentialFromResult(result)
      const token = credential.accessToken
      const user = result.user
      console.log('user', user)
      const userRef = doc(db, 'users', user.uid)
      await setDoc(userRef, {
        email: user.email,
        fullName,
        solidarityName,
        address,
        role: 'collector',
      })
    } catch (error) {
      const errorCode = error.code
      const errorMessage = error.message
      const email = error.email
      const credential = GoogleAuthProvider.credentialFromError(error)
      console.error('Error during Google sign-in:', error)
    }
  }

  const toggleMode = () => {
    setIsLoginMode((prevMode) => !prevMode)
  }

  return (
    <>
      {/* <div className="flex min-h-full flex-1 flex-col justify-center py-12 sm:px-6 lg:px-8"> */}
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <h2 className="mt-2 text-center text-3xl font-bold leading-9 tracking-tight text-gray-900">
            {isLoginMode ? 'Sign in to your account' : 'Sign up for an account'}
          </h2>
        </div>

        <div className="mt-2 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white px-6 py-12 shadow rounded-lg sm:px-12">
            <form onSubmit={handleSubmit} className="space-y-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                  Email address
                </label>
                <div className="mt-2">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                </div>
              </div>

              {!isLoginMode && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-900">
                      Full Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        required
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="solidarityName"
                      className="block text-sm font-medium text-gray-900"
                    >
                      Solidarity Name
                    </label>
                    <div className="mt-2">
                      <input
                        id="solidarityName"
                        name="solidarityName"
                        type="text"
                        value={solidarityName}
                        onChange={(e) => setSolidarityName(e.target.value)}
                        required
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-900">
                      Address
                    </label>
                    <div className="mt-2">
                      <input
                        id="address"
                        name="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="block w-full rounded-md border border-gray-300 py-2 px-3 text-gray-900 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Remember me
                  </label>
                </div>

                <div className="text-sm">
                  <button href="#" className="font-semibold text-blue-600 hover:text-blue-500">
                    Forgot password?
                  </button>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {isLoginMode ? 'Sign in' : 'Sign up'}
                </button>
              </div>
            </form>

            <div className="mt-10">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">Or continue with</span>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <button
                  onClick={handleLoginWithGoogle}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-blue-500 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaGoogle className="h-5 w-5 text-red-500" />
                  Google
                </button>

                <button
                  onClick={toggleMode}
                  className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FaSignInAlt className="h-5 w-5 text-green-500" />
                  {isLoginMode ? 'Sign up' : 'Login'}
                </button>
              </div>
            </div>
          </div>
        </div>
      {/* </div> */}
    </>
  )
}
