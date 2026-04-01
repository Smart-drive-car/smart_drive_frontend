import { useEffect, useState, useRef, } from "react";
import {
  NotificationIcon,
  PensilIcon,
  RusFlagIcon,
  UzbFlagIcon,
  CheckIcon,
  SearchIcon,
} from "../assets/icons";
import axios from "axios";
import BASE_URL from "../hooks/Env";
import Cookies from "js-cookie";
import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import type { AllCarsType, ProfileWorkshopType } from "../@types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { CustomButton } from "../components";

type Language = "uz" | "ru";

const WorkshopHeader = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>("uz");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [title, setTitle] = useState("");
  const [profileModal, setProfileModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempTitle, setTempTitle] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [_, setIsImageUploading] = useState(false);
  const [searchmodal, setSearchModal] = useState(false);
  const [modal, setModal] = useState(false);
  const [loading,setLoading] = useState<boolean>(false)

  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const token = Cookies.get("access_token");
  const [liquidType, setLiquidType] = useState("");
  const [probeg, setProbeg] = useState(0);
  const [cars, setAllCars] = useState<AllCarsType[]>([]);
  const [searchInput,setSearchInput] = useState<string>('')
  const isMouseDownOnSave = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const phoneNumberRef = useRef(phoneNumber);
  const profileImageRef = useRef(profileImage);

  

  useEffect(() => {
    phoneNumberRef.current = phoneNumber;
  }, [phoneNumber]);
  useEffect(() => {
    profileImageRef.current = profileImage;
  }, [profileImage]);

  const formatPhoneNumber = (phone: string) => {
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

  // ==================== REFRESH PROFILE FROM SERVER ====================
  const refreshProfile = async () => {
    const token = Cookies.get("access_token");
    if (!token) return;
    try {
      const res = await axios.get(`${BASE_URL}/api/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profile: ProfileWorkshopType = res.data;

      setTitle(profile.profile?.title || "");
      setPhoneNumber(profile.phone_number || "");

      // Update image from server
      if (profile.profile?.images && profile.profile.images.length > 0) {
        const rawUrl =
          profile.profile.images[profile.profile.images.length - 1].image;
        const fullUrl = rawUrl.startsWith("http")
          ? rawUrl
          : `${BASE_URL}${rawUrl}`;
        setProfileImage(fullUrl);
        localStorage.setItem("profileImageUrl", fullUrl);
      } else {
        setProfileImage(null);
        localStorage.removeItem("profileImageUrl");
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        Cookies.remove("access_token");
        Cookies.remove("refresh_token");
        window.location.href = "/log-in";
      }
    }
  };

  // ==================== UPLOAD IMAGE (AUTO) ====================
  const uploadImage = async (file: File) => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error(t("auth_error"));
      return;
    }

    setIsImageUploading(true);

    try {
      const formData = new FormData();

      formData.append("workshop_images", file, file.name);

      await axios.patch(`${BASE_URL}/api/workshops/profile/update/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await refreshProfile();
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("image_upload_error"));
      // Revert to previous image if upload fails
      await refreshProfile(); // loads the old one again
    } finally {
      setIsImageUploading(false);
      // Clear the file input so the same file can be selected again
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ==================== HANDLE IMAGE SELECTION ====================
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onloadend = () => setProfileImage(reader.result as string);
    reader.readAsDataURL(file);

    // Upload to server
    uploadImage(file);
  };

  // ==================== UPDATE NAME ONLY ====================
  const updateProfile = async () => {
    if (!token) {
      toast.error(t("auth_error"));
      return;
    }

    const nameChanged = tempTitle.trim() !== title.trim();
    if (!nameChanged) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      formData.append("title", tempTitle.trim());

      await axios.patch(`${BASE_URL}/api/workshops/profile/update/`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTitle(tempTitle.trim());
      setIsEditingName(false);
      toast.success(t("profile_updated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("profile_update_error"));
    } finally {
      setIsUpdating(false);
      isMouseDownOnSave.current = false;
    }
  };

  // ==================== NAME INPUT HANDLERS ====================
  const handleNameInputFocus = () => {
    setIsEditingName(true);
    setTempTitle(title);
  };

  const handleNameInputBlur = () => {
    setTimeout(() => {
      if (!isUpdating && !isMouseDownOnSave.current) {
        setIsEditingName(false);
        setTempTitle(title);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditingName(false);
      setTempTitle(title);
    } else if (e.key === "Enter") {
      updateProfile();
    }
  };

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


const handleAddClient = (id: number) => {
   localStorage.setItem("id",JSON.stringify(id))
   setSearchModal(false)
   setModal(true)
  
}



  // add service

  const handleAddService = async (e: React.FormEvent<HTMLFormElement>) => {
    setLoading(true)
    const carId = Number(localStorage.getItem("id"));
    
    e.preventDefault();

    const token = Cookies.get("access_token"); // tokenni shu yerda olish yaxshiroq

    if (!token) {
      toast.error("Avval tizimga kiring!");
      return;
    }

    const data = {
      description: liquidType,
      probeg: probeg,
      service_type: 1,
      car: carId,
    };

    try {
      const res = await axios.post(
        `${BASE_URL}/api/services/services/`,
        data, // ← Bu yerda to'g'ridan-to'g'ri ma'lumot
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );
      setLoading(false)

      console.log("Success:", res.data);
      toast.success("Xizmat muvaffaqiyatli qo'shildi!");
      setModal(false)
    } catch (err: any) {
      console.error("Xatolik:", err.response?.data || err);
      toast.error(
        err.response?.data?.message ||
          err.response?.data?.detail ||
          "Xizmat qo'shishda xatolik yuz berdi",
      );
    }
  };
  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.clear(); // clear all cached data
    toast.success("Profildan chiqdingiz!");
    window.location.href = "/log-in";
  };

  // ==================== INITIAL FETCH & SYNC ====================
  useEffect(() => {
    // Load cached phone number (if any) – but always refresh from server
    const cachedPhone = localStorage.getItem("phone_number");
    if (cachedPhone) setPhoneNumber(cachedPhone);

    refreshProfile(); // fetch fresh data from server

    // Sync across tabs / focus
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "phone_number" && e.newValue) setPhoneNumber(e.newValue);
      if (e.key === "profileImageUrl" && e.newValue)
        setProfileImage(e.newValue);
    };

    const handleCustomUpdate = (event: CustomEvent) => {
      if (event.detail.type === "phone_number")
        setPhoneNumber(event.detail.value);
      if (event.detail.type === "profileImage")
        setProfileImage(event.detail.value);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") refreshProfile();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "profileUpdate",
      handleCustomUpdate as EventListener,
    );
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profileUpdate",
        handleCustomUpdate as EventListener,
      );
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <header className="w-full p-7 bg-[#F5F6F9] rounded-[20px] mb-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{t("good_day")}</p>
          <p className="text-xl font-semibold text-gray-800">{title}</p>
        </div>

        <div className="flex items-center gap-5">
          {/* Language dropdown */}
          <div className="relative flex gap-9">
            <button
              onClick={() => setSearchModal(true)}
              className="flex items-center gap-2 p-2.5 rounded-4xl bg-[#1E5DE5] text-white cursor-pointer"
            >
              <span>Servis qo’shish</span>
              <PlusOutlined />
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1 cursor-pointer"
            >
              {lang === "uz" ? <UzbFlagIcon /> : <RusFlagIcon />}
              <svg
                className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
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
                {(["uz", "ru"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      localStorage.setItem("lang", l);
                      i18n.changeLanguage(l);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 cursor-pointer"
                  >
                    {l === "uz" ? <UzbFlagIcon /> : <RusFlagIcon />}
                    <span className="text-sm text-gray-800">
                      {l === "uz" ? "O'zbekcha" : "Русский"}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button className="cursor-pointer">
            <NotificationIcon />
          </button>

          {/* Profile avatar */}
          <div
            onClick={() => setProfileModal(true)}
            className="w-11 h-11 rounded-full bg-gray-400 cursor-pointer overflow-hidden"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </div>
            )}
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
            className="w-95 h-130 p-4 rounded-[20px] bg-white fixed right-8 top-24 z-50"
          >
            <div
              onClick={() => setProfileModal(false)}
              className="flex items-center gap-3 cursor-pointer mb-6"
            >
              <div className="w-5.5 h-5.5 rounded-full bg-[#F5F6F9] flex items-center justify-center">
                <LeftOutlined className="w-2 h-1" />
              </div>
              <p className="text-[#2D2D2D]">{t("profile")}</p>
            </div>

            {/* Image upload section */}
            <div className="relative">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="profile-image-upload"
              />
              <div
                className="w-20 h-20 mx-auto rounded-full mt-5.5 mb-10 cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                onClick={() =>
                  document.getElementById("profile-image-upload")?.click()
                }
              >
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center text-gray-400">
                    <svg
                      className="w-8 h-8 mb-2"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                  </div>
                )}
              </div>
              <div
                className="w-5.5 h-5.5 bg-white rounded-full flex items-center justify-center absolute bottom-0 right-33 border p-1 cursor-pointer shadow-md"
                onClick={() =>
                  document.getElementById("profile-image-upload")?.click()
                }
              >
                <PensilIcon />
              </div>
            </div>

            {/* Name input */}
            <div className="relative mb-8">
              <input
                type="text"
                value={isEditingName ? tempTitle : title}
                onChange={(e) => setTempTitle(e.target.value)}
                onFocus={handleNameInputFocus}
                onBlur={handleNameInputBlur}
                onKeyDown={handleKeyDown}
                disabled={isUpdating}
                className={`py-2.5 pl-4 rounded-[70px] outline-none w-full transition-all ${
                  isEditingName
                    ? "bg-white border border-[#007AFF]"
                    : "bg-[#F5F6F9]"
                }`}
              />
              {isEditingName && (
                <button
                  onMouseDown={() => (isMouseDownOnSave.current = true)}
                  onClick={updateProfile}
                  disabled={isUpdating}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                >
                  <CheckIcon />
                </button>
              )}
            </div>

            <strong className="block mb-2 text-[20px] text-[#2D2D2D]">
              {t("settings")}
            </strong>
            <ul className="bg-[#F5F6F9] rounded-[20px] p-4 flex flex-col gap-2">
              <li
                onClick={() => {
                  setProfileModal(false);
                  navigate("/phone-number-edit");
                }}
                className="flex justify-between border-b border-white pb-2 cursor-pointer"
              >
                <p>{t("phone_number_short")}</p>
                <div className="flex items-center gap-1.5">
                  <p>{formatPhoneNumber(phoneNumber)}</p>
                  <RightOutlined className="w-2 h-1" />
                </div>
              </li>
              <li className="flex justify-between border-b border-white pb-2">
                <p>{t("support")}</p>
                <RightOutlined className="w-2 h-1" />
              </li>
              <li className="flex justify-between">
                <p>{t("about_us")}</p>
                <RightOutlined className="w-2 h-1" />
              </li>
            </ul>

            <button
              onClick={() => {
                setProfileModal(false); // profile modalni yopamiz
                setLogoutModal(true); // logout modalni ochamiz
              }}
              className="w-full bg-[#D423231A] text-[#D42323] rounded-[50px] py-2.5 mt-6 cursor-pointer"
            >
              Profildan chiqish
            </button>
          </div>
        </>
      )}

      {/* Logout Modal */}
      {logoutModal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-96 bg-white rounded-[20px] p-6 text-center">
              <h2 className="text-xl font-semibold mb-4">
                Profildan chiqishni tasdiqlaysizmi?
              </h2>
              <p className="text-gray-600 mb-6">
                Chiqib ketgach qayta login qilishingiz kerak bo'ladi.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={() => setLogoutModal(false)}
                  className="flex-1 py-2.5 bg-[#F5F6F9] rounded-3xl"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 py-2.5 bg-[#D423231A] text-[#D42323] rounded-3xl"
                >
                  Ha, chiqish
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* searchCliend  */}

      {searchmodal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-120 bg-white rounded-[20px] p-6  overflow-auto h-150 custom-scrollbar">
              <ul className="flex items-center gap-3 mb-5">
                <li
                  onClick={() => setSearchModal(false)}
                  className=" cursor-pointer w-9 h-9 rounded-full bg-[#F5F6F9] flex items-center justify-center"
                >
                  <LeftOutlined />
                </li>
                <li >
                  <strong className="text-[20px] font-medium">Qo’shish</strong>
                  <p className="text-[#7B7B7B]">
                    Xizmat ko’rsatgan mijozni qo’shing
                  </p>
                </li>
              </ul>
               <label className="relative ">
                <input onChange={(e) => setSearchInput(e.target.value)} type="text" placeholder="Qidirish" className="py-3 pl-3 rounded-[40px] bg-[#F5F6F9] outline-none w-full mb-3"/>
                 <button  className="absolute right-4 top-px">
                    <SearchIcon/>
                 </button>
               </label>

              {cars.map((item) => (
               
                  <div className="bg-[#F5F6F9] p-3 rounded-[20px] mb-2">
                    <div
                      key={item.id}
                      className="flex items-center justify-between pb-3"
                    >
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
                          {item.driver.image ? (
                            <img
                              src={item.driver.image}
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
                            {item.driver.phone_number}
                          </p>
                        </div>
                      </div>

                      <button onClick={() => handleAddClient(item.id)} className="py-0.5 px-2.5 text-[#1E5DE5] bg-[#E4ECFE] rounded-[40px] cursor-pointer hover:bg-[#D8E6FF] transition-colors">
                        Qo'shish
                      </button>
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
        </>

      )}

      {/* addServis modal  */}
      {modal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="fixed inset-0 flex items-center justify-center z-50">
            <div className="w-120 bg-white rounded-[20px] p-6 ">
              <ul className="flex items-center gap-3 mb-5">
                <li
                  onClick={() => setModal(false)}
                  className=" cursor-pointer w-9 h-9 rounded-full bg-[#F5F6F9] flex items-center justify-center"
                >
                  <LeftOutlined />
                </li>
                <li className="">
                  <strong className="text-[20px] font-medium">Qo’shish</strong>
                  <p className="text-[#7B7B7B]">
                    Tegishli ma’lumotlarni kiriting
                  </p>
                </li>
              </ul>
              <form
                onSubmit={(e) => handleAddService(e)}
                className="flex flex-col gap-4"
              >
                {/* <label>
                  <span className="pl-4">Servis turini tanlang*</span>
                  <input
                    type="text"
                    placeholder="Moy almashtirish"
                    className="py-2.5 pl-4 rounded-4xl bg-[#F5F6F9] outline-none w-full"
                  />
                </label> */}
                <label>
                  <span className="pl-4">Moy turini yozing*</span>
                  <input
                    onChange={(e) => setLiquidType(e.target.value)}
                    required
                    type="text"
                    placeholder="Liqui"
                    className="py-2.5 pl-4 rounded-4xl bg-[#F5F6F9] outline-none w-full"
                  />
                </label>
                <label>
                  <span className="pl-4">Moy necha km ga mo’ljallangan?*</span>
                  <input
                    onChange={(e) => setProbeg(Number(e.target.value))}
                    required
                    type="text"
                    placeholder="55 000km"
                    className="py-2.5 pl-4 rounded-4xl bg-[#F5F6F9] outline-none w-full"
                  />
                </label>
                <CustomButton
                  type="submit"
                  text={ loading ? "Tasdiqlash..." : "Tasdiqlash"}
                  className={loading ? "bg-blue-400 rounded-4xl!" :"bg-[#1E5DE5]! rounded-4xl!"}
                />
              </form>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default WorkshopHeader;
