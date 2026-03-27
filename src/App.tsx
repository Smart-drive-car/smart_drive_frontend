import { useState, useEffect } from 'react'
import AppRoutes from "./routes/AppRoutes"
import { getAccessToken } from "./services/authTokens"

function App() {
  const [token, setToken] = useState(!!getAccessToken())

  useEffect(() => {
    const onAuthChanged = () => setToken(!!getAccessToken())
    window.addEventListener("auth:changed", onAuthChanged)
    // In case token was set before listener attached
    onAuthChanged()
    return () => window.removeEventListener("auth:changed", onAuthChanged)
  }, [])



  return <AppRoutes token={token} />
}

export default App