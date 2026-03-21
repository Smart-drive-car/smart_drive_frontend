
import { DriverIcon, MechanicIcon } from "../../assets/icons"
import { CustomButton } from "../../components"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useContext } from "react"
import { AuthContext, type AuthContextType } from "../../context/UseContext"


const ChooseRole = () => {
  const navigate = useNavigate()
  const {t} = useTranslation()
  const {selectRole,setSelectRole} = useContext(AuthContext) as AuthContextType
  console.log(selectRole);
  
  
  return (
    <section className="flex items-center h-screen ">
       <div className="max-w-80 px-3 md:px-0 md:min-w-100 mx-auto text-center">
         <h2 className="font-medium text-[20px] text-[#2D2D2D]">{t("siz_platformaga_qanday_qo‘shilasiz")}</h2>
         <div className="flex flex-col gap-2 mt-6">
          <label className={`w-full flex justify-between items-center py-4 px-4 rounded-3xl   ${selectRole == "WORKSHOP" ? "bg-[#E4ECFE]" :"bg-[#F5F6F9]"}`} >
            <div className="flex  items-center gap-3">
              <MechanicIcon/>
               <p className="font-medium">{t("mexanik")}</p>
            </div>
            <input onChange={() => setSelectRole("WORKSHOP")} type="radio" name="role" className="w-5 h-5" />
          </label>
          <label className={`w-full py-4 px-4 flex justify-between items-center rounded-3xl   ${selectRole == "DRIVER" ? "bg-[#E4ECFE]" : "bg-[#F5F6F9]" }`} >
            <div className="flex items-center gap-3">
              <DriverIcon/>
               <p className="font-medium">{t("haydovchi")}</p>
            </div>
            <input onChange={() =>setSelectRole("DRIVER")} type="radio" name="role" className="w-5 h-5" />
          </label>
            <CustomButton type="submit" text={t("davom_etish")} className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl!  mt-9" onClick={() => navigate( selectRole == "DRIVER" ? "/driver-register" :"/workshop-register")}/>
         </div>
       </div>
    </section>
  )
}

export default ChooseRole
