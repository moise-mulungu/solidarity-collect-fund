import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/solidarity-collect-fund/styles/global.css'
import SolidarityCollectFund from './solidarity-collect-fund'

const root = ReactDOM.createRoot(document.getElementById('root'))
root.render(
  <React.StrictMode>
    <SolidarityCollectFund />
  </React.StrictMode>
)
