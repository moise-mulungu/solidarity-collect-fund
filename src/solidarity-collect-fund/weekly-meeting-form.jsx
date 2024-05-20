import * as React from 'react'
import { collection, addDoc, getDocs, doc, getDoc } from 'firebase/firestore'
import { db } from './firebase'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/DeleteOutlined'
import SaveIcon from '@mui/icons-material/Save'
import CancelIcon from '@mui/icons-material/Close'
import {
  DataGrid,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowModes,
  GridRowEditStopReasons,
} from '@mui/x-data-grid'

// Function to generate a random trader name
const randomTraderName = () => {
  return ''
}

const randomId = () => {
  return Math.random().toString(36).substring(7)
}

const initialRows = [
  {
    id: randomId(), // Generate ID for the initial row
    memberNames: randomTraderName(),
    share: 0,
    amount: 0,
    solidarity: 0,
    assistantFund: 0,
    assistantAmount: 0,
    fine: 0,
    age: null,
    joinDate: new Date().toISOString(),
    role: '',
  },
]

const EditToolbar = ({ footerRowsRef, ...props }) => {
  const { setRows, setRowModesModel, setSubmittedData, rows } = props
  const [newRowId, setNewRowId] = React.useState(null)

  const handleClick = () => {
    const id = randomId()
    setNewRowId(id) // Set the new row ID
    setRows((oldRows) => [
      ...oldRows,
      {
        id,
        memberNames: '',
        share: '',
        amount: '',
        solidarity: '',
        age: '',
        assistantFund: '',
        assistantAmount: '',
        fine: '',
        isNew: true,
      },
    ])
  }

  const fetchCollectorSolidarityName = async (collectorUid) => {
    const collectorRef = doc(db, 'collectors', collectorUid)
    const collectorSnap = await getDoc(collectorRef)

    if (collectorSnap.exists()) {
      const collectorSolidarityName = collectorSnap.data().solidarityName
      console.log('collect solidarity name:', collectorSolidarityName)
      return collectorSolidarityName
    } else {
      console.log('No such collector!')
      return ''
    }
  }

  React.useEffect(() => {
    if (newRowId) {
      setRowModesModel((oldModel) => ({
        ...oldModel,
        [newRowId]: { mode: GridRowModes.Edit, fieldToFocus: 'memberNames' },
      }))
      setNewRowId(null) // Reset the new row ID
    }
  }, [newRowId, setRowModesModel])

  const handleSubmitClick = async () => {
    try {
      // Fetch the solidarityName for the collector
      const solidarityName = await fetchCollectorSolidarityName('user.uid') // Replace with actual collector UID
      console.log('fetched solidarity name:', solidarityName)

      // Use existing IDs from grid rows to maintain consistency
      const dataToSubmit = rows.map((row) => ({
        id: row.id, // Use existing ID
        memberNames: row.memberNames,
        share: row.share,
        amount: row.amount,
        solidarity: row.solidarity,
        age: row.age,
        assistantFund: row.assistantFund,
        assistantAmount: row.assistantAmount,
        fine: row.fine,
        joinDate: new Date(row.joinDate).toISOString(), // Convert date to ISO string
        role: row.role,
        solidarityName, // Add the solidarityName field
      }))

      console.log('Data to submit:', dataToSubmit)

      // Create a new object that includes all the rows and footerRows
      const dataObject = {
        rows: dataToSubmit,
        footerRows: footerRowsRef.current,
        solidarityName, // Add the solidarityName field at the top level
      }

      const meetingsRef = collection(db, 'meetings')

      // Add the dataObject as a single document to the "meetings" collection
      await addDoc(meetingsRef, dataObject)

      setSubmittedData(dataToSubmit)
    } catch (error) {
      console.error('Error submitting data:', error)
    }
  }

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
      <Button
        color="primary"
        startIcon={<SaveIcon />}
        onClick={(event) => {
          event.preventDefault()
          handleSubmitClick()
        }}
      >
        Submit
      </Button>
    </GridToolbarContainer>
  )
}

