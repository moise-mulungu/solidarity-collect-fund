import React from 'react'
import { DataGrid } from '@mui/x-data-grid'

const TestGrid = () => {
  const dates = ['2023-01-01', '2023-01-02']
  const rows = [
    { id: 1, memberName: 'John Doe', shares: { '2023-01-01': 10, '2023-01-02': 15 } },
    { id: 2, memberName: 'Jane Smith', shares: { '2023-01-01': 5, '2023-01-02': 20 } },
  ]

  const columns = [
    { field: 'id', headerName: 'N°', width: 70 },
    { field: 'memberName', headerName: 'MemberNames', width: 200 },
    ...dates.map((date) => ({
      field: date,
      headerName: date,
      width: 130,
      valueGetter: (params) => {
        console.log('params:', params) // Log params to trace the issue

        if (!params || !params.row) {
          console.error('params or params.row is undefined:', params)
          return 0
        }
        const { row } = params
        console.log(`Processing row: ${row.memberName} for date: ${date}`)
        const dateShareValue = row.shares && row.shares[date] ? row.shares[date] : 0
        console.log(`Date share value for ${date}: ${dateShareValue}`)
        return dateShareValue
      },
    })),
  ]

  return (
    <div style={{ height: 400, width: '100%' }}>
      <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} />
    </div>
  )
}

export default TestGrid
