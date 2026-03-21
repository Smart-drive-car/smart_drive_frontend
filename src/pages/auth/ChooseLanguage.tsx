import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RusFlagIcon, UzbFlagIcon } from "../../assets/icons";
import { CustomButton } from "../../components";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { i18n } = useTranslation();
  const [selectedLang, setSelectedLang] = useState("uz");

  const handleContinue = () => {
    i18n.changeLanguage(selectedLang); 
    localStorage.setItem('lang', selectedLang);
    navigate("/log-in");
  };

  return (
    <section className="containers flex items-center h-screen">
      <div className="w-80 md:min-w-100 px-3! mx-auto md:px-0">
        <div className="text-center">
          <h2 className="font-semibold text-[20px] text-[#2D2D2D]">
           Car oil ilovasiga hush kelibsiz
          </h2>
          <p className="text-[16px] text-[#7B7B7B]">Ilova tilini tanlang</p>
        </div>

        <div>
          <label className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="language"
                className="block w-5 h-5"
                checked={selectedLang === "uz"}
                onChange={() => setSelectedLang("uz")} 
              />
              <p>O'zbekcha</p>
            </div>
            <UzbFlagIcon />
          </label>

          <label className="flex items-center justify-between py-4 border-t border-[#F5F6F9]">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="language"
                className="block w-5 h-5"
                checked={selectedLang === "ru"}
                onChange={() => setSelectedLang("ru")} // ← rus
              />
              <p>Русский</p>
            </div>
            <RusFlagIcon />
          </label>
        </div>
        <CustomButton
          text="Davom etish"
          className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl!"
          onClick={handleContinue} // ← bu yerda til o'rnatiladi
        />
      </div>
    </section>
  );
};

export default LanguageSelect;