export default function WeeklyMeetingForm() {
  const [rows, setRows] = React.useState(initialRows)
  const [rowModesModel, setRowModesModel] = React.useState({})
  const [submittedData, setSubmittedData] = React.useState([])
  const [processedData, setProcessedData] = React.useState([])
  const [gridRows, setGridRows] = React.useState([])
  const [flattenedData, setFlattenedData] = React.useState([])

  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true
    }
  }

  const handleEditClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.Edit } })
  }

  const handleSaveClick = (id) => () => {
    setRowModesModel({ ...rowModesModel, [id]: { mode: GridRowModes.View } })
  }

  const handleDeleteClick = (id) => () => {
    setRows(rows.filter((row) => row.id !== id))
  }

  const handleCancelClick = (id) => () => {
    setRowModesModel({
      ...rowModesModel,
      [id]: { mode: GridRowModes.View, ignoreModifications: true },
    })

    const editedRow = rows.find((row) => row.id === id)
    if (editedRow.isNew) {
      setRows(rows.filter((row) => row.id !== id))
    }
  }

  // This useEffect will run whenever 'rows' changes and update 'submittedData' to match the current state of 'rows'.
  React.useEffect(() => {
    setSubmittedData(rows)
  }, [rows])

  const processRowUpdate = (newRow) => {
    const updatedRow = { ...newRow, isNew: false }
    setRows(rows.map((row) => (row.id === newRow.id ? updatedRow : row)))
    return updatedRow
  }

  const handleRowModesModelChange = (newRowModesModel) => {
    setRowModesModel(newRowModesModel)
  }

  const columns = [
    {
      field: 'memberNames',
      headerName: 'Member Names',
      width: 180,
      editable: true,
      style: { borderRight: '1px solid grey' },
    },
    {
      field: 'share',
      headerName: 'Share',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
      style: { borderRight: '1px solid grey' },
    },
    {
      field: 'amount',
      headerName: 'Amount',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'solidarity',
      headerName: 'Solidarity',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'age',
      headerName: 'Age',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'assistantFund',
      headerName: 'Assistant Fund',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'assistantAmount',
      headerName: 'Assistant Amount',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'fine',
      headerName: 'Fine',
      type: 'number',
      width: 80,
      align: 'left',
      headerAlign: 'left',
      editable: true,
    },
    {
      field: 'joinDate',
      headerName: 'Join date',
      type: 'date',
      width: 180,
      editable: true,
      // valueGetter: (params) => new Date(params.value),
      valueGetter: (params) => {
        // Check if the 'value' property exists and is not undefined in the params object
        if (params && params.value !== undefined) {
          // If it exists and is not undefined, return the value as a Date object
          return new Date(params.value)
        } else {
          // If it doesn't exist or is undefined, return an empty string or null, or handle the case as appropriate
          return '' // or return null, or handle the case based on your application logic
        }
      },
    },
    {
      field: 'role',
      headerName: 'Observation',
      width: 220,
      editable: true,
      type: 'singleSelect',
      valueOptions: ['Excellent', 'Good', 'Bad'],
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Actions',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ id }) => {
        const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit

        if (isInEditMode) {
          return [
            <GridActionsCellItem
              icon={<SaveIcon />}
              label="Save"
              sx={{
                color: 'primary.main',
              }}
              onClick={handleSaveClick(id)}
            />,
            <GridActionsCellItem
              icon={<CancelIcon />}
              label="Cancel"
              className="textPrimary"
              onClick={handleCancelClick(id)}
              color="inherit"
            />,
          ]
        }

        return [
          <GridActionsCellItem
            icon={<EditIcon />}
            label="Edit"
            className="textPrimary"
            onClick={handleEditClick(id)}
            color="inherit"
          />,
          <GridActionsCellItem
            icon={<DeleteIcon />}
            label="Delete"
            onClick={handleDeleteClick(id)}
            color="inherit"
          />,
        ]
      },
    },
  ]

  const submittedColumns = [
    { field: 'memberNames', headerName: 'Member Names' },
    { field: 'share', headerName: 'Share' },
    { field: 'amount', headerName: 'Amount' },
    { field: 'solidarity', headerName: 'Solidarity' },
    { field: 'age', headerName: 'Age' },
    { field: 'assistantFund', headerName: 'Assistant Fund' },
    { field: 'assistantAmount', headerName: 'Assistant Amount' },
    { field: 'fine', headerName: 'Fine' },
    { field: 'joinDate', headerName: 'Join date' },
    { field: 'role', headerName: 'Observation' },
  ]

  React.useEffect(() => {
    const processedData =
      submittedData?.map((data, index) => ({
        id: index,
        ...data,
      })) || []

    setProcessedData(processedData)
  }, [submittedData])

  // Function to fetch previous submission totals from Firebase
  const fetchPreviousSubmissionTotals = async () => {
    try {
      const meetingsRef = collection(db, 'meetings')
      const snapshot = await getDocs(meetingsRef)

      // Initialize an object to hold previous submission totals
      const previousTotals = {
        share: 0,
        amount: 0,
        solidarity: 0,
        age: 0,
        assistantFund: 0,
        assistantAmount: 0,
        fine: 0,
      }

      // Iterate through each document in the "meetings" collection
      snapshot.forEach((doc) => {
        const data = doc.data()
        // Sum up the values for each column
        Object.keys(previousTotals).forEach((key) => {
          if (data.rows) {
            data.rows.forEach((row) => {
              previousTotals[key] += row[key] || 0
            })
          }
        })
      })

      return previousTotals
    } catch (error) {
      console.error('Error fetching previous submission totals:', error)
      return {} // Return empty object if there's an error
    }
  }

  let rowsWithFooter = [] // Declare outside the fetchPreviousSubmissionTotals.then block
  const footerRowsRef = React.useRef([])
  // Fetch previous submission totals
  React.useEffect(() => {
    fetchPreviousSubmissionTotals().then((previousSubmissionTotals) => {
      // Now you can use previousSubmissionTotals to calculate the grandTotal

      // Function to calculate the total for a specific column
      const calculateColumnTotal = (columnName) => {
        return rows.reduce((total, row) => total + (row[columnName] || 0), 0)
      }

      // Calculate the total for each column
      const columnTotals = {
        share: calculateColumnTotal('share'),
        amount: calculateColumnTotal('amount'),
        solidarity: calculateColumnTotal('solidarity'),
        age: calculateColumnTotal('age'),
        assistantFund: calculateColumnTotal('assistantFund'),
        assistantAmount: calculateColumnTotal('assistantAmount'),
        fine: calculateColumnTotal('fine'),
      }

      // Calculate the grand total for each column
      const grandTotal = {}
      Object.keys(columnTotals).forEach((columnName) => {
        // Sum up current submission and previous submissions for each column
        grandTotal[columnName] =
          calculateColumnTotal(columnName) + (previousSubmissionTotals[columnName] || 0)
      })
      console.log('value of grand total:', grandTotal)

      // Calculate available cash
      // const totalAmount = grandTotal.amount - columnTotals.fine // Total amount (excluding fines)
      // console.log('total amount', totalAmount)
      const availableCash = grandTotal.amount - grandTotal.fine // Available cash is total amount minus the amount column
      // columnsTotal.amount - columnsTotal.fine
      // const restOfFine = columnTotals.amount - columnTotals.fine
      console.log('total of the fine columns:', grandTotal.fine)
      console.log('value of available cash:', availableCash)

      footerRowsRef.current = [
        { id: 'weeklyTotal', memberNames: 'Weekly Total', ...columnTotals },
        { id: 'grandTotal', memberNames: 'Grand Total', ...grandTotal },
        { id: 'availableCash', memberNames: 'Available Cash', amount: availableCash },
      ]

      // Add footer rows to the rows array
      rowsWithFooter = rows.concat(footerRowsRef.current)
      setGridRows(rowsWithFooter) // Update the state with the new rows including footer
    })
  }, [rows, submittedData]) // Empty dependency array ensures the effect runs only once after initial render

  React.useEffect(() => {
    const flattenData = () => {
      const flattenedRows = submittedData.reduce((accumulator, currentValue) => {
        if (currentValue.rows) {
          return [...accumulator, ...currentValue.rows]
        } else {
          return [...accumulator, currentValue]
        }
      }, [])
      setFlattenedData(flattenedRows)
    }

    if (submittedData.length > 0) {
      flattenData()
      // setLoading(false);
    }
  }, [submittedData])

  return (
    <Box
      sx={{
        height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      {gridRows.length > 0 && (
        <DataGrid
          rows={gridRows}
          // rows={rowsWithFooter}
          columns={columns}
          editMode="row"
          rowModesModel={rowModesModel}
          onRowModesModelChange={handleRowModesModelChange}
          onRowEditStop={handleRowEditStop}
          processRowUpdate={processRowUpdate}
          slots={{
            toolbar: (props) => (
              <EditToolbar
                {...props}
                rows={rows}
                footerRowsRef={footerRowsRef}
                setSubmittedData={setSubmittedData}
                // rowModesModel={rowModesModel}
                // setRowModesModel={setRowModesModel}
              />
            ),
          }}
          slotProps={{
            toolbar: { setRows, setRowModesModel, submittedData, setSubmittedData },
          }}
        />
      )}

      {submittedData && submittedData.length > 0 && (
        <div style={{ height: 400, width: '100%' }}>
          <DataGrid rows={submittedData} columns={columns} pageSize={5} />
        </div>
      )}
    </Box>
  )
}
