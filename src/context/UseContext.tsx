import { createContext,  useState, } from 'react'
import type { ReactNode } from 'react'

interface User {
  id: number
  phoneNumber: string
  code:string
  full_name?: string
}

export interface AuthContextType {
  user?: User | null
  token?: string | null
  isLoading?: boolean
  login?: (token: string, user: User) => void
  logout?: () => void
  phoneNumber:string
  code:string
  selectRole:string
  names:string,
  password:string
  resetToken:string
  isForgotPassword:boolean
  setResetToken:React.Dispatch<React.SetStateAction<string>>
  setCode:React.Dispatch<React.SetStateAction<string>>
  setPhoneNumber:React.Dispatch<React.SetStateAction<string>>
  setSelectRole:React.Dispatch<React.SetStateAction<string>>
  setNames:React.Dispatch<React.SetStateAction<string>>
  setPassword:React.Dispatch<React.SetStateAction<string>>
  setIsForgotPassword:React.Dispatch<React.SetStateAction<boolean>>
}

export const AuthContext = createContext<AuthContextType | null>(null)

 const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [phoneNumber,setPhoneNumber] = useState("")
    const [code,setCode] = useState("")
     const [selectRole,setSelectRole] = useState("")
     const [names,setNames] = useState("")
    const [password,setPassword] = useState("")
    const [resetToken,setResetToken] = useState("")
    const [isForgotPassword,setIsForgotPassword] = useState(false)
    


  return (
    <AuthContext.Provider value={{phoneNumber,setPhoneNumber,code,setCode,selectRole,setSelectRole,names,setNames,password,setPassword,resetToken,setResetToken,isForgotPassword,setIsForgotPassword}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
