import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
  Popup,
} from "react-leaflet";
import L, { type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";
import axios from "axios";
import Cookies from "js-cookie";
import BASE_URL from "../../hooks/Env";
import { useTranslation } from "react-i18next";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { Workshop } from "../../@types";
import { SearchIcon } from "../../assets/icons";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";

// ✅ Workshop markeri (ko'k, pulse animatsiyali)
const workshopIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position: relative; width: 28px; height: 28px;">
      <div style="
        position: absolute;
        top: -5px; left: -5px;
        width: 38px; height: 38px;
        background: rgba(30, 93, 229, 0.2);
        border-radius: 50%;
        animation: wsPulse 2s infinite;
      "></div>
      <div style="
        width: 28px; height: 28px;
        background: linear-gradient(135deg, #1E5DE5, #3B82F6);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 4px 14px rgba(30,93,229,0.6);
        display: flex; align-items: center; justify-content: center;
      ">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="white">
          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
        </svg>
      </div>
    </div>
    <style>
      @keyframes wsPulse {
        0%   { transform: scale(1); opacity: 0.7; }
        70%  { transform: scale(1.6); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
    </style>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -18],
});

// ✅ Foydalanuvchi joylashuvi markeri (yashil, kengayuvchi halqa)
const userLocationIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position: relative; width: 26px; height: 26px;">
      <div style="
        position: absolute;
        top: -10px; left: -10px;
        width: 46px; height: 46px;
        background: rgba(16, 185, 129, 0.15);
        border: 2px solid rgba(16, 185, 129, 0.4);
        border-radius: 50%;
        animation: userRing 2.5s infinite;
      "></div>
      <div style="
        width: 26px; height: 26px;
        background: linear-gradient(135deg, #10B981, #34D399);
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(16,185,129,0.3), 0 4px 12px rgba(16,185,129,0.5);
        display: flex; align-items: center; justify-content: center;
      ">
        <div style="width: 10px; height: 10px; background: white; border-radius: 50%;"></div>
      </div>
    </div>
    <style>
      @keyframes userRing {
        0%   { transform: scale(1); opacity: 0.8; }
        70%  { transform: scale(1.8); opacity: 0; }
        100% { transform: scale(1); opacity: 0; }
      }
    </style>
  `,
  iconSize: [26, 26],
  iconAnchor: [13, 13],
  popupAnchor: [0, -16],
});

// ✅ Tanlangan joy - qizil pin marker
const redIcon = new L.DivIcon({
  className: "",
  html: `
    <div style="position: relative; width: 32px; height: 42px;">
      <div style="
        width: 32px; height: 32px;
        background: linear-gradient(135deg, #EF4444, #DC2626);
        border: 3px solid #ffffff;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        box-shadow: 0 4px 14px rgba(239,68,68,0.6);
      "></div>
      <div style="
        position: absolute; top: 8px; left: 8px;
        width: 16px; height: 16px;
        background: white; border-radius: 50%;
        transform: rotate(45deg);
      "></div>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -44],
});

// ✅ Cluster icon
const createClusterCustomIcon = (cluster: any) => {
  const count = cluster.getChildCount();
  const size = count < 10 ? 44 : count < 100 ? 50 : 58;
  return L.divIcon({
    html: `
      <div style="
        width: ${size}px; height: ${size}px;
        background: linear-gradient(135deg, #1E5DE5, #3B82F6);
        border: 4px solid #ffffff; border-radius: 50%;
        box-shadow: 0 6px 18px rgba(30,93,229,0.5);
        display: flex; align-items: center; justify-content: center;
        color: #fff; font-weight: 800; font-size: 15px; font-family: Arial, sans-serif;
      ">${count}</div>
    `,
    className: "",
    iconSize: L.point(size, size, true),
  });
};

// ✅ Barcha workshoplarni ekranga sig'dirish
const FitBounds: React.FC<{ points: Workshop[] }> = ({ points }) => {
  const map = useMap();
  useEffect(() => {
    const valid = points.filter((p) => {
      const lat = Number(p.latitude);
      const lng = Number(p.longitude);
      return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
    });
    if (valid.length > 0) {
      const bounds = L.latLngBounds(
        valid.map(
          (p) => [Number(p.latitude), Number(p.longitude)] as LatLngTuple,
        ),
      );
      map.fitBounds(bounds, { padding: [60, 60] });
    }
  }, [points, map]);
  return null;
};

// ✅ Foydalanuvchi joylashuviga xaritani silliq olib borish
const FlyToLocation: React.FC<{ coords: LatLngTuple | null }> = ({
  coords,
}) => {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.flyTo(coords, 15, { duration: 1.5 });
    }
  }, [coords, map]);
  return null;
};

