import { LeftOutlined } from "@ant-design/icons"
import { useNavigate } from "react-router-dom"
import { CustomButton } from "../../components"
import type { OTPProps } from "antd/es/input/OTP";
import {  Input, Flex } from "antd"
import { useState } from "react"
import axios from "axios"
import BASE_URL from "../../hooks/Env"
import Cookies from "js-cookie"
import { toast } from "react-toastify"
import { useTranslation } from "react-i18next"

const OtpEditCode = () => {
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { t } = useTranslation()

  const onChange: OTPProps['onChange'] = (text) => {
    setOtpCode(text);
  };

  const onInput: OTPProps['onInput'] = () => {};

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error(t("Kod_xato_qayta_urinib_koring"))
      return
    }

    setIsLoading(true)
    try {
      const storedPhoneNumber = localStorage.getItem("new_phone_number")
      const token = Cookies.get('access_token')

      const response = await axios.post(
        `${BASE_URL}/api/auth/profile/change-phone/verify-otp/`,
        { 
          new_phone_number: storedPhoneNumber,
          code: otpCode 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      )

      const updatedPhoneNumber = response.data.user.phone_number
      if (updatedPhoneNumber) {
        // ✅ Bir xil kalit bilan saqlaymiz
        localStorage.setItem("phone_number", updatedPhoneNumber)

        // ✅ WorkshopHeader tinglaydigan eventni jo‘natamiz
        window.dispatchEvent(new CustomEvent('profileUpdate', {
          detail: { type: 'phone_number', value: updatedPhoneNumber }
        }))
      }
      toast.success(t("muvaffaqqiyatli_otildi"))
      
      // Vaqtinchalik ma'lumotni tozalaymiz
      localStorage.removeItem("new_phone_number")
      
      // Profilga qaytamiz
      navigate(`/`)
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("xatolik_yuz_berdi"))
    } finally {
      setIsLoading(false)
    }
  }

  const sharedProps: OTPProps = {
    onChange,
    onInput,
  };

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-40" />
      <section className="fixed z-50 right-30 top-20.5 w-93.75 rounded-[20px] bg-white p-4 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-16">
          <div onClick={() => navigate(-1)} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); navigate(-1); } }} role="button" tabIndex={0} className="bg-[#F5F6F9] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer">
            <LeftOutlined className="w-3 h-3" />
          </div>
          <p className="font-medium text-[#2D2D2D]">{t("settings")}</p>
        </div>
        <form onSubmit={handleVerifyOTP}>
          <p className="text-center text-[#7B7B7B] mt-5">
            {t("kodni_kiriting")}
          </p>
           <Flex gap="small" align="center" justify="center" vertical>
            <Input.OTP
                className={`
                    my-5
                    [&_input]:rounded-full!
                    [&_input]:w-10!
                    [&_input]:h-10!
                    md:[&_input]:w-12!
                    md:[&_input]:h-12!
                    [&_input]:bg-[#F5F6F9]!
                    [&_input]:text-[16px]!
                    [&_input]:font-semibold!
                    [&_input]:border!
                    [&_input]:border-[#E0E0E0]!
                    [&_input]:focus:border-2!
                    [&_input]:shadow-none!
                    [&_input]:outline-none!
                `}
                length={6}
                formatter={(str) => str.toUpperCase()}
                {...sharedProps}
            />
        </Flex>
          <div className="flex justify-end mt-4">
            <CustomButton 
              onClick={handleVerifyOTP}
              text={isLoading ? t("tayyor__") : t("tayyor")} 
              className={`w-30 py-2.5 rounded-4xl ${isLoading ? 'bg-blue-400' : ''}`}
              disabled={isLoading}
            />
          </div>
        </form>
      </section>
    </>
  )
}

export default OtpEditCode