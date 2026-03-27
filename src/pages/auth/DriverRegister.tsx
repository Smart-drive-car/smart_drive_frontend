import { ArrowLeftOutlined } from "@ant-design/icons"
import { CustomButton } from "../../components"
import { useNavigate } from "react-router-dom"
import { useTranslation } from "react-i18next"
import { useContext } from "react"
import { AuthContext, type AuthContextType } from "../../context/UseContext"


const DriverRegister = () => {
    const navigate = useNavigate()
    const {t} = useTranslation()
    const {names, password, setNames, setPassword} = useContext(AuthContext) as AuthContextType
   

    
  return (
    <section className="flex items-center h-screen ">
      <div className="w-80 md:w-100 px-3 md:px-0 mx-auto text-center">
        <div className=" flex items-center gap-2 px-3 w-35 bg-[#E4ECFE] rounded-4xl text-[#1E5DE5]">
            <ArrowLeftOutlined className="w-2.5 h-2"/>
           <p>{t("haydovchi")}</p>
        </div>
        <p className="text-[#2D2D2D] text-[14px] mt-5 mb-10">{t("fill_profile")}</p>
         <form >
            <label className='flex flex-col gap-1'>
            <span className='text-[12px] text-[#2D2D2D] outline-none text-start pl-2'>{t("ismingizni_kiriting")}</span>
            <input onChange={(e) => setNames(e.target.value)}
              type="text" 
              placeholder={t("ism")} 
              className='py-2.5 pl-4  bg-[#F5F6F9] text-[#2D2D2D] rounded-4xl outline-none' 
              value={names}
            />
          </label>
            <label className='flex flex-col gap-1 mt-4'>
            <span className='text-[12px] text-[#2D2D2D] outline-none text-start pl-2'>{t("parolni_kiriting")}</span>
            <input onChange={(e) => setPassword(e.target.value)}
              type="password" 
              placeholder={t("parol")} 
              className='py-2.5 pl-4  bg-[#F5F6F9] text-[#2D2D2D] rounded-4xl outline-none' 
              value={password}
            />
          </label>
           <CustomButton text={t("tayyor")} className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-9" onClick={() => navigate("/reenter-password")}/>
         </form>
      </div>
    </section>
  )
}

export default DriverRegister