const SearchPages: React.FC = () => {
  const [position, setPosition] = useState<LatLngTuple>([41.311081, 69.240562]);
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Geolokatsiya state'lari
  const [userLocation, setUserLocation] = useState<LatLngTuple | null>(null);
  const [workshopData, setWorkshopData] = useState<Workshop>();
  const [imgIndex, setImgIndex] = useState(0);
  const [workshopDataModal, setWorkshopDataModa] = useState<boolean>(false);
  const images: string[] =
    workshopData?.images?.map(
      (img: { id: number; image: string }) => `${BASE_URL}${img.image}`,
    ) ?? [];

  const [, setGeoStatus] = useState<"idle" | "loading" | "success" | "error">(
    "idle",
  );
  const [flyTarget, setFlyTarget] = useState<LatLngTuple | null>(null);
  const [searchInput, setSearchinput] = useState<string>("");

  const { t } = useTranslation();
  const token = Cookies.get("access_token");
  console.log(workshops);

  // ✅ Workshoplarni yuklash
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/workshops/search/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (Array.isArray(res.data)) {
          const valid = res.data.filter((shop: Workshop) => {
            const lat = Number(shop.latitude);
            const lng = Number(shop.longitude);
            return !isNaN(lat) && !isNaN(lng) && lat !== 0 && lng !== 0;
          });
          setWorkshops(valid);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));

    document.body.classList.add("search-pages-active");
    return () => document.body.classList.remove("search-pages-active");
  }, []);

  // ✅ Sahifa ochilganda avtomatik geolokatsiya so'rash
  useEffect(() => {
    requestUserLocation();
  }, []);

  const requestUserLocation = () => {
    if (!navigator.geolocation) {
      setGeoStatus("error");
      return;
    }
    setGeoStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: LatLngTuple = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setFlyTarget(coords); // xaritani shu joyga olib boradi
        setGeoStatus("success");
      },
      () => {
        setGeoStatus("error");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const MapEvents = () => {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
      },
    });
    return null;
  };

  const handleShowWorkshop = async (id: number) => {
    setWorkshopDataModa(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/workshops/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(res.data);
      setWorkshopData(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  // phone number format
  function formatPhoneNumber(phone: string): string {
    // Faqat raqamlarni olib tashlaymiz (har qanday formatdan tozalaydi)
    let cleaned = phone.replace(/\D/g, "");

    // Agar raqam 9 xonali bo'lsa (998 siz), oldiga +998 qo'shamiz
    if (cleaned.length === 9) {
      cleaned = "998" + cleaned;
    }
    // Agar allaqachon 998 bilan boshlansa (12 xonali)
    else if (cleaned.length === 12 && cleaned.startsWith("998")) {
      // hech narsa qilmaymiz
    }
    // Boshqa holatlar (masalan 11 xonali 0 bilan boshlangan bo'lsa)
    else if (cleaned.length === 11 && cleaned.startsWith("0")) {
      cleaned = "998" + cleaned.slice(1);
    }

    // Endi +998 bilan 12 xonali bo'lishi kerak
    if (cleaned.length === 12 && cleaned.startsWith("998")) {
      // Format: +998 XX XXX XX XX
      return `+998 ${cleaned.slice(3, 5)} ${cleaned.slice(5, 8)} ${cleaned.slice(8, 10)} ${cleaned.slice(10, 12)}`;
    }

    // Agar formatlash imkonsiz bo'lsa, asl holatini qaytaramiz
    return phone;
  }

  // serchWorkshop
  useEffect(() => {
    const searchTerm = searchInput.trim();

    // 1. Bo'sh bo'lsa — so'rov yubormaymiz
    if (!searchTerm) {
      // setWorkshops([]);   // yoki oldingi natijalarni tozalash
      return;
    }

    // 2. Debounce effekti (ixtiyoriy, lekin tavsiya etiladi)
    const timeoutId = setTimeout(() => {
      axios
        .get(`${BASE_URL}/api/workshops/search/`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            search: searchTerm,
          },
        })
        .then((res) => {
          console.log(`"${searchTerm}" bo'yicha natija:`, res.data);
          // setWorkshops(res.data.results || res.data); // natijani state ga saqlang
        })
        .catch((err) => {
          console.error("Search xatosi:", err.response?.data || err.message);
        });
    }, 500); // 500ms kutib turadi

    // Cleanup
    return () => clearTimeout(timeoutId);
  }, [searchInput, BASE_URL, token]);

  return (
    <div className="flex gap-4">
      <div className="relative w-full h-screen overflow-hidden">
        {/* ✅ Search - xarita ustida o'ng tomonda */}
        <div className="absolute top-4 right-4 z-10 w-70">
          <div className="relative">
            <input
              onChange={(e) => setSearchinput(e.target.value)}
              type="text"
              placeholder={t("search")}
              className="w-full py-3 pl-4 pr-10 text-[#7B7B7B] text-[13px] rounded-[40px] bg-white shadow-lg outline-none border border-gray-100 focus:border-blue-300 transition-colors"
            />
            <button className="absolute right-3 top-1/2 -translate-y-1/2">
              <SearchIcon />
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000 bg-white px-5 py-2 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium text-blue-600">
            <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            Yuklanmoqda...
          </div>
        )}

        {/* Map */}
        <div className="absolute inset-0 z-0 rounded-[20px] overflow-hidden">
          <MapContainer
            center={position}
            zoom={13}
            zoomControl={true}
            style={{ width: "100%", height: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />

            <FitBounds points={workshops} />
            <MapEvents />

            {/* ✅ Foydalanuvchi joylashuviga flyTo */}
            <FlyToLocation coords={flyTarget} />

            {/* ✅ Foydalanuvchi markeri - yashil */}
            {userLocation && (
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div
                    style={{
                      textAlign: "center",
                      fontFamily: "Arial, sans-serif",
                      minWidth: "170px",
                    }}
                  >
                    <div
                      style={{
                        background: "linear-gradient(135deg, #10B981, #34D399)",
                        margin: "-13px -13px 10px -13px",
                        padding: "12px 16px",
                        borderRadius: "8px 8px 0 0",
                        color: "#fff",
                        fontWeight: "700",
                        fontSize: "14px",
                      }}
                    >
                      🧭 Siz shu yerdasiz
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6B7280",
                        lineHeight: "1.9",
                      }}
                    >
                      <div>
                        Lat: <b>{userLocation[0].toFixed(5)}</b>
                      </div>
                      <div>
                        Lng: <b>{userLocation[1].toFixed(5)}</b>
                      </div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            )}

            {/* Workshop markerlar (cluster) */}
            <MarkerClusterGroup
              chunkedLoading
              iconCreateFunction={createClusterCustomIcon}
              showCoverageOnHover={false}
              maxClusterRadius={55}
            >
              {workshops.map((shop) => (
                <Marker
                  key={shop.id}
                  position={[Number(shop.latitude), Number(shop.longitude)]}
                  icon={workshopIcon}
                >
                  <Popup>
                    <div
                      style={{
                        position: "relative",
                        width: "300px",
                        fontFamily: "Arial, sans-serif",
                        zIndex: 30,
                      }}
                    >
                      {/* Header: Logo + Title + Ko'rish tugmasi */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {shop.image ? (
                            <img
                              src={shop.image}
                              alt="logo"
                              width={32}
                              height={32}
                              className="rounded-full object-cover w-8 h-8"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src =
                                  "/placeholder.png";
                              }}
                            />
                          ) : (
                            // ✅ Rasm yo'q bo'lsa — harf avatar
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                              {shop.title?.charAt(0)?.toUpperCase() ?? "?"}
                            </div>
                          )}
                          <p className="font-semibold text-sm text-[#2D2D2D] line-clamp-1">
                            {shop.title ?? "Noma'lum ustaxona"}
                          </p>
                        </div>
                        <button
                          onClick={() => handleShowWorkshop(shop.id)}
                          className="py-1 px-3 text-[#1E5DE5] bg-[#E4ECFE] rounded-[40px] text-xs cursor-pointer hover:bg-blue-200 transition-colors whitespace-nowrap"
                        >
                          Ko'rish
                        </button>
                      </div>

                      {/* ✅ Rasm — yo'q bo'lsa placeholder */}
                      {shop.images && shop.images.length > 0 ? (
                        <img
                          className="w-full h-36 rounded-xl object-cover mb-3 py-1"
                          src={`${BASE_URL}${shop.images[0].image}`}
                          alt="workshopimg"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display =
                              "none";
                          }}
                          width={291}
                          height={163}
                        />
                      ) : (
                        <div className="w-full h-36 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                          <span className="text-gray-400 text-sm">
                            📷 Rasm yo'q
                          </span>
                        </div>
                      )}

                      {/* ✅ Telefon — yo'q bo'lsa "—" */}
                      <div className="flex items-center justify-between py-1.5 border-b border-gray-100">
                        <p className="text-[13px] text-[#7B7B7B]">
                          Qo'ng'iroq uchun:
                        </p>
                        <p className="text-[13px] font-medium text-[#2D2D2D]">
                          {shop.phone_number
                            ? formatPhoneNumber(shop.phone_number)
                            : "—"}
                        </p>
                      </div>

                      {/* ✅ Ish vaqti — yo'q bo'lsa "—" */}
                      <div className="flex items-center justify-between py-1.5">
                        <p className="text-[13px] text-[#7B7B7B]">Ish vaqti:</p>
                        <p className="text-[13px] font-medium text-[#2D2D2D]">
                          {shop.working_time ?? "—"}
                        </p>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>

            {/* Tanlangan joy - qizil marker */}
            <Marker position={position} icon={redIcon}>
              <Popup>
                <div
                  style={{
                    textAlign: "center",
                    fontFamily: "Arial, sans-serif",
                  }}
                >
                  <div
                    style={{
                      color: "#EF4444",
                      fontWeight: "700",
                      fontSize: "14px",
                      marginBottom: "4px",
                    }}
                  >
                    📍 {t("your_selection")}
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B7280" }}>
                    {position[0].toFixed(5)}, {position[1].toFixed(5)}
                  </div>
                </div>
              </Popup>
            </Marker>
          </MapContainer>
        </div>

        {/* ✅ Quyi o'ng: "Mening joylashuvim" 🎯 va Refresh 🔄 tugmalar */}
        <div className="absolute bottom-5 right-5 z-1000 flex flex-col gap-3">
          <button
            onClick={() => {
              if (userLocation) {
                // Har safar yangi object yaratib flyTo ni trigger qilamiz
                setFlyTarget([userLocation[0], userLocation[1]]);
              } else {
                requestUserLocation();
              }
            }}
            className="bg-white p-3 rounded-full shadow-2xl border-2 border-emerald-500 text-xl hover:bg-emerald-50 transition-colors"
            title="Mening joylashuvim"
          >
            🎯
          </button>

          <button
            onClick={() => window.location.reload()}
            className="bg-white p-3 rounded-full shadow-2xl border-2 border-blue-500 text-xl hover:bg-blue-50 transition-colors"
            title={t("refresh")}
          >
            🔄
          </button>
        </div>
      </div>
      {workshopDataModal && (
        <div className="w-[60%] bg-[#F5F6F9] rounded-[20px] p-4 h-screen overflow-scroll custom-scrollbar pb-4">
          <div className="pt-3 pb-4 relative">
            <button onClick={() => setWorkshopDataModa(false)} className="mb-3 cursor-pointer">
               <LeftOutlined style={{ fontSize: 11 }} />
            </button>
            {/* ‹ Orqaga tugma */}
            <button
              onClick={() => setImgIndex((i) => Math.max(0, i - 1))}
              className="absolute top-1/2 left-3 -translate-y-1/2 z-10
                 w-7 h-7 bg-white/80 rounded-full flex items-center
                 justify-center shadow text-gray-600 hover:bg-white"
            >
              <LeftOutlined style={{ fontSize: 11 }} />
            </button>

            {/* Rasm */}
            <div className="relative overflow-hidden rounded-2xl">
              {images.length > 0 ? (
                <img
                  key={imgIndex}
                  className="w-full h-60 rounded-2xl object-cover
                     transition-opacity duration-300"
                  src={images[imgIndex]}
                  alt={`img-${imgIndex}`}
                  width={368}
                  height={255}
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = "/placeholder.png";
                  }}
                />
              ) : (
                <div
                  className="w-full h-60 rounded-2xl bg-gray-100
                        flex items-center justify-center text-gray-400"
                >
                  📷 Rasm yo'q
                </div>
              )}

              {/* N/Total badge — yuqori o'ng */}
              {images.length > 1 && (
                <div
                  className="absolute top-3 right-3 bg-black/50 text-white
                        text-xs font-medium px-2.5 py-0.5 rounded-full"
                >
                  {imgIndex + 1}/{images.length}
                </div>
              )}
            </div>

            {/* › Oldinga tugma */}
            {imgIndex < images.length - 1 && (
              <button
                onClick={() =>
                  setImgIndex((i) => Math.min(images.length - 1, i + 1))
                }
                className="absolute top-1/2 right-3 -translate-y-1/2 z-10 
             w-7 h-7 bg-white/80 hover:bg-white 
             rounded-full flex items-center justify-center 
             shadow text-gray-600 transition-all"
              >
                <RightOutlined style={{ fontSize: 11 }} />
              </button>
            )}

            {/* Pastki nuqtalar (dots) */}
            {images.length > 1 && (
              <div className="flex justify-center gap-1.5 mt-2">
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`rounded-full transition-all duration-200 ${
                      i === imgIndex
                        ? "w-4 h-1.5 bg-blue-500"
                        : "w-1.5 h-1.5 bg-gray-300"
                    }`}
                  />
                ))}
              </div>
            )}
          </div>
          {/* rating  */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <div className="py-2 pl-3 rounded-2xl w-[50%] bg-white  ">
              <span className=" text-[#7B7B7B] text-[13px]">Mijozlar</span>
              <strong className="block font-medium text-[20px] text-[#2D2D2D]">
                +{workshopData?.total_customers || 0}
              </strong>
            </div>
            <div className="py-2 pl-3 rounded-2xl w-[50%] bg-white">
              <span className="text-[#7B7B7B] text-[13px]">Servis sifati</span>
              <strong className="block font-medium text-[20px] text-[#2D2D2D]">
                {workshopData?.rating}
              </strong>
            </div>
          </div>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center justify-between">
              <span className="text-[#7B7B7B] text-[13px]">
                Qo’ng’iroq uchun:
              </span>
              <p>
                {workshopData?.phone_number
                  ? formatPhoneNumber(workshopData.phone_number)
                  : "Raqam mavjud emas"}
              </p>
            </li>
            <li className="flex items-center justify-between">
              <span className="text-[#7B7B7B] text-[13px]">Ish vaqti:</span>
              <p>{workshopData?.working_time}</p>
            </li>
            <li>
              <strong className="text-[20px]">Bio</strong>
              <p className="pb-35">{workshopData?.description}</p>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default SearchPages;
