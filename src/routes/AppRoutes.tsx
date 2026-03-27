import { Navigate, Route, Routes } from "react-router-dom"
import { ChooseLanguage, ChooseRole, Dashboard, DriverRegister, LogInPages, 
  OtpEditCode, 
  OtpNumber, PhoneNumberEdit, RegisterImagesPages, RegisterLocationPages, ResetPassword, SendOtp, WorkshopMediaLocation, WorkshopPassword, WorkshopRegister } from "../pages"
import ReEnterPassword from "../pages/auth/ReEnterPassword"
import SearchPages from "../pages/Dashboard/SearchPages"



const AppRoutes = ({token}:{token:boolean}) => {
  return (
    <div className="containers">
       
    <Routes>
      {
        token ? (
          <>
            <Route path="/" element={<Dashboard />}>
              <Route path="/search-pages" element={<SearchPages />} />
              <Route path="/phone-number-edit" element ={<PhoneNumberEdit/>}/>
              <Route path="/otp-edit-code" element ={<OtpEditCode/>}/>
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
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
            <Route path="/workshop-register" element ={<WorkshopRegister/>}/>
            <Route path="/workshop-password" element ={<WorkshopPassword/>}/>
            <Route path="/workshop-media-location" element ={<WorkshopMediaLocation/>}/>
            <Route path="/register-img-pages" element ={<RegisterImagesPages/>}/>
            <Route path="/register-location-pages" element ={<RegisterLocationPages/>}/>
          
          </>
        )
      }
    </Routes>
    </div>
  )
}

export default AppRoutes
