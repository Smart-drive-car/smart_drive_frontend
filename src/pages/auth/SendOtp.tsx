import React, { useContext, useState, useEffect } from "react";
import { Flex, Input } from "antd";
import type { GetProps } from "antd";
import { AuthContext, type AuthContextType } from "../../context/UseContext";
import { useNavigate } from "react-router-dom";
import { CustomButton } from "../../components";
import { useTranslation } from "react-i18next";
import { ResetPasswordIcon } from "../../assets/icons";
import axios from "axios";
import BASE_URL from "../../hooks/Env";
import { toast } from "react-toastify";

type OTPProps = GetProps<typeof Input.OTP>;

const SendOtp: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { phoneNumber, setCode,code, setResetToken, isForgotPassword } = useContext(
    AuthContext,
  ) as AuthContextType;
  const [trueCode, setTrueCode] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(59);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(code,"code");

  // ⏱ Taymer
  useEffect(() => {
    if (timer === 0) {
      setCanResend(true);
      return;
    }
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // 🔁 Qayta yuborish
  const handleResend = () => {
    if (!canResend) return;
    setTimer(59);
    setCanResend(false);
    setTrueCode(null);

    axios
      .post(`${BASE_URL}/api/auth/send-otp/`, {
        phone_number: phoneNumber,
      })
      .then((res) => {
        setCode(res.data.otp_code);
      })
      .catch(() => {
        toast.error(t("kodni_qayta_yuborishda_xatolik"));
      });
  };


  // ✅ OTP tekshirish
  const onChange: OTPProps["onChange"] = async (text) => {
    if (text.length < 6) {
      setTrueCode(null);
      return;
    }

    setLoading(true);
    if (isForgotPassword) {
      try {
        const data = {
          phone_number: phoneNumber,
          code: text,
        }
        const res = await axios.post(`${BASE_URL}/api/auth/verify-forgot-password/`, data)
        setResetToken(res.data.reset_token);
        setTrueCode(true);
        setTimeout(() => {
          navigate("/reset-password");
        }, 500);
      } catch(err:any){
        const status = err.response?.status
        
        if (status === 400 || status === 404) {
          setTrueCode(false);
          toast.error(t("Kod_xato_qayta_urinib_koring"));
        } else {
          toast.error(err.response?.data?.message || t("xatolik_yuz_berdi"));
        }
      }
      finally{
        setLoading(false);
      }
    } else {
      try {
        const data = {
          phone_number: phoneNumber,
          code: text,
        }
        const res = await axios.post(`${BASE_URL}/api/auth/verify-otp/`, data)
          setCode(res.data.otp_code);
        setTrueCode(true);
        // Telefon raqamni sessionStorage'da saqlash
        sessionStorage.setItem('verified_phone', phoneNumber);
        setTimeout(() => {
          navigate("/choose-role");
        }, 500);
      } catch(err:any){
        setTrueCode(false);
        toast.error(t("Kod_xato_qayta_urinib_koring"));
      }
      finally{
        setLoading(false);
      }
    }

  };

  const onInput: OTPProps["onInput"] = () => {
  };


  const sharedProps: OTPProps = { onChange, onInput };

  // 🎨 Input rangi
  const inputColorClass =
    trueCode === false
      ? "[&_input]:text-[#E30000]!"
      : "[&_input]:text-[#2D2D2D]!";

  return (
   <section className="w-full px-4 md:px-0 md:max-w-100 mx-auto flex flex-col justify-center min-h-screen items-center text-center">
    <h2 className="text-[20px] md:text-[24px] font-medium text-[#2D2D2D] text-center">
        {t("kirish")}
    </h2>

    <div className="text-center my-4 md:my-9">
        <h3 className="text-[20px] md:text-[24px] font-medium text-[#2D2D2D]">
            {t("kodni_kiriting")}
        </h3>
        <p className="text-[13px] md:text-[14px] text-[#7B7B7B] mt-1">
            <strong className="text-[14px] font-semibold text-[#2D2D2D]">
                +998 {phoneNumber}
            </strong>{" "}
            {t("raqamiga_yuborilgan_5_xonali_kodni_kiriting")}
        </p>
    </div>

    <div className="my-4 md:my-9 w-full">
        <Flex gap="small" align="center" justify="center" vertical>
            <Input.OTP
                className={`
                    ${inputColorClass}
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
                    [&_input]:focus:border-[#1E5DE5]!
                    [&_input]:focus:border-2!
                    [&_input]:shadow-none!
                    [&_input]:outline-none!
                    [&_input]:hover:border-[#1E5DE5]!
                `}
                length={6}
                formatter={(str) => str.toUpperCase()}
                {...sharedProps}
            />

            {canResend ? (
                <div
                    className="flex items-center gap-1 text-blue-500 cursor-pointer hover:opacity-80 transition mt-3"
                    onClick={handleResend}
                >
                    <p className="text-[14px]">{t("kodni_qayta_yuborish")}</p>
                    <ResetPasswordIcon />
                </div>
            ) : (
                <p className="text-[#7B7B7B] text-[14px] mt-3">
                    {t("kodni_qayta_yuborish")}{" "}
                    <span className="text-[#3775FF] font-medium">
                        00:{timer.toString().padStart(2, "0")}
                    </span>
                </p>
            )}
        </Flex>
    </div>

    <p className="text-[#7B7B7B] text-[12px] md:text-[14px] px-2">
        {t("agar_kod_kelmasa_siz_60_soniya_ichida_yangisini_olishingiz_mumkin")}.
    </p>

    <CustomButton
        text={loading ? t("davom__etish") : t("davom_etish")}
        disabled={loading}
        className={`${loading ? "bg-blue-400!" : "bg-[#1E5DE5]!"} w-full! py-2.5 rounded-4xl! mt-4!`}
    />
</section>
  );
};

export default SendOtp;
