import React, { useEffect, useState } from 'react'
import { DataGrid } from '@mui/x-data-grid'
import { collection, getDocs } from 'firebase/firestore'
import { db } from './firebase' // Import your Firebase app instance
import { BounceLoader } from 'react-spinners'

const SubmittedData = ({ footerRowsRef }) => {
  const [loading, setLoading] = useState(true)
  const [submittedData, setSubmittedData] = useState([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const meetingsRef = collection(db, 'meetings')
        const querySnapshot = await getDocs(meetingsRef)
        const data = querySnapshot.docs.map((doc, index) => {
          const docData = doc.data()
          return {
            id: index + 1, // Use index as id
            memberNames: docData.memberNames,
            joinDate: docData.joinDate,
            share: docData.share,
            totalShare: docData.totalShare, // assuming totalShare is a field in your document
          }
        })

        // Add a new row for Dates
        data.push({
          id: 'Dates',
          memberNames: '',
          joinDate: '', // You can put any value you want here
          share: '',
          totalShare: '',
        })
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

  // Update columns
  const columns = [
    { field: 'id', headerName: 'Number' },
    { field: 'memberNames', headerName: 'Member Names' },
    { field: 'joinDate', headerName: 'Join date' },
    { field: 'share', headerName: 'Share' },
    { field: 'totalShare', headerName: 'Total Share' },
  ]

  // Concatenate submittedData with footerRowsRef
  const allRows = Array.isArray(footerRowsRef?.current)
    ? [...submittedData, ...footerRowsRef?.current]
    : submittedData

  console.log('all rows:', allRows)
  console.log('footer rows:', footerRowsRef)

  return (
    <div>
      <h2 className="text-2xl py-5 border-b border-gray-700">Submitted Data</h2>
      <div>
        <DataGrid rows={allRows} columns={columns} />
      </div>
    </div>
  )
}

export default SubmittedData
