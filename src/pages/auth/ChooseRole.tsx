import { DriverIcon, MechanicIcon } from "../../assets/icons";
import { CustomButton } from "../../components";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useContext, useEffect } from "react";
import { AuthContext, type AuthContextType } from "../../context/UseContext";
import { toast } from "react-toastify";

const ChooseRole = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { selectRole, setSelectRole } = useContext(AuthContext) as AuthContextType;

  // Sahifa yuklanganda hech narsa tanlanmagan bo'lishini ta'minlash (agar contextda default bo'lsa)
  useEffect(() => {
    setSelectRole(""); 
  }, []);

  

  return (
    <section className="flex items-center h-screen">
      <div className="max-w-80 px-3 md:px-0 md:min-w-100 mx-auto text-center">
        <h2 className="font-medium text-[20px] text-[#2D2D2D]">
          {t("siz_platformaga_qanday_qo‘shilasiz")}
        </h2>
        
        <div className="flex flex-col gap-2 mt-6">
          {/* MEXANIK LABEL */}
          <label
            htmlFor="workshop-radio"
            className={`w-full flex justify-between items-center py-4 px-4 rounded-3xl cursor-pointer transition-all ${
              selectRole === "WORKSHOP" ? "bg-[#E4ECFE] " : "bg-[#F5F6F9]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MechanicIcon />
              <p className="font-medium">{t("mexanik")}</p>
            </div>
            <input
              id="workshop-radio"
              checked={selectRole === "WORKSHOP"}
              onChange={() => setSelectRole("WORKSHOP")}
              type="radio"
              name="role"
              className="w-5 h-5 cursor-pointer"
            />
          </label>

          {/* HAYDOVCHI LABEL */}
          <label
            className={`w-full py-4 px-4 flex justify-between items-center rounded-3xl cursor-pointer transition-all ${
              selectRole === "DRIVER" ? "bg-[#E4ECFE]" : "bg-[#F5F6F9]"
            }`}
          >
            <div className="flex items-center gap-3">
              <DriverIcon />
              <div>
                <p className="font-medium ">{t("haydovchi")}</p>
              </div>
            </div>
            <input
              type="radio"
              name="role"
             onChange={() => setSelectRole("DRIVER")}
              className="w-5 h-5"
            />
          </label>

          <CustomButton
            type="button"
            text={t("davom_etish")}
            className="w-full! py-2.5 bg-[#1E5DE5]! rounded-4xl! mt-9"
            onClick={() => {
              if (selectRole === "WORKSHOP") {
                navigate("/workshop-register");
              } else if (selectRole === "DRIVER") {
                navigate("/driver-register");
              }
              else{
                toast.info(t("rolni_tanlang"));
              }
            }}
          />
        </div>
      </div>
    </section>
  );
};

export default ChooseRole;