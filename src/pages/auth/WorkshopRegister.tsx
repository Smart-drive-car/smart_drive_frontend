import { ArrowLeftOutlined } from "@ant-design/icons";
import { CustomButton } from "../../components";
import { useTranslation } from "react-i18next";
import { useState, useRef, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, type AuthContextType } from "../../context/UseContext";

const WorkshopRegister = () => {
  const { t } = useTranslation();
  const {  workshopTitle, setWorkshopTitle, workshopAddress, setWorkshopAddress, workshopDescription, setWorkshopDescription, workshopWorkingTime, setWorkshopWorkingTime } = useContext(AuthContext) as AuthContextType;

  const [startTime, setStartTime] = useState(workshopWorkingTime?.split(" - ")[0] || "08:00");
  const [endTime, setEndTime] = useState(workshopWorkingTime?.split(" - ")[1] || "18:00");
  const [info, setInfo] = useState(workshopDescription || "");
  const [workshopName, setWorkshopName] = useState(workshopTitle || "");
  const [address, setAddress] = useState(workshopAddress || "");
  const navigate = useNavigate()

  const startRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLInputElement>(null);

  const handleContinue = () => {
    const workingTime = `${startTime} - ${endTime}`;
    setWorkshopTitle(workshopName);
    setWorkshopAddress(address);
    setWorkshopDescription(info);
    setWorkshopWorkingTime(workingTime);
    navigate("/workshop-password");
  };

  return (
    <div className="flex items-center h-screen">
      <div className="w-80 md:w-100 mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center justify-center gap-2 w-35 py-1 rounded-4xl bg-[#E4ECFE] text-[#1E5DE5]">
          <ArrowLeftOutlined className="w-2.5 h-2" />
          <span>{t("mexanik")}</span>
        </button>
        <p className="mt-5 mb-10 text-center">
          {t("fill_profile")}
        </p>
        <form onSubmit={(e) => { e.preventDefault(); handleContinue(); }} className="flex flex-col gap-4">
          {/* Ustaxona nomi */}
          <label className="flex flex-col">
            <span className="block pl-3 text-[12px] text-[#7B7B7B]">
              {t("ustaxona_nomini_kiriting")}
            </span>
            <input
              type="text"
              required
              placeholder={t("placeholder_workshop_name")}
              className="py-2.5 pl-4 rounded-4xl bg-[#F5F6F9] outline-none"
              value={workshopName}
              onChange={(e) => setWorkshopName(e.target.value)}
            />
          </label>

          {/* Manzil */}
          <label className="flex flex-col">
            <span className="block pl-3 text-[12px] text-[#7B7B7B]">
              {t("manzil")}
            </span>
            <input
              type="text"
              required
              placeholder={t("placeholder_address")}
              className="py-2.5 pl-4 rounded-4xl bg-[#F5F6F9] outline-none"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </label>

          {/* Ish vaqti - soat tanlagich */}
          <label className="flex flex-col">
            <span className="block pl-3 text-[12px] text-[#7B7B7B]">
              {t("ish_vaqtini_kiriting")}
            </span>
            <div
              className="flex items-center gap-2 py-2.5 px-4 rounded-4xl bg-[#F5F6F9] cursor-pointer"
              onClick={() => startRef.current?.showPicker()}
            >
              {/* Clock icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#7B7B7B"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="shrink-0"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>

              <input
                ref={startRef}
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="bg-transparent outline-none text-sm text-gray-700 w-17.5 cursor-pointer"
              />

              <span className="text-gray-400 text-sm">—</span>

              <input
                ref={endRef}
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                onClick={(e) => {
                  e.stopPropagation();
                  endRef.current?.showPicker();
                }}
                className="bg-transparent outline-none text-sm text-gray-700 w-17.5 cursor-pointer"
              />
            </div>
          </label>

          {/* Servis haqida - textarea */}
          <label className="flex flex-col">
            <span className="block pl-3 text-[12px] text-[#7B7B7B]">
              {t("servis_haqida_yozing")}
            </span>
            <textarea
              required
              placeholder={t("placeholder_info")}
              rows={3}
              value={info}
              onChange={(e) => setInfo(e.target.value)}
              className="py-2.5 pl-4 pr-3 rounded-3xl bg-[#F5F6F9] outline-none resize-none text-sm leading-relaxed overflow-hidden"
              style={{ minHeight: "44px" }}
              onInput={(e) => {
                const el = e.currentTarget;
                el.style.height = "auto";
                el.style.height = el.scrollHeight + "px";
              }}
            />
          </label>

          <CustomButton onClick={handleContinue}
            text={t("tayyor")}
            className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-6 md:mt-9"
          />
        </form>
      </div>
    </div>
  );
};

export default WorkshopRegister;