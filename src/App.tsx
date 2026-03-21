import { useState, useEffect } from 'react'
import Cookies from 'js-cookie'
import AppRoutes from "./routes/AppRoutes"

function App() {
  // const [token, setToken] = useState(!!Cookies.get('access_token'))

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setToken(!!Cookies.get('access_token'))
  //   }, 500) 

  //   return () => clearInterval(interval)
  // }, [])

  const token = false
  return <AppRoutes token={token} />
}

export default App