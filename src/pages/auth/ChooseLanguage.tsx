import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RusFlagIcon, UzbFlagIcon } from "../../assets/icons";
import { CustomButton } from "../../components";

const LanguageSelect = () => {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();  // ← ikkalasini bitta yerdan ol
  const [selectedLang, setSelectedLang] = useState(
    localStorage.getItem('lang') || "uz"  // ✅
)

  const handleContinue = () => {
    localStorage.setItem('lang', selectedLang);
    i18n.changeLanguage(selectedLang);
    navigate("/log-in");
  };

  return (
    <section className="containers flex items-center h-screen">
      <div className="w-80 md:min-w-100 px-3! mx-auto md:px-0">
        <div className="text-center">
          <h2 className="font-semibold text-[20px] text-[#2D2D2D]">
            {t("welcome")}
          </h2>
          <p className="text-[16px] text-[#7B7B7B]">{t("lang")}</p>
        </div>

        <div>
          <label className="flex items-center justify-between py-4">
            <div className="flex items-center gap-3">
              <input
                type="radio"
                name="language"
                className="block w-5 h-5"
                checked={selectedLang === "uz"}
                onChange={() => {
                  setSelectedLang("uz")
                  i18n.changeLanguage("uz")
                }}
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
                onChange={() => {
                  setSelectedLang("ru")
                  i18n.changeLanguage("ru")
                }}
              />
              <p>Русский</p>
            </div>
            <RusFlagIcon />
          </label>
        </div>

        <CustomButton
          text={t("davom_etish")}
          className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl!"
          onClick={handleContinue}
        />
      </div>
    </section>
  );
};

export default LanguageSelect;