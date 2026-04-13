import { SearchIcon } from "../assets/icons";
import { useEffect, useState, useCallback, useRef } from "react";
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
  const [loading, setLoading] = useState<boolean>(true);
  
  // Oxirgi kelgan ma'lumotlar sonini skeleton uchun saqlab qo'yamiz
  const lastCount = useRef<number>(6); 

  const { t, i18n } = useTranslation();

  const fetchVehicles = useCallback(async (query: string = "") => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/vehicles/search/`, {
        headers: { 
            Authorization: `Bearer ${token}`,
            "Accept-Language": i18n.language 
        },
        params: { q: query },
      });
      setAllCars(res.data);
      if (res.data.length > 0) {
        lastCount.current = res.data.length;
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        toast.error(t("session_expired"));
        Cookies.remove("access_token");
        window.location.href = "/log-in";
      } else {
        toast.error(t("error_loading"));
      }
    } finally {
      setLoading(false);
    }
  }, [token, t, i18n.language]);

  useEffect(() => {
    fetchVehicles("");
  }, [fetchVehicles]);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchVehicles(searchInput);
    }, 500);
    return () => clearTimeout(delay);
  }, [searchInput, fetchVehicles]);


console.log(cars,"cars");

  return (
    <section className="p-4 bg-[#F5F6F9] rounded-[20px] h-screen flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <h2 className="text-[20px] font-medium text-[#2D2D2D]">{t("mijozlar")}</h2>
        <label className="relative w-[30%]">
          <input
            onChange={(e) => setSearchInput(e.target.value)}
            type="text"
            placeholder={t("qidirish")}
            className="py-3 pl-3 bg-white rounded-[40px] outline-none w-full"
          />
          <button className="absolute right-2.5 top-2.5">
            <SearchIcon />
          </button>
        </label>
      </div>

      <div className="flex-1 overflow-y-auto mt-3 py-4 custom-scrollbar pb-70">
        
        {loading ? (
          /* FAQAT SKELETON (Original card o'lchamida) */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {Array.from({ length: lastCount.current }).map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-[20px] animate-pulse">
                <div className="flex items-center gap-3 pb-3">
                  <div className="w-9 h-9 bg-gray-200 rounded-full"></div>
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100 flex justify-between">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : cars.length > 0 ? (
          /* REAL MA'LUMOTLAR (Sizning original dizayningiz) */
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
            {cars.map((item) => (
              <div key={item.id} className="bg-[#FFFFFF] p-3 rounded-[20px] mb-0">
                <div className="flex items-center justify-between pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
                      {item.driver.image ? (
                        <img
                          src={`${BASE_URL}${item.driver.image}`}
                          alt={item.driver.full_name || "Driver"}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1E5DE5] flex items-center justify-center text-white font-semibold text-xl leading-none">
                          {item.driver.full_name
                            ? item.driver.full_name.charAt(0).toUpperCase()
                            : "?"}
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.driver.full_name || "Noma'lum haydovchi"}
                      </p>
                      <p className="text-sm text-gray-500">*********</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-[#E3E3E3]">
                  <p>
                    {item.vehicle?.brand} {item.vehicle?.model}
                  </p>
                  <p>{item.car_plate_number}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* BO'SH HOLAT MATNI */
          <div className="h-full flex items-center justify-center">
             <p className="text-gray-500 text-lg">
                {searchInput ? t("hech_nima_topilmadi") : t("malumotlar_yoq")}
             </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Cliend;