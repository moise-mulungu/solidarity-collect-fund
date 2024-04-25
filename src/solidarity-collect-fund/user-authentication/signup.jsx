import { useState } from 'react'

export default function Signup({ handleSignup, error, toggleAuthenticationMode }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  return (
    <form onSubmit={handleSignup}>
      <input
        name="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        placeholder="Email"
        className="p-2 border-2 border-gray-200 rounded mb-2 w-full text-black"
      />
      <input
        name="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        placeholder="Password"
        className="p-2 border-2 border-gray-200 rounded mb-2 w-full text-black"
      />
      <button type="submit" className="p-2 border-2 border-gray-200 rounded mb-2 w-full text-black">
        Signup
      </button>
      <button onClick={toggleAuthenticationMode}>Switch to Login</button>
    </form>
  )
}
