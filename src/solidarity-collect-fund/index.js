import { useState, useEffect } from 'react'
import Header from './header'
import UserAuthentication from './user-authentication'
import WeeklyMeetingForm from './weekly-meeting-form'
import CollectorAuthenticationForm from './user-authentication/collector-authentication-form'
import SubmittedData from './submitted-data'
import { DNA } from 'react-loader-spinner'

export default function SolidarityCollectFund() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isCollectorAuthenticated, setIsCollectorAuthenticated] = useState(false)
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false)
  const [selectedAuthType, setSelectedAuthType] = useState(null)
  const [collectorUid, setCollectorUid] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [isLoading])

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h1 style={{ fontSize: '3em' }}>Welcome to Solidarity Collect Fund</h1>
        <DNA
          visible={true}
          height="160"
          width="160"
          ariaLabel="dna-loading"
          wrapperStyle={{}}
          wrapperClass="dna-wrapper"
        />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex flex-col items-center justify-center bg-gray-100 py-6">
        {!isAuthenticated && (
          <div className="flex space-x-4 mb-6">
            <button
              onClick={handleAdminClick}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow-lg"
            >
              Admin Authentication
            </button>
            <button
              onClick={handleCollectorClick}
              className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded shadow-lg"
            >
              Collector Authentication
            </button>
          </div>
        )}

        {selectedAuthType === 'admin' && !isAdminAuthenticated && (
          <div>
            <UserAuthentication onFormSubmit={handleAdminAuthentication} />
          </div>
        )}

        {selectedAuthType === 'collector' && !isCollectorAuthenticated && (
          <div className="bg-white p-6 rounded shadow-md w-full max-w-md">
            <CollectorAuthenticationForm onFormSubmit={handleCollectorFormSubmit} />
          </div>
        )}

        {isAdminAuthenticated && (
          <div className="w-full">
            <SubmittedData />
          </div>
        )}

        {isCollectorAuthenticated && (
          <div className="w-full">
            <WeeklyMeetingForm collectorUid={collectorUid} />
          </div>
        )}
      </main>
      <footer className="bg-gray-600 text-white text-center py-4">
        <p>&copy; 2024 Solidarity Collect Fund. All rights reserved.</p>
      </footer>
    </div>
  )
}
