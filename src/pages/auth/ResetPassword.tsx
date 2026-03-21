import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons"
import { Input, Space } from "antd"
import { CustomButton } from "../../components"
import { useTranslation } from "react-i18next"
import { useContext, useState, type ChangeEvent } from "react"
import { AuthContext, type AuthContextType } from "../../context/UseContext"
import axios from "axios"
import BASE_URL from "../../hooks/Env"
import { toast } from "react-toastify"
import { useNavigate } from "react-router-dom"


const ResetPassword = () => {

    const {t} =  useTranslation()
    const {resetToken} = useContext(AuthContext) as AuthContextType;
    const [newPassword,setNewPassword] = useState("")
    const [loading,setLoading] = useState(false)
    const navigate = useNavigate()




  const handleSubmit =(e:ChangeEvent<HTMLFormElement, Element>) =>{
    e.preventDefault()
    setLoading(true)
    console.log(newPassword,"yangi parol");
    console.log(resetToken,"code");
    if(newPassword >= "8"){
        const data = {
            reset_token:resetToken,
            new_password:newPassword
        }
        axios.post(`${BASE_URL}/api/auth/password-reset/`,data).then(() =>{
            toast.success(t("parol_tiklandi"))
            setLoading(false)
            navigate("/log-in")
            
            
        }).catch(err =>{
            setLoading(false)
            toast.error(t("parol_to'liq_emas"))
            console.log(err);
        })
    }
    else{
        toast.error(t("parol_8_ta_bolishi_kerak"))
        return
    }

  }
    
  return (
    <section className="flex items-center h-screen text-center ">
        <div className="w-80 md:w-100! mx-auto px-3 md:0">
            <h2 className="text-[25px] font-medium text-[#2D2D2D]">{t("kirish")}</h2>
            <div className="my-6 md:my-9">
                <h3 className="text-[25px] font-medium text-[#2D2D2D]">{t("parolingizni_yozing")}</h3>
                <p className="text-[#7B7B7B] text-[14px]">{t("Bu_yerda_parolga_oid_text_yoziladi")}</p>
            </div>
            <form onSubmit={(e) => handleSubmit(e)}>
                <span  className="block text-start text-[12px] pl-3 text-[#2D2D2D]">{t("parol")}*</span>
                 <Space vertical className="w-full!">
                        <Input.Password onChange={(e) =>setNewPassword(e.target.value) } className="py-2.5! pl-4! bg-[#F5F6F9]! rounded-4xl! text-[16px] w-full!"
                            placeholder="s45ds86"
                            required
                            iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                        />
                 </Space>
                   <span className="block text-start text-[12px] pl-3 text-[#2D2D2D] mt-2.5">{t("eng_kamida_8_ta_belgi")}*</span>
                     <CustomButton type="submit"
                        text={loading ? t("davom__etish") : t("davom_etish")}
                        className={ ` ${loading ? "bg-blue-400! w-full! py-2.5 rounded-4xl! mt-6 md:mt-9" : "w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-6 md:mt-9"} `}
                    />
            </form>

        </div>
      
    </section>
  )
}

export default ResetPassword
