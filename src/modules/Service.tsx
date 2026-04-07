import axios from "axios";
import { useContext, useEffect, useState } from "react";
import BASE_URL from "../hooks/Env";
import Cookies from "js-cookie";
import { AuthContext } from "../context/UseContext";
import { useTranslation } from "react-i18next";

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
    <section className="mt-4 mb-3 grid grid-cols-2 gap-2.5 ">
      <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]">
        <strong className="text-[28px] text-[#1E5DE5]">
          {services || 0}
        </strong>
        <p className="text-[13px]">{t("xizmat_ko’rsatilgan_mijozlar")}</p>
      </div>
      {/* keyingi versiya  */}
      {/* <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]"> 
            <strong>12</strong>
            <p>Avtoservisga qiziqish bildirganlar</p>
         </div> */}
      <div className="py-2.5 pl-4 rounded-[20px] bg-[#F5F6F9]">
        <strong className="text-[28px] text-[#1E5DE5]">{allCars ||  0}</strong>
        <p className="text-[14px]">{t("xizmat_ko’rsatilgan_mashinalar")}</p>
      </div>
    </section>
  );
};

export default Service;
