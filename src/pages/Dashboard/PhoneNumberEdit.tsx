import { LeftOutlined } from "@ant-design/icons"
import { CustomButton } from "../../components"
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import axios from "axios"
import BASE_URL from "../../hooks/Env"
import Cookies from "js-cookie"
import { toast } from "react-toastify"

const formatPhoneNumber = (value: string) => {
  const digits = value.replace(/\D/g, '').slice(0, 9)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)} ${digits.slice(2)}`
  if (digits.length <= 7) return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`
  return `${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`
}

const PhoneNumberEdit = () => {
  const navigate = useNavigate()

  const [newPhoneNumber, setNewPhoneNumber] = useState(() => {
    const stored = localStorage.getItem("phone_number") || ""
    const digits = stored.replace(/\D/g, '').slice(-9)
    return formatPhoneNumber(digits)
  })

  const [isLoading, setIsLoading] = useState(false)

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewPhoneNumber(formatPhoneNumber(e.target.value))
  }

  const handleSendOTP = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const digitsOnly = newPhoneNumber.replace(/\s/g, '')
    if (digitsOnly.length !== 9) {
      toast.error("Telefon raqam 9 ta raqamdan iborat bo'lishi kerak")
      return
    }
    const fullPhoneNumber = '+998' + digitsOnly
    setIsLoading(true)
    try {
      const token = Cookies.get('access_token')
     const res =  await axios.post(
        `${BASE_URL}/api/auth/profile/change-phone/send-otp/`,
        { new_phone_number: fullPhoneNumber },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      console.log(res.data);
      
      toast.success("OTP yuborildi")
      localStorage.setItem("new_phone_number", fullPhoneNumber)
      navigate("/otp-edit-code")
    } catch (error: any) {
      toast.error(error.response?.data?.message || "OTP yuborishda xatolik")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-40" />
      <section className="fixed z-50 right-30 top-20.5 w-93.75 rounded-[20px] bg-white p-4">
        <div className="flex items-center gap-3 mb-16">
          <div
            onClick={() => navigate(-1)}
            className="bg-[#F5F6F9] w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          >
            <LeftOutlined className="w-3 h-3" />
          </div>
          <p className="font-medium text-[#2D2D2D]">Tahrirlash</p>
        </div>
        <form onSubmit={handleSendOTP}>
          <div className="flex items-center bg-[#F5F6F9] rounded-[70px] px-4">
            <span className="text-gray-600 shrink-0">+998</span>
            <input
              type="tel"
              value={newPhoneNumber}
              onChange={handlePhoneNumberChange}
              required
              placeholder="XX XXX XX XX"
              maxLength={12}
              className="py-2.5 pl-2 bg-transparent w-full outline-none"
            />
          </div>
          <div className="flex justify-end mt-4">
            <CustomButton
              onClick={handleSendOTP}
              text={isLoading ? "Tayyor..." : "Tayyor"}
              className={`w-30 py-2.5 rounded-4xl ${isLoading ? 'opacity-60' : ''}`}
              disabled={isLoading}
            />
          </div>
        </form>
      </section>
    </>
  )
}

export default PhoneNumberEdit