import React from "react";
import { Input } from "antd";
import { CustomButton } from "../../components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext } from "react";
import { AuthContext, type AuthContextType } from "../../context/UseContext";

const WorkshopPassword: React.FC = () => {
  const [passwordVisible, setPasswordVisible] = React.useState(false);
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const navigate = useNavigate()
  const {t} = useTranslation()
  const {  setWorkshopPassword, setWorkshopPasswordConfirm } = useContext(AuthContext) as AuthContextType;

  const handleContinue = () => {
    if (!password) {
      setError(t("parol_to'liq_emas"));
      return;
    }
    if (password !== confirmPassword) {
      setError(t("parollar_mos_kelmaydi"));
      return;
    }
    if (password.length < 6) {
      setError(t("parol_kamida_6_belgi"));
      return;
    }
    setWorkshopPassword(password);
    setWorkshopPasswordConfirm(confirmPassword);
    navigate("/workshop-media-location");
  };

  return (
    <section className="flex items-center h-screen">
      <div className="w-80 md:w-100 mx-auto">
        <p>
          {t("fill_profile")}
        </p>
        <form className="mt-6 flex flex-col gap-3" onSubmit={(e) => { e.preventDefault(); handleContinue(); }}>
          <span className="text-[12px] text-[#7B7B7B] pl-3">
            {t("parolni_kiriting")}
          </span>
          <Input.Password
            placeholder={t("placeholder_password")}
            className="py-3.5! pl-4! bg-[#F5F6F9]! rounded-4xl! text-[#2D2D2D]!    border-none! shadow-none!
    hover:border-none! hover:shadow-none! hover:outline-none!
    focus:border-none! focus:shadow-none! focus:outline-none!
    focus-within:border-none! focus-within:shadow-none! focus-within:outline-none!"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError(""); }}
            visibilityToggle={{
              visible: passwordVisible,
              onVisibleChange: setPasswordVisible,
            }}
          />
          <span className="text-[12px] text-[#7B7B7B] pl-3">
            {t("parolinizni_qayta_kiriting")}
          </span>
          <Input.Password
            placeholder={t("placeholder_password_confirm")}
            className="py-3.5! pl-4! bg-[#F5F6F9]! rounded-4xl! text-[#2D2D2D]! outline-none!
                 border-none! shadow-none!
    hover:border-none! hover:shadow-none! hover:outline-none!
    focus:border-none! focus:shadow-none! focus:outline-none!
    focus-within:border-none! focus-within:shadow-none! focus-within:outline-none!"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); setError(""); }}
            visibilityToggle={{
              visible: passwordVisible,
              onVisibleChange: setPasswordVisible,
            }}
          />
          {error && <span className="text-red-500 text-sm pl-3">{error}</span>}
           <CustomButton onClick={handleContinue}
             text={t("tayyor")}
             className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-6 md:mt-9"
           />
        </form>
      </div>
    </section>
  );
};

export default WorkshopPassword;
