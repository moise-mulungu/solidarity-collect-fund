import * as React from 'react'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
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
  // getGridNumericColumnOperators,
} from '@mui/x-data-grid'

import { createTheme, ThemeProvider } from '@mui/material/styles'
import { isEqual } from 'lodash'

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

const EditToolbar = ({ footerRowsRef, collectorUid, ...props }) => {
  const { setRows, setRowModesModel, setSubmittedData, rows } = props
  const [newRowId, setNewRowId] = React.useState(null)
  const [amountValue, setAmountValue] = React.useState(0)
  const [calculationAmountValue, setCalculationAmountValue] = React.useState(0)

  // Update amountValue and set calculationAmountValue
  const handleAmountValueChange = (e) => {
    const newValue = Number(e.target.value)
    setAmountValue(newValue)
    setCalculationAmountValue(newValue)
  }

  React.useEffect(() => {
    if (calculationAmountValue !== 0) {
      const newRows = rows.map((row) => ({
        ...row,
        amount: row.share * calculationAmountValue,
      }))

      if (!isEqual(rows, newRows)) {
        setRows(newRows)
      }
    }
  }, [calculationAmountValue, rows, setRows])

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
    if (!collectorUid) {
      console.error('collectorUid is undefined or null')
      return null
    }

    const collectorsRef = collection(db, 'collectors')
    const q = query(collectorsRef, where('uid', '==', collectorUid))

    try {
      const querySnapshot = await getDocs(q)
      if (querySnapshot.empty) {
        console.log('No such collector:', collectorUid)
        return null
      }

      let collectorSolidarityName = null
      querySnapshot.forEach((doc) => {
        const collectorData = doc.data()
        collectorSolidarityName = collectorData.solidarityName
        console.log('Collector solidarity name:', collectorSolidarityName)
      })

      return collectorSolidarityName
    } catch (error) {
      console.error('Error fetching collector:', error)
      throw error
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
      const solidarityName = await fetchCollectorSolidarityName(collectorUid) // Replace with actual collector UID
      console.log('fetched solidarity name:', solidarityName)

      // Use existing IDs from grid rows to maintain consistency
      const dataToSubmit = rows.map((row) => ({
        id: row.id, // Use existing ID
        memberNames: row.memberNames,
        share: row.share,
        amount: row.amount, // Update the amount field here
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
      <label className="flex items-center text-sm font-medium text-gray-700">
        <span className="mr-2">Amount value</span>
        <input
          type="number"
          value={amountValue}
          onChange={handleAmountValueChange}
          className="mt-1 flex-grow py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </label>
    </GridToolbarContainer>
  )
}

export default function WeeklyMeetingForm({ collectorUid }) {
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
        console.log('params of the weekly meeting:', params)
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
      // console.log('value of grand total:', grandTotal)

      const availableCash = grandTotal.amount - grandTotal.fine // Available cash is total amount minus the amount column

      // console.log('total of the fine columns:', grandTotal.fine)
      // console.log('value of available cash:', availableCash)

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

  const theme = createTheme({
    components: {
      MuiDataGrid: {
        styleOverrides: {
          root: {
            '& .MuiDataGrid-cell': {
              borderRight: '1px solid rgba(224, 224, 224,1)',
              textAlign: 'center',
            },
            '& .MuiDataGrid-columnHeader': {
              textAlign: 'center',
            },
          },
        },
      },
    },
  })

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
        <ThemeProvider theme={theme}>
          <DataGrid
            rows={gridRows}
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
                  collectorUid={collectorUid}
                />
              ),
            }}
            slotProps={{
              toolbar: { setRows, setRowModesModel, submittedData, setSubmittedData, collectorUid },
            }}
          />
        </ThemeProvider>
      )}

      {/* {submittedData && submittedData.length > 0 && (
        <div style={{ height: 'auto', width: '100%', display: 'flex' }}>
          <ThemeProvider theme={theme}>
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              pageSize={5}
              rowsPerPageOptions={[5]}
            />
          </ThemeProvider>
        </div>
      )} */}
    </Box>
  )
}
