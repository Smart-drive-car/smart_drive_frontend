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

const OtpEditCode = () => {
  const [otpCode, setOtpCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const onChange: OTPProps['onChange'] = (text) => {
    console.log('onChange:', text);
    console.log('Kiritilgan OTP kod:', text);
    setOtpCode(text);
  };

  const onInput: OTPProps['onInput'] = (value) => {
    console.log('onInput:', value);
  };

  const handleVerifyOTP = async () => {
    if (otpCode.length !== 6) {
      toast.error("Kod 6 ta raqamdan iborat bo'lishi kerak")
      return
    }

    setIsLoading(true)
    try {
      const storedPhoneNumber = localStorage.getItem("new_phone_number")
      const token = Cookies.get('access_token')
      
      console.log("Yuborilayotgan ma'lumotlar:", {
        new_phone_number: storedPhoneNumber,
        code: otpCode
      })

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

      console.log("Kelgan javob:", response.data.user)
      const updatedPhoneNumber = response.data.user.phone_number
      if (updatedPhoneNumber) {
        localStorage.setItem("phone_number", updatedPhoneNumber)
      }
      toast.success("Telefon raqam muvaffaqiyatli o'zgartirildi")
      
      // Clean up temporary storage
      localStorage.removeItem("new_phone_number")
      
      // Navigate back to profile
      navigate(`/`)
    } catch (error: any) {
      console.error('OTP tasdiqlash xatoligi:', error)
      console.log("Xatolik javobi:", error.response?.data)
      toast.error(error.response?.data?.message || "Kodni tasdiqlashda xatolik")
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
          <div onClick={() => navigate(-1)} className="bg-[#F5F6F9] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer">
            <LeftOutlined className="w-3 h-3" />
          </div>
          <p className="font-medium text-[#2D2D2D]">Tahrirlash</p>
        </div>
        <form onSubmit={handleVerifyOTP}>
          <p className="text-center text-[#7B7B7B] mt-5">
            Telefon raqamingizni o'zgartirish uchun tergan raqamingizga borgan sms kodni kiriting
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
              text={isLoading ? "Tayyor.." : "Tayyor"} 
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