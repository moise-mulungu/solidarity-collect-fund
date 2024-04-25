// import React, { useState } from 'react'
// import { getDoc, doc } from 'firebase/firestore'
// import { db } from '../firebase'
// import AdminAuthentication from './admin-authentication'
// import CollectorAuthenticationForm from './collector-authentication-form'

// export default function UserAuthentication({ onFormSubmit }) {
//   const [isLogin, setIsLogin] = useState(true)
//   const [role, setRole] = useState(null)
//   const [isAuthenticated, setIsAuthenticated] = useState(false) // New state for authentication
//   const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false) // New state for admin authentication
//   const [isCollectorAuthenticated, setIsCollectorAuthenticated] = useState(false) // New state for collector authentication

//   const fetchUserRole = async (userId) => {
//     const userRef = doc(db, 'users', userId)
//     const userSnap = await getDoc(userRef)

//     if (userSnap.exists()) {
//       return userSnap.data().role
//     } else {
//       console.log('No such document!')
//       return null
//     }
//   }

//   const handleRoleSwitch = (newRole) => {
//     setRole(newRole)
//     setIsLogin(true) // Reset the login/signup state
//   }

//   const handleAdminAuth = (authStatus, userRole) => {
//     onFormSubmit(authStatus, userRole)
//     if (authStatus && userRole === 'admin') {
//       setIsAdminAuthenticated(true)
//     }
//   }

//   const handleCollectorAuth = (authStatus, userRole) => {
//     // New function for collector authentication
//     onFormSubmit(authStatus, userRole)
//     if (authStatus && userRole === 'collector') {
//       setIsCollectorAuthenticated(true)
//     }
//   }

//   return (
//     <div>
//       {role === 'admin' && (
//         <AdminAuthentication
//           onFormSubmit={handleAdminAuth}
//           isAuthenticated={isAuthenticated}
//           onRoleSwitch={handleRoleSwitch}
//           fetchUserRole={fetchUserRole}
//         />
//       )}
//       {role === 'collector' && (
//         <CollectorAuthenticationForm
//           onFormSubmit={handleCollectorAuth} // Use the new function here
//           isAuthenticated={isAuthenticated}
//           onRoleSwitch={handleRoleSwitch}
//         />
//       )}

//       {!isAdminAuthenticated && (
//         <AdminAuthentication onFormSubmit={handleAdminAuth} fetchUserRole={fetchUserRole} />
//       )}
//     </div>
//   )
// }

import React, { useState } from 'react'
import { getDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import AdminAuthentication from './admin-authentication'
import CollectorAuthenticationForm from './collector-authentication-form'

export default function UserAuthentication({ onFormSubmit }) {
  const [role, setRole] = useState(null)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false) // New state for admin authentication

  const fetchUserRole = async (userId) => {
    const userRef = doc(db, 'users', userId)
    const userSnap = await getDoc(userRef)

    if (userSnap.exists()) {
      return userSnap.data().role
    } else {
      console.log('No such document!')
      return null
    }
  }

  const handleRoleSwitch = (newRole) => {
    setRole(newRole)
  }

  const handleAdminAuth = (authStatus, userRole) => {
    onFormSubmit(authStatus, userRole)
    if (authStatus && userRole === 'admin') {
      setIsAdminAuthenticated(true)
    }
  }

  const handleCollectorAuth = (authStatus, userRole) => {
    // New function for collector authentication
    onFormSubmit(authStatus, userRole)
  }

  return (
    <div>
      {role === 'admin' && (
        <AdminAuthentication
          onFormSubmit={handleAdminAuth}
          onRoleSwitch={handleRoleSwitch}
          fetchUserRole={fetchUserRole}
        />
      )}
      {role === 'collector' && (
        <CollectorAuthenticationForm
          onFormSubmit={handleCollectorAuth} // Use the new function here
          onRoleSwitch={handleRoleSwitch}
        />
      )}

      {!isAdminAuthenticated && (
        <AdminAuthentication onFormSubmit={handleAdminAuth} fetchUserRole={fetchUserRole} />
      )}
    </div>
  )
}
