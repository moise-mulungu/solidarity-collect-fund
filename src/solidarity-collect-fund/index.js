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
  const [collectorUid, setCollectorUid] = useState('')

  const handleAdminAuthentication = (authStatus, userRole) => {
    setIsAuthenticated(authStatus)
    setIsAdminAuthenticated(authStatus && userRole === 'admin')
  }

  const handleCollectorFormSubmit = (authStatus, userRole, uid) => {
    if (authStatus && userRole === 'collector') {
      setIsAuthenticated(authStatus)
      setIsCollectorAuthenticated(authStatus)
      setCollectorUid(uid)
    }
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
            onClick={handleAdminClick}
            className="bg-green-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            Admin Authentication
          </button>
          <button
            onClick={handleCollectorClick}
            className="bg-green-500 hover:bg-red-500 text-white font-bold py-2 px-4 rounded"
          >
            Collector Authentication
          </button>
        </div>
      )}

      {selectedAuthType === 'admin' && !isAdminAuthenticated && (
        <UserAuthentication onFormSubmit={handleAdminAuthentication} />
      )}

      {selectedAuthType === 'collector' && !isCollectorAuthenticated && (
        <CollectorAuthenticationForm onFormSubmit={handleCollectorFormSubmit} />
      )}

      {isAdminAuthenticated && <SubmittedData />}

      {isCollectorAuthenticated && <WeeklyMeetingForm collectorUid={collectorUid} />}
    </>
  )
}
