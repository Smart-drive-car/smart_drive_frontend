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
  const { phoneNumber, code, setCode,setResetToken } = useContext(
    AuthContext,
  ) as AuthContextType;
  const [trueCode, setTrueCode] = useState<boolean | null>(null);
  const [timer, setTimer] = useState(20);
  const [canResend, setCanResend] = useState(false);
  const [loading, setLoading] = useState(false);
  console.log(code);
  

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
        console.log(res.data.otp_code);
      })
      .catch((err) => {
        console.log(err);
        toast.error(t("kodni_qayta_yuborishda_xatolik"));
      });
  };

  // ✅ OTP tekshirish
  const onChange: OTPProps["onChange"] = (text) => {
    if (text.length < 6) {
      setTrueCode(null);
      return;
    }

    setLoading(true);
    const checkNumber = localStorage.getItem("phone_number")
   
    

    if (checkNumber !== phoneNumber) {
      axios
        .post(`${BASE_URL}/api/auth/verify-otp/`, {
          phone_number: phoneNumber,
          code: text,
        })
        .then((res) => {
          console.log(res.data.otp_code);
          setCode(res.data.otp_code);

          setLoading(false);
          setTrueCode(true);
          setTimeout(() => {
            navigate("/choose-role");
          }, 500);
        })
        .catch((err) => {
          setLoading(false);
          setTrueCode(false);
          console.log(err);
          toast.error(t("Kod_xato_qayta_urinib_koring"));
        });
    } else if(checkNumber === phoneNumber) {
      axios
        .post(`${BASE_URL}/api/auth/verify-forgot-password/`, {
          phone_number: phoneNumber,
          code:String(code), 
        })
        .then((res) => {
          console.log(res.data.reset_token);
          setResetToken(res.data.reset_token)
          navigate("/reset-password")
        }).catch(err =>{
          toast.error(err.message)
          console.log(err);
          
        })

    }
  };

  const onInput: OTPProps["onInput"] = (value) => {
    console.log("onInput:", value);
  };

  const sharedProps: OTPProps = { onChange, onInput };

  // 🎨 Input rangi
  const inputColorClass =
    trueCode === false
      ? "[&_input]:text-[#E30000]!"
      : "[&_input]:text-[#2D2D2D]!";

  return (
    <section className="max-w-80 md:min-w-100 px-3 md:px-0 mx-auto flex flex-col justify-center h-screen items-center text-center">
      <h2 className="text-[24px] font-medium text-[#2D2D2D] text-center">
        {t("kirish")}
      </h2>
      <div className="text-center my-6 md:my-9">
        <h3 className="text-[24px] font-medium text-[#2D2D2D]">
          {t("kodni_kiriting")}
        </h3>
        <p>
          <strong className="text-[14px] font-semibold">
            +998 {phoneNumber}
          </strong>{" "}
          {t("raqamiga_yuborilgan_5_xonali_kodni_kiriting")}
        </p>
      </div>

      <div className="my-6 md:my-9">
        <Flex gap="medium" align="center" justify="center" vertical>
          <Input.OTP
            className={`${inputColorClass} [&_input]:rounded-full! [&_input]:w-12! [&_input]:h-12! [&_input]:focus:border-none [&_input]:shadow-none! [&_input]:hover:border-none [&_input]:bg-[#F5F6F9]`}
            length={6}
            formatter={(str) => str.toUpperCase()}
            {...sharedProps}
          />

          {canResend ? (
            <div
              className="flex items-center gap-1 text-blue-500 cursor-pointer hover:opacity-80 transition"
              onClick={handleResend}
            >
              <p>Kodni qayta yuborish</p>
              <ResetPasswordIcon />
            </div>
          ) : (
            <p className="text-[#7B7B7B]">
              Kodni qayta yuborish{" "}
              <span className="text-[#3775FF] font-medium">
                00:{timer.toString().padStart(2, "0")}
              </span>
            </p>
          )}
        </Flex>
      </div>

      <p className="text-[#7B7B7B]">
        {t("agar_kod_kelmasa_siz_60_soniya_ichida_yangisini_olishingiz_mumkin")}
        .
      </p>

      <CustomButton
        text={loading ? t("davom__etish") : t("davom_etish")}
        className={`${loading ? "bg-blue-400!" : "bg-[#1E5DE5]!"} w-full! py-2.5 rounded-4xl! mt-3!`}
      />
    </section>
  );
};

export default SendOtp;
