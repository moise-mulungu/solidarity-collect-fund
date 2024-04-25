import { useState } from 'react'
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
      <div className="flex items-center justify-center h-screen bg-gray-100 mx-2 md:mx-0">
        <div className="bg-blue-500 text-white rounded-lg shadow-lg p-8 md:w-1/3 h-full md:h-2/3 flex items-center justify-center">
          <div>
            <h1 className="text-2xl font-bold mb-4">{isLoginMode ? 'Login' : 'Sign Up'}</h1>
            <input
              name="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              placeholder="Email"
              className="p-2 border-2 border-gray-200 rounded mb-4 w-full text-black"
            />
            <input
              name="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              className="p-2 border-2 border-gray-200 rounded mb-4 w-full text-black"
            />
            <button
              type="submit"
              className="p-2 border-2 border-gray-200 rounded-full mb-4 w-full text-black flex justify-center items-center"
            >
              <i className={isLoginMode ? 'fas fa-sign-in-alt' : 'fas fa-user-plus'}></i>
              {isLoginMode ? 'Login' : 'Sign Up'}
            </button>
            <button
              onClick={signInWithGoogle}
              className="p-2 border-2 border-gray-200 rounded-full mb-4 w-full text-black flex justify-center items-center"
            >
              <i className="fab fa-google"></i>
              Sign In with Google
            </button>
            <button
              onClick={switchMode}
              className="p-2 border-2 border-gray-200 rounded-full mb-4 w-full text-black flex justify-center items-center"
            >
              <i className="fas fa-exchange-alt"></i>
              Switch to {isLoginMode ? 'Sign Up' : 'Login'}
            </button>
          </div>
        </div>
      </div>
    </form>
  )
}
