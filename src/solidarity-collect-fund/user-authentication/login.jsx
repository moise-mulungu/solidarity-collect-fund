import { useState } from 'react'
import { FaSignInAlt, FaUserPlus, FaGoogle, FaExchangeAlt } from 'react-icons/fa'
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { app } from '../firebase' // adjust this path to your firebase initialization file

export default function Login({
  handleLogin,
  handleSignup,
  error,
  toggleAuthenticationMode,
  handleLoginWithGoogle,
}) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoginMode, setIsLoginMode] = useState(true)

  const auth = getAuth(app)
  const provider = new GoogleAuthProvider()

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        handleLoginWithGoogle(result.user)
      })
      .catch((error) => {
        console.error(error)
      })
  }

  const switchMode = () => {
    setIsLoginMode(!isLoginMode)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (isLoginMode) {
      handleLogin(e)
    } else {
      handleSignup(e)
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      {/* <div className="flex flex-col items-center justify-between min-h-screen bg-gray-100 px-4 py-8"> */}
      <div className="bg-white text-gray-800 rounded-lg shadow-lg p-8 w-full max-w-md my-4">
        <h1 className="text-3xl font-semibold mb-6 text-center">
          {isLoginMode ? 'Login' : 'Sign Up'}
        </h1>
        <input
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          placeholder="Email"
          className="p-3 border border-gray-300 rounded mb-4 w-full focus:outline-none focus:border-blue-500"
        />
        <input
          name="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          placeholder="Password"
          className="p-3 border border-gray-300 rounded mb-4 w-full focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          className="p-3 bg-blue-500 text-white rounded mb-4 w-full hover:bg-blue-600 transition-colors"
        >
          <FaSignInAlt className="inline mr-2" />
          {isLoginMode ? 'Login' : 'Sign Up'}
        </button>
        <button
          onClick={signInWithGoogle}
          className="p-3 bg-red-500 text-white rounded mb-4 w-full hover:bg-red-600 transition-colors"
        >
          <FaGoogle className="inline mr-2" />
          Sign In with Google
        </button>
        <button
          onClick={switchMode}
          className="p-3 bg-gray-200 text-gray-800 rounded mb-4 w-full hover:bg-gray-300 transition-colors"
        >
          <FaExchangeAlt className="inline mr-2" />
          Switch to {isLoginMode ? 'Sign Up' : 'Login'}
        </button>
      </div>
      {/* </div> */}
    </form>
  )
}
