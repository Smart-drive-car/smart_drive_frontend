import { Navigate, Route, Routes } from "react-router-dom"
import { ChooseLanguage, ChooseRole, Dashboard, DriverRegister, LogInPages, OtpNumber, ResetPassword, SendOtp } from "../pages"
import ReEnterPassword from "../pages/auth/ReEnterPassword"



const AppRoutes = ({token}:{token:boolean}) => {
  return (
    <div className="containers">
       
    <Routes>
      {
        token ? (
          <>
           <Route path="/dashboard" element ={<Dashboard/>}/>
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </>
        ) : (
          <>
            <Route path="/" element={<ChooseLanguage/>}/>
            <Route path="/otp-number" element={<OtpNumber/>}/>
            <Route path="/send-otp" element ={<SendOtp/>}/>
            <Route path="/log-in" element ={<LogInPages/>}/>
            <Route path="/choose-role" element ={<ChooseRole/>}/>
            <Route path="/driver-register" element ={<DriverRegister/>}/>
            <Route path="/reenter-password" element ={<ReEnterPassword/>}/>
            <Route path="/reset-password" element ={<ResetPassword/>}/>
          </>
        )
      }
    </Routes>
    </div>
  )
}

export default AppRoutes
