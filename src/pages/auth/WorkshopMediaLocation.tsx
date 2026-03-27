import { useNavigate } from "react-router-dom";
import { LocationImg, WorkshopImg } from "../../assets/images";
import { CustomButton } from "../../components";
import { useTranslation } from "react-i18next";

const WorkshopMediaLocation = () => {
    const navigate = useNavigate()
    const {t} = useTranslation()
  return (
    <section className="flex items-center justify-center h-screen ">
      <div className="flex flex-col gap-4 ">
        <div className="w-157 bg-[#F5F6F9] rounded-3xl px-4 pt-6 pb-4  ">
          <p className="text-[#2D2D2D] text-[14px] w-60">
            Mijozlar servisingizni ko’rishi uchun rasm qo’shing
          </p>
          <img className="mx-auto my-5" src={WorkshopImg} alt="WorkshopImg" width={94} height={94} />
          <CustomButton onClick={() => navigate("/register-img-pages")}
            text={t("qo’shish")}
            className="w-full! py-2.5 bg-[#E4ECFE]! rounded-4xl! mt-6 md:mt-9 text-[#1E5DE5]!"
          />
        </div>
        <div className="w-157 bg-[#F5F6F9] rounded-3xl px-4 pt-6 pb-4  ">
          <p className="text-[#2D2D2D] text-[14px] text-center">
           Mijozlar servisingizni topa olishi uchun joylashuvingizni belgilang
          </p>
          <img className="mx-auto my-5" src={LocationImg} alt="WorkshopImg" width={94} height={94} />
          <CustomButton onClick={() => navigate("/register-location-pages")}
            text={t("belgilash")}
            className="w-full! py-2.5 bg-[#E4ECFE]! rounded-4xl! mt-6 md:mt-9 text-[#1E5DE5]!"
          />
        </div>
      </div>
    </section>
  );
};

export default WorkshopMediaLocation;
