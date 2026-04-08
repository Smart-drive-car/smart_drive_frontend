import { RightOutlined } from "@ant-design/icons";
import { CopyIcon, DowlandIcon, SearchIcon, ShareIcon } from "../assets/icons";
import { LocationImg } from "../assets/images";
import { useTranslation } from "react-i18next";
import { useContext, useEffect, useState } from "react";
import Cookies from "js-cookie";
import axios from "axios";
import BASE_URL from "../hooks/Env";
import type { LastServiceType } from "../@types";
import { AuthContext } from "../context/UseContext";

const LastServisPages = () => {
  const { t } = useTranslation();
  const token = Cookies.get("access_token");
  const [allService, setAllService] = useState<LastServiceType[]>([]);
  const [servisType, setServisType] = useState<LastServiceType | null>(null);
  const [searchInput, setSearchInput] = useState<string>("");
  const { carId } = useContext(AuthContext)!;
  const { deleteCarId } = useContext(AuthContext)!;
  
  // Ma'lumotlarni yuklash
  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/services/services/?car_id=${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllService(res.data);
      
        // Agar ma'lumot bo'lsa, birinchisini default qilib o'rnatamiz
        if (res.data.length > 0) {
          setServisType(res.data[0]);
        }
        else{
          setServisType(null)
        }
      })
      .catch((err) => {
        console.error("Status:", err.response?.status);
        console.error("Xato:", err.response?.data); // ← eng muhimi shu!
        console.error("URL:", err.config?.url); // ← qaysi URL da
        console.error("Method:", err.config?.method); // ← GET/POST/DELETE
      });
  }, [token, deleteCarId]);

  // Har bir element bosilganda ID orqali ma'lumot olish
  const handleServisId = async (id: number) => {
     
    
    try {
      const res =  await axios.get(`${BASE_URL}/api/services/services/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        
        
      });
     setServisType(res.data)
    } catch (err:any) {
      console.error("Status:", err.response?.status);
      console.error("Xato:", err.response?.data); // ← eng muhimi shu!
      console.error("URL:", err.config?.url); // ← qaysi URL da
      console.error("Method:", err.config?.method); // ← GET/POST/DELETE
    }
  };

  const openMap = (lat: number, lng: number) => {

    // Agar lat yoki lng kelmasa, funksiyani to'xtatamiz
    if (!lat || !lng) {
      console.error("Koordinatalar yetishmayapti:", { lat, lng });
      return;
    }

    // To'g'ri URL formati (Template literal bilan)
    const url = `https://www.google.com/maps?q=${lat},${lng}`;

    window.open(url, "_blank");
  };

  // search

  useEffect(() => {
    // Token borligini tekshirish
    if (!token) {
      console.error("Token mavjud emas!");
      return;
    }
    if (!carId) return;

    const delayDebounceFn = setTimeout(() => {
      axios
        .get(`${BASE_URL}/api/services/services?car_id=${carId}`, {
          params: { search: searchInput },
          headers: {
            // 'Bearer'dan keyin bitta bo'sh joy borligiga e'tibor bering
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
         

          setAllService(res.data);
        })
        .catch((err) => {
          alert("Xato");
          console.error("Xato detali:", err.response?.data);
        });
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchInput, token, carId]);

  // 1. Nusxa olish funksiyasi (Link yoki matnni nusxalash)
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      alert("Havola nusxalandi!"); // Yoki chiroyli Toast chiqaring
    } catch (err) {
      console.error("Nusxa olishda xato:", err);
    }
  };

  // 2. Ulashish funksiyasi (Mobil qurilmalarda "Share" menyusini ochadi)
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Smart Drive",
          text: "Xizmat haqida ma'lumot",
          url: window.location.href,
        });
      } catch (err) {
      }
    } else {
      // Agar brauzer "Share" ni qo'llab-quvvatlamasa (masalan Desktop Chrome)
      handleCopy();
    }
  };

  // 3. Yuklab olish funksiyasi (Rasmni yuklash)
  const handleDownload = (imageUrl: string) => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = "workshop-image.jpg"; // Yuklanayotgan fayl nomi
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <section className="flex gap-3 h-screen overflow-hidden">
      {/* CHAP - scroll */}
      <div className="w-[60%] bg-[#F5F6F9] rounded-[20px] mt-3 flex flex-col  h-[50%]  custom-scrollbar">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 shrink-0">
          <strong className="text-[#2D2D2D] font-medium text-[20px]">
            {t("last_services")}
          </strong>
          <div className="relative w-[60%]">
            <input
              onChange={(e) => setSearchInput(e.target.value)}
              type="text"
              placeholder={t("search")}
              className="w-full py-3 pl-3 text-[#7B7B7B] text-[13px] rounded-[40px] bg-[#FFFFFF] outline-none"
            />
            <button className="absolute right-2 top-2.5">
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* LIST */}
        <ul className="flex flex-col gap-2 overflow-y-auto flex-1 px-4 pb-50 ">
          {allService.map((item) => (
            <li
              key={item.id}
              onClick={() => handleServisId(item.id)}
              className={`flex items-center justify-between p-3 rounded-[20px] cursor-pointer transition-all ${
                servisType?.id === item.id ? "bg-[#E4ECFE]" : "bg-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <img
                  src={item.workshop.image || LocationImg}
                  alt={item.workshop.title}
                  className="w-11 h-11 rounded-full object-cover"
                />
                <div>
                  <p className="text-[#2D2D2D] font-medium">
                    {item.workshop.title}
                  </p>
                  <span className="text-[13px] text-[#7B7B7B]">
                    {item.service_type.name} — {item.description}
                  </span>
                </div>
              </div>
              <RightOutlined
                className={`w-3 h-2 ${servisType?.id === item.id ? "text-blue-500" : "text-[#7B7B7B]"}`}
              />
            </li>
          ))}
        </ul>
      </div>

      {/* O'NG - Tanlangan xizmat ma'lumotlari */}
      <div className="w-[40%] bg-[#F5F6F9] rounded-[20px] pt-5 px-4 pb-40 mt-3 overflow-y-auto h-[50%] flex flex-col custom-scrollbar">
        {servisType ? (
          <>
            <div className="text-center">
              <img
                className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-white shadow-sm"
                src={servisType.workshop.image || ""}
                alt="logo"
              />
              <strong className="block mt-2 text-lg text-[#2D2D2D]">
                {t("moy_almashtirish")}
              </strong>
              <p className="text-[#7B7B7B] text-[14px]">
                {servisType.description}
              </p>
            </div>

            <ul className="bg-[#FFFFFF] p-4 rounded-2xl flex flex-col gap-3 my-5">
              <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[#7B7B7B] text-sm">{t("oil_brand")}</p>
                <p className="text-[#2D2D2D] font-medium text-sm">
                  {servisType.description}
                </p>
              </li>
              <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[#7B7B7B] text-sm">{t("oil_type")}</p>
                <p className="text-[#2D2D2D] font-medium text-sm">
                  {servisType.service_type.name}
                </p>
              </li>
              <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[#7B7B7B] text-sm">{t("kilometers")}</p>
                <p className="text-[#2D2D2D] font-medium text-sm">
                  {servisType.probeg.toLocaleString()} km
                </p>
              </li>
              <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[#7B7B7B] text-sm">{t("auto_service")}</p>
                <p className="text-[#2D2D2D] font-medium text-sm">
                  {servisType.workshop.title}
                </p>
              </li>
              <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                <p className="text-[#7B7B7B] text-sm">{t("manzil")}</p>
                <button
                  onClick={() =>
                    openMap(servisType.workshop.lat, servisType.workshop.lng)
                  }
                  className="text-[#2D2D2D] font-medium text-sm text-right truncate ml-4"
                >
                  {servisType.workshop.address}
                </button>
              </li>
              <li className="flex items-center justify-between">
                <p className="text-[#7B7B7B] text-sm">{t("telefon_raqami")}</p>
                <p className="text-[#2D2D2D] font-medium text-sm">
                  {servisType.workshop.phone_number}
                </p>
              </li>
            </ul>

            <div className="flex justify-end gap-2 mt-3 pb-10">
              {/* Nusxa olish */}
              <button
                onClick={handleCopy}
                className="bg-[#FFFFFF] p-3 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                title="Nusxa olish"
              >
                <CopyIcon />
              </button>

              {/* Ulashish */}
              <button
                onClick={handleShare}
                className="bg-[#FFFFFF] p-3 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                title="Ulashish"
              >
                <ShareIcon />
              </button>

              {/* Yuklab olish - rasm linkini uzatasiz */}
              <button
                onClick={() => handleDownload(servisType?.workshop?.image)}
                className="bg-[#FFFFFF] w-12 h-12  flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                title="Yuklab olish"
              >
                <DowlandIcon />
              </button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-[#7B7B7B]">
            {t("Xizmatlar yoq")}
          </div>
        )}
      </div>
    </section>
  );
};

export default LastServisPages;
