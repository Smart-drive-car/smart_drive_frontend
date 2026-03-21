import { useContext, useState, type ChangeEvent } from "react"
import { useNavigate } from "react-router-dom"
import { CustomButton } from "../../components"
import { useTranslation } from "react-i18next"
import axios from "axios"
import BASE_URL from "../../hooks/Env"
import { AuthContext, type AuthContextType } from "../../context/UseContext"
import { toast } from "react-toastify"


const OtpNumber = () => {
    const navigate = useNavigate()
    const [loading,setLoading] = useState(false)
    const [phone, setPhone] = useState("+998")
    
    const { t } = useTranslation()
    const {setPhoneNumber,setCode} = useContext(AuthContext) as AuthContextType;

    const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.replace(/\D/g, "")

        if (!value.startsWith("998")) {
            value = "998" + value
        }

        const numbers = value.substring(0, 12)
        let formatted = "+998"
        if (numbers.length > 3) formatted += " " + numbers.substring(3, 5)
        if (numbers.length > 5) formatted += " " + numbers.substring(5, 8)
        if (numbers.length > 8) formatted += " " + numbers.substring(8, 10)
        if (numbers.length > 10) formatted += " " + numbers.substring(10, 12)

        setPhone(formatted)
    }

    // ✅ +998 ni olib, faqat 9 ta raqamni oladi: "971921415"
    const getRawNumber = () => {
        return phone.replace(/\D/g, "").substring(3)
    }

const ForRegister = async () => {
     const rawNumber = getRawNumber()

  try{
      const  IsConfirm = window.confirm("Bu raqam bilan ro'yxatdan o'tilmagan ro'yxatdan o'tish sahifasiga yo'naltiriladi")
             if(IsConfirm){
               const res =  await   axios.post(`${BASE_URL}/api/auth/send-otp/`,{phone_number:rawNumber })
                   setCode(res.data.otp_code);
                     navigate("/send-otp")
             }
             else{
                 setLoading(false)
                 return
             }

  }
  catch(err:any){
            const msg = err.response?.data?.message || "Xatolik yuz berdi"
            toast.error(msg)
  }
  finally{
    setLoading(false)

  }

}


const ForgetPassword = () =>{
      const rawNumber = getRawNumber()
     axios.post(`${BASE_URL}/api/auth/forgot-password/`,{
                phone_number:rawNumber
            }).then(res =>{
                 setCode(res.data.otp_code);
                setLoading(false)
                navigate("/send-otp")
                
            }).catch(err =>{
                 const msg = err.response?.data?.message || "Telefon raqam noto'g'ri"
                 toast.error(msg)
                setLoading(false)

                
            })

}





// send otp 
    const handleSubmit =  (e:React.FormEvent<HTMLFormElement>) => {
        const checkNumber = localStorage.getItem("phone_number")
        e.preventDefault()
        setLoading(true)
        const rawNumber = getRawNumber()
        setPhoneNumber(rawNumber)
        if(rawNumber.length == 9 && rawNumber !== checkNumber ){
            // const  IsConfirm = window.confirm("Bu raqam bilan ro'yxatdan o'tilmagan ro'yxatdan o'tish sahifasiga yo'naltiriladi")
            // if(IsConfirm){
            //     axios.post(`${BASE_URL}/api/auth/send-otp/`,{
            //         phone_number:rawNumber
            //     }).then(res =>{
            //          setCode(res.data.otp_code);
                     
            //         setLoading(false)
            //         navigate("/send-otp")
                    
            //     }).catch(err =>{
            //         console.log(err);
            //          const msg = err.response?.data?.message || "Xatolik yuz berdi"
            //          toast.error(msg)
            //         setLoading(false)
    
                    
            //     })
            // }
            // else{
            //     setLoading(false)
            //     return
            // }
            ForRegister()
        }
        else if(rawNumber.length == 9 && rawNumber === checkNumber){
            //  axios.post(`${BASE_URL}/api/auth/forgot-password/`,{
            //     phone_number:rawNumber
            // }).then(res =>{
            //      setCode(res.data.otp_code);
            //     setLoading(false)
            //     navigate("/send-otp")
                
            // }).catch(err =>{
            //      const msg = err.response?.data?.message || "Telefon raqam noto'g'ri"
            //      toast.error(msg)
            //     setLoading(false)

                
            // })

            ForgetPassword()
        }
        else{
            toast.info(t("maydonni_toldiring"))
            setLoading(false)
        }
        
    }
    return (
        <section className="containers flex items-center justify-between h-screen">
            <div className="max-w-80 md:min-w-100 px-3 mx-auto">
                <h2 className="text-[24px] font-medium text-[#2D2D2D] text-center">{t("kirish")}</h2>
                <div className="text-center mt-6 md:mt-9">
                    <h3 className="font-medium text-[24px] text-[#2D2D2D]">{t("telefon_raqamingizni_kiriting")}</h3>
                    <p className="text-3.5 text-[#7B7B7B]">{t("sizga_tasdiqlash_kodini_SMS_orqali_yuboramiz")}</p>
                </div>
                <form onSubmit={(e) => handleSubmit(e)} className="w-full">
                    <input
                    
                        type="tel"
                        required
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="+998 90 123 45 67"
                        className="bg-[#F5F6F9] py-3 rounded-4xl pl-4 block my-9 w-full border-none outline-none"
                    />
                    <CustomButton 
                        text={loading ? t("davom__etish") : t("davom_etish")}
                        className={` ${loading ? "w-full! py-2.5 bg-blue-400! rounded-4xl!" :"w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl!"} w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl!`}
                    />
                </form>
            </div>
        </section>
    )
}

export default OtpNumber