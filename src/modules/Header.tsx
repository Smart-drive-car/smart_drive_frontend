import { useEffect, useState, useRef } from "react";
import { NotificationIcon, PensilIcon, RusFlagIcon, UzbFlagIcon, CheckIcon } from "../assets/icons";
import axios from "axios";
import BASE_URL from "../hooks/Env";
import Cookies from "js-cookie";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import type { ProfileType, ProfileWorkshopType } from "../@types";
import { LocationImg } from "../assets/images";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";


type Language = "uz" | "ru";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>("uz");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [profileModal, setProfileModal] = useState(false);
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  // Preview uchun base64, upload uchun original File
  const [profileImage, setProfileImage] = useState<string | null>(() => {
    return localStorage.getItem("profileImage") || null;
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [role,setRole] = useState<string>("")
  const [title,setTitle ] = useState<string>("")

  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFullName, setTempFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Blur vs CheckIcon bosilishi muammosini hal qilish uchun
  const isMouseDownOnSave = useRef(false);

  // ------- Phone number formatter -------
  const formatPhoneNumberDisplay = (phone: string) => {
    if (!phone) return "";
    const digits = phone.replace(/\D/g, "");

    if (digits.startsWith("998") && digits.length === 12) {
      const local = digits.slice(3);
      return `+998 ${local.slice(0, 2)} ${local.slice(2, 5)} ${local.slice(5, 7)} ${local.slice(7)}`;
    }

    if (digits.length === 9) {
      return `+998 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 7)} ${digits.slice(7)}`;
    }

    return phone;
  };

  // ------- Image upload: File ham, preview ham saqlanadi -------
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file); // API uchun original file

    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setProfileImage(result); // Preview uchun base64
      localStorage.setItem("profileImage", result);
    };
    reader.readAsDataURL(file);
  };

  // ------- Profile yangilash -------
  const updateProfile = async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error(t("auth_error"));
      return;
    }

    // O'zgarish yo'q bo'lsa chiqib ket
    const nameChanged = tempFullName.trim() !== (role === "DRIVER" ? fullName.trim() : title.trim());
    const imageChanged = selectedFile !== null;

    if (!nameChanged && !imageChanged) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();

      if (nameChanged) {
        if (role === "DRIVER") {
          formData.append("full_name", tempFullName.trim());
        } else {
          formData.append("title", tempFullName.trim());
        }
      }

      // ✅ Original File object'ni to'g'ridan-to'g'ri yuborish (base64 → fetch emas)
      if (imageChanged && selectedFile) {
        if (role === "DRIVER") {
          formData.append("image", selectedFile, selectedFile.name);
        } else {
          formData.append("workshop_images", selectedFile, selectedFile.name);
        }
      }

      const endpoint = role === "DRIVER" 
        ? `${BASE_URL}/api/drivers/profile/update/`
        : `${BASE_URL}/api/workshops/profile/update/`;

      await axios.patch(endpoint, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (nameChanged) {
        if (role === "DRIVER") {
          setFullName(tempFullName.trim());
        } else {
          setTitle(tempFullName.trim());
        }
      }

      setSelectedFile(null); // Yuborilgan faylni tozala
      setIsEditingName(false);
      toast.success(t("profile_updated"));
    } catch (error: any) {
      toast.error(
        error.response?.data?.message || t("profile_update_error")
      );
    } finally {
      setIsUpdating(false);
      isMouseDownOnSave.current = false;
    }
  };

  // ------- Name input handlers -------
  const handleNameInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempFullName(e.target.value);
  };

  const handleNameInputFocus = () => {
    setIsEditingName(true);
    setTempFullName(role === "DRIVER" ? fullName : title);
  };

  // ✅ setTimeout — CheckIcon bosilishidan oldin blur ishlamasligi uchun
  const handleNameInputBlur = () => {
    setTimeout(() => {
      if (!isUpdating && !isMouseDownOnSave.current) {
        setIsEditingName(false);
        setTempFullName(role === "DRIVER" ? fullName : title);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditingName(false);
      setTempFullName(role === "DRIVER" ? fullName : title);
    } else if (e.key === "Enter") {
      updateProfile();
    }
  };

  // ------- Fetch profile -------
  useEffect(() => {
    const token = Cookies.get("access_token");
    if (!token) {
      return;
    }

    const fetchProfile = () => {
      const role = localStorage.getItem("role")
       if(role === 'DRIVER'){
         axios
           .get(`${BASE_URL}/api/auth/profile/`, {
             headers: {
               Authorization: `Bearer ${token}`,
             },
           })
           .then((res) => {
             const profile: ProfileType = res.data;
             
             setPhoneNumber(profile.phone_number);
             setFullName(profile.profile?.full_name || "");
             setRole(profile.role)
   
             // Serverdan kelgan rasm bor bo'lsa ishlat, aks holda localStorage'dagi qolsin
             if (profile.profile?.image && profile.profile.image.length > 0) {
               setProfileImage(profile.profile.image[0]);
             }
           })
           .catch((err) => {
             if (err.response?.status === 401) {
               Cookies.remove("access_token");
               Cookies.remove("refresh_token");
               window.location.href = "/log-in";
             } else if (err.response?.status === 500) {
               toast.error(t("server_error_try_later"));
             } else {
               toast.error(err.response?.data?.message || t("error_generic"));
             }
           });
       }
       else{
        
          axios
           .get(`${BASE_URL}/api/auth/profile/`, {
             headers: {
               Authorization: `Bearer ${token}`,
             },
           })
           .then((res) => {
             const profile: ProfileWorkshopType = res.data;
             
             setTitle(profile.profile?.title || "");
             setPhoneNumber(profile.phone_number || "")
   
            
           })
           .catch((err) => {
             if (err.response?.status === 401) {
               Cookies.remove("access_token");
               Cookies.remove("refresh_token");
               window.location.href = "/log-in";
             } else if (err.response?.status === 500) {
               toast.error(t("server_error_try_later"));
             } else {
               toast.error(err.response?.data?.message || t("error_generic"));
             }
           });

       }
    };

    fetchProfile();

    // ✅ Dependency array bo'sh — faqat mount bo'lganda bir marta ishlaydi
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "phone_number" && e.newValue) {
        setPhoneNumber(e.newValue);
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []); // ✅ bo'sh array — sonsiz loop yo'q

  return (
    <header className="w-full p-7 bg-[#F5F6F9] rounded-[20px] mb-4 relative">
      <div className="flex items-center justify-between">
        {/* Left */}
        <div>
          <p className="text-sm text-gray-400">{t("good_day")}</p>
          <p className="text-xl font-semibold text-gray-800">{role == "DRIVER" ? fullName : title}</p>
        </div>

        {/* Right */}
        <div className="flex items-center gap-5">
          {/* Language selector */}
          <div className="flex items-center gap-3 relative">
            <div className="flex">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-1 cursor-pointer"
              >
                {lang === "uz" ? <UzbFlagIcon /> : <RusFlagIcon />}
                <svg
                  className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              {isOpen && (
                <div className="absolute right-0 top-10 bg-white rounded-2xl shadow-lg overflow-hidden z-50 min-w-40 py-1">
                  <button
                    onClick={() => {
                      setLang("uz");
                      localStorage.setItem("lang", "uz");
                      i18n.changeLanguage("uz");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <UzbFlagIcon />
                    <span className="text-sm text-gray-800">O'zbekcha</span>
                  </button>
                  <button
                    onClick={() => {
                      setLang("ru");
                      localStorage.setItem("lang", "ru");
                      i18n.changeLanguage("ru");
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  >
                    <RusFlagIcon />
                    <span className="text-sm text-gray-800">Русский</span>
                  </button>
                </div>
              )}
            </div>
          </div>
          <button className="cursor-pointer">
            <NotificationIcon />
          </button>
          <div
            onClick={() => setProfileModal(true)}
            className="w-11 h-11 rounded-full bg-gray-400 cursor-pointer overflow-hidden"
          >
            <img
              src={profileImage || LocationImg}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>

      {/* Profile Modal */}
      {profileModal && (
        <>
          <div
            className="fixed inset-0 z-50 backdrop-blur-sm bg-black/40"
            onClick={() => setProfileModal(false)}
          />
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-93.75 h-120 p-4 rounded-[20px] bg-white ml-auto fixed inset-0 z-50 right-30 top-20.5 backdrop-blur-sm"
          >
            {/* Header */}
            <div
              onClick={() => setProfileModal(false)}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-[#F5F6F9] flex items-center justify-center">
                <LeftOutlined className="w-2 h-1" />
              </div>
              <p className="text-[#2D2D2D]">{t("profile")}</p>
            </div>

            {/* Avatar */}
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image-upload"
              />
              <img
                className="w-20 h-20 mx-auto rounded-full mt-5.5 mb-10 cursor-pointer border object-cover"
                src={profileImage || LocationImg}
                alt="Profile"
                width={80}
                height={80}
                onClick={() => document.getElementById("profile-image-upload")?.click()}
              />
              <div
                className="w-5.5 h-5.5 bg-[#FFFFFF] rounded-full flex items-center justify-center absolute bottom-0 right-33 border p-1 cursor-pointer"
                onClick={() => document.getElementById("profile-image-upload")?.click()}
              >
                <PensilIcon />
              </div>
            </div>

            {/* Name input */}
            <div className="relative">
              <input
                type="text"
                value={isEditingName ? tempFullName : role === "DRIVER" ? fullName : title}
                onChange={handleNameInputChange}
                onFocus={handleNameInputFocus}
                onBlur={handleNameInputBlur}
                onKeyDown={handleKeyDown}
                className={`py-2.5 pl-4 rounded-[70px] outline-none w-full mt-2 transition-all ${
                  isEditingName
                    ? "bg-white border border-[#007AFF]"
                    : "bg-[#F5F6F9] border-transparent"
                }`}
                disabled={isUpdating}
              />
              {isEditingName && (
                <button
                  onMouseDown={() => { isMouseDownOnSave.current = true; }} // ✅ blur'dan oldin flag set
                  onClick={updateProfile}
                  disabled={isUpdating}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <CheckIcon />
                </button>
              )}
            </div>

            {/* Settings */}
            <strong className="block mt-5.5 mb-2 text-[20px] text-[#2D2D2D]">
              {t("settings")}
            </strong>
            <ul className="bg-[#F5F6F9] rounded-[20px] p-4 flex flex-col gap-2 cursor-pointer">
              <li
                onClick={(e) => {
                  e.stopPropagation();
                  setProfileModal(false);
                  navigate("/phone-number-edit");
                }}
                className="flex items-center justify-between border-b border-white pb-2"
              >
                <p>{t("phone_number_short")}</p>
                <div className="flex items-center gap-1.5">
                  <p>{formatPhoneNumberDisplay(phoneNumber)}</p>
                  <RightOutlined className="w-2 h-1" />
                </div>
              </li>
              <li className="flex items-center justify-between border-b border-white pb-2">
                <p>{t("support")}</p>
                <div className="flex items-center gap-1.5">
                  <RightOutlined className="w-2 h-1" />
                </div>
              </li>
              <li className="flex items-center justify-between border-b border-white pb-2">
                <p>{t("about_us")}</p>
                <div className="flex items-center gap-1.5">
                  <RightOutlined className="w-2 h-1" />
                </div>
              </li>
            </ul>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;