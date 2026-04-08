import { useNavigate } from "react-router-dom";
import { LocationImg, WorkshopImg } from "../../assets/images";
import { useTranslation } from "react-i18next";
import { useState, useContext } from "react";
import { AuthContext, type AuthContextType } from "../../context/UseContext";
import { registerWorkshop } from "../../services/api/workshopApi";

import { MapContainer, TileLayer, Marker } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const markerIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const WorkshopMediaLocation = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");     // ← error ni saqlash uchun

  const {
    phoneNumber,
    workshopTitle,
    workshopAddress,
    workshopDescription,
    workshopWorkingTime,
    workshopPassword,
    workshopPasswordConfirm,
    workshopLocation,
    workshopImages = [],   // default empty array
    clearWorkshopData,
  } = useContext(AuthContext) as AuthContextType;

  const hasImages = workshopImages.length > 0;
  const hasLocation = !!workshopLocation;

  const convertBase64ToFile = (base64String: string, filename: string): File => {
    const arr = base64String.split(",");
    const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new File([u8arr], filename, { type: mime });
  };

  const cleanPhoneNumber = (phone: string): string => phone.replace(/[^0-9]/g, "");

  const handleContinue = async () => {
    if (!phoneNumber || !workshopTitle || !workshopPassword) {
      setError("Kerakli maydonlar to'ldirilmagan");
      return;
    }
    if (!hasImages) {
      setError("Kamida bitta rasm tanlang");
      return;
    }
    if (!hasLocation) {
      setError("Joylashuvni tanlang");
      return;
    }

    const mainImage = convertBase64ToFile(workshopImages[0], "main_image.jpg");
    const workshopImagesList = workshopImages.map((img: string, index: number) =>
      convertBase64ToFile(img, `workshop_image_${index}.jpg`)
    );

    setSubmitting(true);
    setError("");

    try {
      const response = await registerWorkshop({
        phone_number: cleanPhoneNumber(phoneNumber),
        password: workshopPassword,
        password_confirm: workshopPasswordConfirm || workshopPassword,
        role: "WORKSHOP",
        full_name: workshopTitle,
        image: mainImage,
        title: workshopTitle,
        address: workshopAddress || "",
        description: workshopDescription || "",
        working_time: workshopWorkingTime || "",
        latitude: String(workshopLocation.lat.toFixed(6)),
        longitude: String(workshopLocation.lng.toFixed(6)),
        workshop_images: workshopImagesList,
      }, t);

      if (response.success && response.token) {
        localStorage.setItem("token", response.token);
        clearWorkshopData?.();
        navigate("/");
      } else {
        setError(response.message || "Ro'yxatdan o'tishda xatolik");
      }
    } catch (err: any) {
      console.error(err);
      setError("Server bilan aloqa xatosi: " + (err.message || ""));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen bg-white">
      <div className="flex flex-col gap-4">

        {/* RASMLAR QISMI - Sizning dizayningiz o'zgarmadi */}
        <div className="bg-[#F5F6F9] rounded-2xl px-4 pt-5 pb-4 w-157!">
          <p className="text-[#2D2D2D] text-[13px] mb-5 w-60">
            {t("workshop_add_images_hint")}
          </p>

          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {hasImages ? (
              <>
                {workshopImages.map((img: string, index: number) => (
                  <div
                    key={index}
                    className="shrink-0 w-28! h-28.75! rounded-xl overflow-hidden"
                  >
                    <img
                      src={img}
                      alt={`img-${index}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
                <button
                  onClick={() => navigate("/register-img-pages")}
                  className="shrink-0 w-28! h-28.75! rounded-xl bg-white border border-gray-300 flex items-center justify-center text-gray-400 text-2xl cursor-pointer transition"
                >
                  +
                </button>
              </>
            ) : (
              <div className="w-full flex flex-col items-center py-2">
                <img src={WorkshopImg} alt={t("workshop_image_alt")} width={80} height={80} className="mx-auto mb-4" />
                <button
                  onClick={() => navigate("/register-img-pages")}
                  className="w-full py-2.5 bg-[#E4ECFE] rounded-full text-[#1E5DE5] text-sm font-medium hover:bg-[#d3e2fd] transition"
                >
                  {t("add")}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* LOKATSIYA QISMI - Sizning dizayningiz saqlangan */}
        <div className="bg-[#F5F6F9] rounded-2xl px-4 pt-5 pb-4">
          <p className="text-[#2D2D2D] text-[13px] mb-4">
            {t("workshop_set_location_hint")}
          </p>

          {hasLocation ? (
            <div className="w-150! h-48.25 rounded-xl overflow-hidden mb-3">
              <MapContainer
                center={[workshopLocation.lat, workshopLocation.lng]}
                zoom={15}
                style={{ width: "100%", height: "100%" }}
                zoomControl={false}
                scrollWheelZoom={false}
                dragging={false}
                doubleClickZoom={false}
                attributionControl={false}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[workshopLocation.lat, workshopLocation.lng]} icon={markerIcon} />
              </MapContainer>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center py-2">
              <img src={LocationImg} alt={t("location_image_alt")} width={80} height={80} className="mx-auto mb-4" />
              <button
                onClick={() => navigate("/register-location-pages")}
                className="w-full py-2.5 bg-[#E4ECFE] rounded-full text-[#1E5DE5] text-sm font-medium hover:bg-[#d3e2fd] transition"
              >
                {t("set")}
              </button>
            </div>
          )}

          {hasLocation && (
            <button
              onClick={() => navigate("/register-location-pages")}
              className="w-full py-2.5 bg-[#E4ECFE] rounded-full text-[#1E5DE5] text-sm font-medium hover:bg-[#d3e2fd] transition"
            >
             {t("ozgartirish")}
            </button>
          )}
        </div>

        {/* Error ko'rsatish */}
        {error && <p className="text-red-500 text-sm text-center px-4">{error}</p>}

        {/* DAVOM ETISH TUGMASI */}
        {hasImages && hasLocation && (
          <button
            onClick={handleContinue}
            disabled={submitting}
            className={`w-100 py-2.5 rounded-full ml-auto transition ${
              submitting
                ? "bg-blue-400 text-white cursor-not-allowed"
                : "bg-[#1E5DE5] text-white hover:bg-[#1a52cc]"
            }`}
          >
            {submitting ? t("davom__etish") : t("davom_etish")}
          </button>
        )}
      </div>
    </section>
  );
};

export default WorkshopMediaLocation;