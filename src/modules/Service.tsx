import axios from "axios";
import { useContext, useEffect, useState } from "react";
import BASE_URL from "../hooks/Env";
import Cookies from "js-cookie";
import { AuthContext } from "../context/UseContext";
import { useTranslation } from "react-i18next";
import { HourIcon } from "../assets/icons";

const Service = () => {
  const [services, setServices] = useState(0);
  const [allCars,setAllCars] = useState(0)
  const token = Cookies.get("access_token");
 const {servisId} = useContext(AuthContext)!
 const {t} = useTranslation()

useEffect(() =>{
  axios.get(`${BASE_URL}/api/auth/profile/ `,{
    headers:{
      Authorization:`Bearer ${token}`
    }
  }).then(res =>{
    setServices(res.data.profile.total_customers)
    setAllCars(res.data.profile.total_cars)
    
  }).catch(err =>{
    console.log(err);
    
  })
},[servisId])

  return (
    <section className="">
    <ul className=" md:hidden flex items-center justify-between">
      <li>
        <h2 className="text-[20px] font-medium">{t("servis_nomi")}</h2>
        <p className="text-[13px] text-[#7B7B7B]">{t("servis_foydalanuvchilari")}</p>
      </li>
      <li>
        <HourIcon/>
      </li>

    </ul>
      <div className="grid grid-cols-2 mt-4 mb-3  gap-2.5 ">
      <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]">
        <strong className="text-[28px] text-[#1E5DE5]">
          {services || 0}
        </strong>
        <p className="hidden md:block text-[13px]">{t("xizmat_ko’rsatilgan_mijozlar")}</p>
        <p className=" md:hidden text-[13px]">{t("mijozlar")}</p>
      </div>
      {/* keyingi versiya  */}
      {/* <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]"> 
            <strong>12</strong>
            <p>Avtoservisga qiziqish bildirganlar</p>
         </div> */}
      <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]">
        <strong className="text-[28px] text-[#1E5DE5]">{allCars ||  0}</strong>
        <p className="hidden md:block text-[14px]">{t("xizmat_ko’rsatilgan_mashinalar")}</p>
        <p className=" md:hidden text-[14px]">{t("mashinalar")}</p>
      </div>
      </div>

    </section>
  );
};

export default Service;
