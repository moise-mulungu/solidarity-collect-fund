import { useState } from 'react'
import Header from './header'
import UserAuthentication from './user-authentication'
import WeeklyMeetingForm from './weekly-meeting-form'
import CollectorAuthenticationForm from './user-authentication/collector-authentication-form'
import SubmittedData from './submitted-data'

export default function SolidarityCollectFund() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCollectorAuthenticated, setIsCollectorAuthenticated] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [selectedAuthType, setSelectedAuthType] = useState(null)

  const handleAdminAuthentication = (authStatus, userRole) => {
    setIsAuthenticated(authStatus)
    setIsAdminAuthenticated(authStatus && userRole === 'admin')
  }

  const handleCollectorAuthentication = (authStatus) => {
    setIsAuthenticated(authStatus)
    setIsCollectorAuthenticated(authStatus)
  }

  const handleAdminClick = () => {
    setSelectedAuthType('admin')
  }

  const handleCollectorClick = () => {
    setSelectedAuthType('collector')
  }

  return (
    <>
      <Header />
      {!isAuthenticated && (
        <div className="flex justify-between mb-2">
          <button
            href="#"
            onClick={handleAdminClick}
            className="text-blue-500 hover:text-red-500 cursor-pointer"
          >
            Admin Authentication
            </button>
          <button
            href="#"
            onClick={handleCollectorClick}
            className="text-blue-500 hover:text-red-500 cursor-pointer"
          >
            Collector Authentication
            </button>
        </div>
      )}

      {selectedAuthType === 'admin' && !isAdminAuthenticated && (
        <UserAuthentication onFormSubmit={handleAdminAuthentication} />
      )}

      {selectedAuthType === 'collector' && !isCollectorAuthenticated && (
        <CollectorAuthenticationForm onFormSubmit={handleCollectorAuthentication} />
      )}

      {isAdminAuthenticated && <SubmittedData />}

      {isCollectorAuthenticated && <WeeklyMeetingForm />}
    </>
  )
}
