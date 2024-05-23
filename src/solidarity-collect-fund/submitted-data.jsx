import React, { useEffect, useState } from 'react'
import { collection, getDocs, query, where } from 'firebase/firestore'
import { db } from './firebase' // Import your Firebase app instance
import { BounceLoader } from 'react-spinners'
import { DataGrid } from '@mui/x-data-grid'

const SubmittedData = () => {
  const [loading, setLoading] = useState(true)
  const [submittedData, setSubmittedData] = useState([])
  const [selectedFullName, setSelectedFullName] = useState(null)
  const [meetingsData, setMeetingsData] = useState([])
  const [meetingsLoading, setMeetingsLoading] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectorsRef = collection(db, 'collectors')
        const querySnapshot = await getDocs(collectorsRef)
        const data = querySnapshot.docs
          .map((doc) => {
            const docData = doc.data()
            return {
              id: doc.id, // Use Firestore doc id as the key
              solidarityName: docData.solidarityName,
              fullName: docData.fullName,
              address: docData.address,
            }
          })
          .filter((item) => item.fullName && item.solidarityName && item.address) // Guard clause to prevent empty lists
        setSubmittedData(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching data:', error)
        setError('Failed to fetch data. Please try again.')
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchMeetingsData = async (solidarityName) => {
    console.log('fetchMeetingsData called with:', solidarityName) // Log the value of solidarityName
    if (!solidarityName) return // Guard clause to prevent querying with an undefined solidarityName

    try {
      const meetingsRef = collection(db, 'meetings')
      const q = query(meetingsRef, where('solidarityName', '==', solidarityName))
      const querySnapshot = await getDocs(q)
      console.log('querySnapshot:', querySnapshot) // Log the querySnapshot
      const data = querySnapshot.docs.flatMap((doc) => {
        const docData = doc.data()
        console.log('doc data:', docData) // Log the data of each document
        return docData.rows.map((row, index) => ({
          id: doc.id, // Assuming each document has a unique id
          number: index + 1, // Add a 'number' field to each object
          memberNames: Array.isArray(row.memberNames) ? row.memberNames : [row.memberNames],
          share: row.share,
          joinDate: row.joinDate ? new Date(row.joinDate).toLocaleDateString() : 'N/A', // Handle invalid joinDate
        }))
      })

      // setMeetingsLoading(data)
      console.log('data:', data) // Log the processed data
      setMeetingsData(data)
      setMeetingsLoading(false)
      console.log('meetingsData:', meetingsData)
    } catch (error) {
      console.error('Error fetching meetings data:', error)
      setError('Failed to fetch meetings data. Please try again.')
      setMeetingsLoading(false)
    }
  }

  const handleCardClick = async (fullName) => {
    console.log('Card clicked:', fullName)
    if (selectedFullName === fullName) {
      // If the same card is clicked, toggle off the table
      setSelectedFullName(null)
      setMeetingsData([])
    } else {
      // Fetch the solidarityName of the selected collector
      const selectedCollector = submittedData.find((collector) => collector.fullName === fullName)
      if (selectedCollector) {
        const { solidarityName } = selectedCollector
        setSelectedFullName(fullName)
        fetchMeetingsData(solidarityName)
      }
    }
  }

  const transformData = (data) => {
    const dates = [...new Set(data.map((item) => item.joinDate))].sort(
      (a, b) => new Date(a) - new Date(b)
    )
    const rows = data.reduce((acc, item) => {
      const member = item.memberNames
      if (!acc[member]) {
        acc[member] = {
          id: Object.keys(acc).length + 1,
          memberName: member.length > 0 ? member[0] : '',
          shares: {},
        }
      }
      if (typeof item.share === 'number') {
        acc[member].shares[item.joinDate] = item.share
      }
      return acc
    }, {})

    console.log('Transformed Data:', { dates, rows: Object.values(rows) }) // Log the transformed data
    return { dates, rows: Object.values(rows) }
  }

  const { dates, rows } = transformData(meetingsData)

  console.log('dates:', dates)
  console.log('rows:', rows)
  const columns = [
    { field: 'id', headerName: 'N°', width: 70 },
    { field: 'memberName', headerName: 'MemberNames', width: 200 },
    ...dates.map((date) => ({
      field: date,
      headerName: date,
      width: 130,
      valueGetter: (params = { row: { shares: {} } }) => {
        console.log('value of date:', date)
        if (!params.row || !params.row.shares) {
          console.error('params.row or params.row.shares is undefined:', params)
          return 0
        }
        const { row, field } = params
        const dateShareValue = row.shares[field] ? row.shares[field] : 0
        return dateShareValue
      },
    })),
  ]

  if (loading) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <BounceLoader color="#00BFFF" loading={loading} size={150} />
      </div>
    )
  }

  if (error) {
    return (
      <div
        style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}
      >
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-semibold pb-3 mb-4 border-b border-gray-300">Submitted Data</h2>
      <div className="flex flex-col gap-6">
        {submittedData.map((data) => (
          <div
            key={data.id}
            onClick={() => handleCardClick(data.fullName)}
            className="cursor-pointer p-6 border border-gray-200 rounded-md shadow-sm bg-gray-50 flex flex-col transition duration-300 ease-in-out transform hover:scale-105 hover:bg-gray-100"
          >
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              <span className="material-icons mr-2 text-blue-600">Solidarity Group:</span>
              {data.solidarityName}
            </h3>
            <p className="text-gray-700 mb-1 flex items-center">
              <span className="material-icons mr-2 text-green-600">Collector:</span>
              {data.fullName}
            </p>
            <p className="text-gray-700 flex items-center">
              <span className="material-icons mr-2 text-red-600">Address:</span>
              {data.address}
            </p>
          </div>
        ))}
      </div>

      {selectedFullName && (
        <div className="mt-6">
          <h2 className="text-2xl font-semibold pb-3 mb-4 border-b border-gray-300">
            Meetings conducted by:{' '}
            <span className="material-icons mr-2 text-green-600">{selectedFullName}</span>
          </h2>
          {meetingsLoading ? (
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '200px',
              }}
            >
              <BounceLoader color="#00BFFF" loading={meetingsLoading} size={75} />
            </div>
          ) : (
            <div style={{ height: 400, width: '100%' }}>
              <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default SubmittedData
