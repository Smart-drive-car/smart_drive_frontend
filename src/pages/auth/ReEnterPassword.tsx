import { useNavigate } from "react-router-dom"
import { CustomButton } from "../../components"
import { useTranslation } from "react-i18next"
import { useContext, useState } from "react"
import { AuthContext, type AuthContextType } from "../../context/UseContext"
import axios from "axios"
import BASE_URL from "../../hooks/Env"
import Cookies from 'js-cookie'
import { toast } from "react-toastify"


const ReEnterPassword = () => {
    const navigate = useNavigate()
    const {t} = useTranslation()
    const [resetPassword ,setResetPassword] = useState("")
    const [loading,setloading] = useState(false)
    const {names} = useContext(AuthContext) as AuthContextType
    const {password} = useContext(AuthContext) as AuthContextType
    const {selectRole} = useContext(AuthContext) as AuthContextType
    const {phoneNumber} = useContext(AuthContext) as AuthContextType
    console.log(names);
    console.log(password);
    console.log(selectRole);
    console.log(phoneNumber);
    
// request api 
  const handleSubmit =(e:React.FormEvent<HTMLFormElement>) =>{
    setloading(true)
    e.preventDefault()
    if(resetPassword == password){
      toast.success(t("parol_togri"))
      localStorage.setItem("phone_number",phoneNumber)
      const formDate = new FormData()
      
      formDate.append("phone_number",phoneNumber)
      formDate.append("full_name",names)
      formDate.append("password",password)
      formDate.append("password_confirm",resetPassword)
      formDate.append("role",selectRole)
      
      axios.post(`${BASE_URL}/api/auth/register/`, formDate).then(res =>{
        console.log(res.data.tokens);
        setloading(false)
        Cookies.set('access_token', res.data.tokens.access, { expires: 7 })
        Cookies.set('refresh_token', res.data.tokens.refresh, { expires: 30 })
        navigate("/dashboard")
        
       }).catch(err =>{
        setloading(false)
        toast.error(t("bu_telefon_raqamiga_ega_foydalanuvchi_allaqachon_mavjud"))
        console.log("Xato:", err) 
        
       })
    }
    else{

      toast.error(t("parol_mos_emas"))
      setloading(false)
    }

  }
    
    
  return (
    <section className="flex items-center h-screen ">
      <div className="w-80 md:w-100 mx-auto px-3 md:px-0 text-center">
        <p className="#2D2D2D">{t("fill_profile")}</p>
        <form onSubmit={(e) => handleSubmit(e)}>
               <label className='flex flex-col gap-1 mt-4'>
            <span className='text-[12px] text-[#7B7B7B] outline-none text-start pl-2'>{t("parolinizni_qayta_kiriting")}</span>
            <input onChange={(e) => setResetPassword(e.target.value)}
              type="password" 
              placeholder={t("parol")} 
              className='py-2.5 pl-4  bg-[#F5F6F9] text-[#2D2D2D] rounded-4xl outline-none' 
            />
          </label>
           <CustomButton type="submit" text={ loading ? t("tayyor__") : t("tayyor")} className={` ${loading  ? "w-full! py-2.5 bg-blue-400! rounded-4xl! mt-6 md:mt-9":"w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-6 md:mt-9"} `}/>
        </form>
      </div>
    </section>
  )
}

export default ReEnterPassword
