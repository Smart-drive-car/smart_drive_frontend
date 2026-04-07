
import { SearchIcon } from "../assets/icons";
import { useEffect, useState } from "react";
import type { AllCarsType } from "../@types";
import BASE_URL from "../hooks/Env";
import axios from "axios";
import { toast } from "react-toastify";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";

const Cliend = () => {
  const token = Cookies.get("access_token");
  const [searchInput, setSearchInput] = useState<string>("");
  const [cars, setAllCars] = useState<AllCarsType[]>([]);

  const {t} = useTranslation()

  
  
  // get all cars
  useEffect(() => {
      const fetchVehicles = async () => {
          // Token yo'q bo'lsa hech narsa qilmasin
          if (!token) {
              console.warn("Token topilmadi. Login qiling.");
              return;
            }
            
            try {
                const res = await axios.get(`${BASE_URL}/api/vehicles/search/`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    params: {
                        q: "",
                    },
                });
               
         
        setAllCars(res.data);
      
      } catch (err: any) {
        console.error("Xatolik:", err.response?.data || err);

        if (err.response?.status === 401) {
          toast.error("Sessiya tugadi. Qayta login qiling.");
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/log-in";
        } else {
          toast.error("Avtomobillarni yuklashda xatolik yuz berdi.");
        }
      }
    };

    fetchVehicles();
  }, []);

  // seach cliend

  // Debounce — har harf bosganda emas, 500ms kutib so'rov yuboradi
  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVehicles(searchInput);
    }, 500);

    return () => clearTimeout(delay);
  }, [searchInput]);

  const fetchVehicles = async (query: string) => {
    if (!token) return;

    try {
      const res = await axios.get(`${BASE_URL}/api/vehicles/search/`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { q: query },
      });
      setAllCars(res.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error("Sessiya tugadi. Qayta login qiling.");
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/log-in";
      } else {
        toast.error("Xatolik yuz berdi.");
      }
    }
  };

  return (
    <section className="p-4 bg-[#F5F6F9] rounded-[20px] h-screen flex flex-col ">
      {/* HEADER - qimirlamaydi */}
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[20px] font-medium text-[#2D2D2D]">{t("mijozlar")}</h2>
        <label className="relative w-[30%]">
          <input onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder={t("qidirish")}
            className="py-3 pl-3 bg-white rounded-[40px] outline-none w-full"
          />
          <button className="absolute right-2.5 top-2.5">
            <SearchIcon />
          </button>
        </label>
      </div>

      {/* KONTENT - scroll bo'ladi */}
      <div className="flex-1 overflow-y-auto mt-3 py-4 custom-scrollbar pb-70">
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          
          {cars.map((item) => (
            <div key={item.id} className="bg-[#FFFFFF] p-3 rounded-[20px] mb-0">
              <div className="flex items-center justify-between pb-3">
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
                    {item.driver.image ? (
                      <img
                          src={`${BASE_URL}${item.driver.image}`}
                        alt={item.driver.full_name || "Driver"}
                        className="w-full h-full object-cover"
                        width={36}
                        height={36}
                      />
                    ) : (
                      <div className="w-full h-full bg-[#1E5DE5] flex items-center justify-center text-white font-semibold text-xl leading-none">
                        {item.driver.full_name
                          ? item.driver.full_name.charAt(0).toUpperCase()
                          : "?"}
                      </div>
                    )}
                  </div>

                  {/* Name va Phone */}
                  <div>
                    <p className="font-medium text-gray-800">
                      {item.driver.full_name || "Noma'lum haydovchi"}
                    </p>
                    <p className="text-sm text-gray-500">
                      {/* {item.driver.phone_number} */}
                      *********
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
                <p>
                  {item.vehicle.brand} {item.vehicle.model}
                </p>
                <p>{item.car_plate_number}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Cliend;
