import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase' // Import your Firebase app instance
import { BounceLoader } from 'react-spinners'

const SubmittedData = ({ footerRows }) => {
  const [loading, setLoading] = useState(true)
  const [submittedData, setSubmittedData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meetingsRef = collection(db, 'meetings')
        const querySnapshot = await getDocs(meetingsRef)
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setSubmittedData(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
        }}
      >
        <BounceLoader color="#00BFFF" loading={loading} size={150} />
      </div>
    )
  }

  const columns = [
    { field: 'memberNames', headerName: 'Member Names' },
    { field: 'share', headerName: 'Share' },
    { field: 'amount', headerName: 'Amount' },
    { field: 'solidarity', headerName: 'Solidarity' },
    { field: 'age', headerName: 'Age' },
    { field: 'assistantFund', headerName: 'Assistant Fund' },
    { field: 'assistantAmount', headerName: 'Assistant Amount' },
    { field: 'fine', headerName: 'Fine' },
    { field: 'joinDate', headerName: 'Join date' },
    { field: 'role', headerName: 'Department' },
  ]

  // Concatenate submittedData with footerRows
  const allRows = Array.isArray(footerRows) ? [...submittedData, ...footerRows] : submittedData

  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <h2>Submitted Data</h2>
      <div style={{ height: '90%', width: '100%' }}>
        <DataGrid rows={allRows} columns={columns} />
      </div>
    </div>
  )
}

export default SubmittedData
