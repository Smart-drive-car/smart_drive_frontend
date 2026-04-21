import { useEffect, useState, useRef, useContext } from "react";
import {
  NotificationIcon,
  PensilIcon,
  RusFlagIcon,
  UzbFlagIcon,
  CheckIcon,
  ExitIcon,
  CopyIcon,
  ShareIcon,
  DowlandIcon,
  XIcon,
  RedIcon,
  WarningIcon,
} from "../assets/icons";
import axios from "axios";
import BASE_URL from "../hooks/Env";
import Cookies from "js-cookie";
import { LeftOutlined, RightOutlined } from "@ant-design/icons";
import { toast } from "react-toastify";
import {
  type LastServiceType,
  type NotificatonType,
  type ProfileType,
} from "../@types";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthContext } from "../context/UseContext";

type Language = "uz" | "ru";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [lang, setLang] = useState<Language>(
    (localStorage.getItem("lang") as Language) || "uz",
  );
  const [phoneNumber, setPhoneNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [profileModal, setProfileModal] = useState(false);
  const [logoutModal, setLogoutModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempFullName, setTempFullName] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [notificationModal, setNotificationModal] = useState<boolean>(false);
  const [allNotification, setAllNotification] = useState<NotificatonType[]>([]);
  const token = Cookies.get("access_token");
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const isMouseDownOnSave = useRef(false);
  const phoneNumberRef = useRef(phoneNumber);
  const profileImageRef = useRef(profileImage);
  const { carId, setServisId, servisId } =
    useContext(AuthContext)!;
  const [servis, setServis] = useState<LastServiceType | null>(null);
  const [notificationCount, setNotificationCount] = useState<number>(0);
  const [inputProbegModal, setInputProbegModal] = useState(false);
  const [inputProbeg, setInputProbeg] = useState<string>("");
  const [loading, setLoading] = useState(false);

  console.log(profileImage,"img");
  

  useEffect(() => {
    phoneNumberRef.current = phoneNumber;
  }, [phoneNumber]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log(file,"file");
    
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    console.log(localUrl,"local");
    
    setProfileImage(localUrl);

    setSelectedFile(file);
    const formData = new FormData();
    formData.append("image", file);

    axios
      .patch(`${BASE_URL}/api/auth/profile/driver/update/`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        const imageUrl = res.data.data?.image || res.data.image;
        if (imageUrl) {
          const fullUrl = imageUrl.includes('http') 
            ? imageUrl 
            : `${BASE_URL}${imageUrl}`;
          setProfileImage(fullUrl);
        }
        toast.success(t("profile_updated"));
      })
      .catch((err) => {
        console.error("Rasm yuklashda xatolik:", err);
        toast.error(t("profile_update_error"));
      });
  };

  const updateProfile = async () => {
    const token = Cookies.get("access_token");
    if (!token) {
      toast.error(t("auth_error"));
      return;
    }

    const nameChanged = tempFullName.trim() !== fullName.trim();
    const imageChanged = selectedFile !== null;
    if (!nameChanged && !imageChanged) {
      setIsEditingName(false);
      return;
    }

    setIsUpdating(true);
    try {
      const formData = new FormData();
      if (nameChanged) formData.append("full_name", tempFullName.trim());
      if (imageChanged && selectedFile)
        formData.append("image", selectedFile, selectedFile.name);

      const response = await axios.patch(`${BASE_URL}/api/drivers/profile/update/`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (nameChanged) setFullName(tempFullName.trim());
      
      if (imageChanged && response.data?.image) {
        const imageUrl = response.data.image;
        const fullUrl = imageUrl.includes('http')
          ? imageUrl
          : `${BASE_URL}${imageUrl}`;
        setProfileImage(fullUrl);
      }
      
      setSelectedFile(null);
      setIsEditingName(false);
      toast.success(t("profile_updated"));
    } catch (error: any) {
      toast.error(error.response?.data?.message || t("profile_update_error"));
    } finally {
      setIsUpdating(false);
      isMouseDownOnSave.current = false;
    }
  };

  const handleNameInputFocus = () => {
    setIsEditingName(true);
    setTempFullName(fullName);
  };

  const handleNameInputBlur = () => {
    setTimeout(() => {
      if (!isUpdating && !isMouseDownOnSave.current) {
        setIsEditingName(false);
        setTempFullName(fullName);
      }
    }, 150);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setIsEditingName(false);
      setTempFullName(fullName);
    } else if (e.key === "Enter") updateProfile();
  };

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.clear();
    toast.success("Profildan chiqdingiz!");
    window.location.href = "/log-in";
  };

  //  profile
  useEffect(() => {
    if (!token) return;

    axios
      .get(`${BASE_URL}/api/auth/profile/`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        const profile: ProfileType = res.data;
        console.log(profile,profile);
        

        setPhoneNumber(profile.phone_number);
        setFullName(profile.profile?.full_name || "");
        
        if (profile.profile?.image) {
          const fullUrl = profile.profile.image.includes('http')
            ? profile.profile.image
            : `${BASE_URL}${profile.profile.image}`;
          setProfileImage(fullUrl);
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          toast.error(err.response?.data?.message || t("error_generic"));
          Cookies.remove("access_token");
          Cookies.remove("refresh_token");
          window.location.href = "/log-in";
        }
      });

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "phone_number" && e.newValue) setPhoneNumber(e.newValue);
      if (e.key === "profileImage" && e.newValue) setProfileImage(e.newValue);
    };

    const handleCustomUpdate = (event: CustomEvent) => {
      if (event.detail.type === "phone_number")
        setPhoneNumber(event.detail.value);
      if (event.detail.type === "profileImage")
        setProfileImage(event.detail.value);
    };

    const handleFocus = () => {
      const currentPhone = localStorage.getItem("phone_number");
      const currentImage = localStorage.getItem("profileImage");
      if (currentPhone && currentPhone !== phoneNumberRef.current)
        setPhoneNumber(currentPhone);
      if (currentImage && currentImage !== profileImageRef.current)
        setProfileImage(currentImage);
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener(
      "profileUpdate",
      handleCustomUpdate as EventListener,
    );
    window.addEventListener("focus", handleFocus);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "profileUpdate",
        handleCustomUpdate as EventListener,
      );
      window.removeEventListener("focus", handleFocus);
    };
  }, []);

  // notification pages
  useEffect(() => {
 
    axios
      .get(`${BASE_URL}/api/notifications/?car_id=${carId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setAllNotification(res.data);
          const unreadCount = res.data.filter((n: NotificatonType) => !n.is_read).length;
      setNotificationCount(unreadCount);
      });
  }, [carId,servisId]);

  

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

  const handleShowServis = (id: number) => {
    axios
      .get(`${BASE_URL}/api/services/services/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((res) => {
        setServis(res.data);
      });
  };

  // input probeg

  const formatMileage = (value: string) => {
    const digits = value.replace(/\D/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  };

  const handleMileageInputChange = (value: string) => {
    setInputProbeg(formatMileage(value));
  };

  const handleInputProbeg = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      current_mileage: Number(inputProbeg.replace(/\s/g, "")),
    };

    axios
      .patch(`${BASE_URL}/api/vehicles/${carId}/`, data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(() => {
        setServisId(servisId + 1);
        clearOverdueNotifications();
        setLoading(false);
        toast.success(t("probeg_ozgartirildi"));
        setInputProbegModal(false);
      })
      .catch(() => {
        toast.error(t("xatolik_yuz_berdi"));
        setLoading(false);
      });
  };

  const markAsRead = (notifId: number) => {
    axios
      .post(
        `${BASE_URL}/api/notifications/${notifId}/mark-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        setAllNotification((prev) =>
          prev.map((n) => (n.id === notifId ? { ...n, is_read: true } : n)),
        );
        setNotificationCount((prev) => Math.max(0, prev - 1));
      });
  };

  const markOverdueNotificationAsRead = (notifId: number) => {
    axios
      .post(
        `${BASE_URL}/api/notifications/${notifId}/mark-read/`,
        {},
        { headers: { Authorization: `Bearer ${token}` } },
      )
      .then(() => {
        setAllNotification((prev) => prev.filter((n) => n.id !== notifId));
        setNotificationCount((prev) => Math.max(0, prev - 1));
      })
      .catch(() => {
        setAllNotification((prev) => prev.filter((n) => n.id !== notifId));
      });
  };

  const clearOverdueNotifications = async () => {
    const overdueNotifications = allNotification.filter(
      (n) => n.data.event === "warning_overdue" && !n.is_read,
    );

    if (overdueNotifications.length > 0) {
      try {
        await Promise.all(
          overdueNotifications.map((item) =>
            axios.post(
              `${BASE_URL}/api/notifications/${item.id}/mark-read/`,
              {},
              { headers: { Authorization: `Bearer ${token}` } },
            ),
          ),
        );
      } catch (error) {
        console.warn("warning_overdue mark-read xatosi:", error);
      }
    }

    const remainingUnreadCount = allNotification.filter(
      (n) => n.data.event !== "warning_overdue" && !n.is_read,
    ).length;

    setAllNotification((prev) => prev.filter((n) => n.data.event !== "warning_overdue"));
    setNotificationCount(remainingUnreadCount);
  };

  

  return (
    <header className="w-full p-7 bg-[#F5F6F9] rounded-[20px] mb-4 relative">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-400">{t("good_day")}</p>
          <p className="text-xl font-semibold text-gray-800">{fullName}</p>
        </div>

        <div className="flex items-center gap-5">
          {/* Language selector */}
          <div className="relative flex">
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
                {(["uz", "ru"] as Language[]).map((l) => (
                  <button
                    key={l}
                    onClick={() => {
                      setLang(l);
                      localStorage.setItem("lang", l);
                      i18n.changeLanguage(l);
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
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
          <button
            onClick={() => {
              setNotificationModal(true);
              // Barcha o'qilmaganlarni mark-read qilish
              allNotification
                .filter((n) => !n.is_read)
                .forEach((n) => markAsRead(n.id));
            }}
            className="group relative p-2 rounded-full hover:bg-gray-100 transition-all duration-200 cursor-pointer"
          >
            {/* Bildirishnomalar belgisi */}
            <NotificationIcon />

            {/* Raqamli Badge */}
            {notificationCount > 0 && (
              <span className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
                {notificationCount > 99 ? "99+" : notificationCount}

                {/* Animatsiya */}
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              </span>
            )}
          </button>
          <div
            onClick={() => setProfileModal(true)}
            className="w-11 h-11 rounded-full bg-gray-400 cursor-pointer overflow-hidden"
          >
            {profileImage && profileImage !== "null" && profileImage !== "undefined" ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center">
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
            className="w-93.75 h-130 p-4 rounded-[20px] bg-white fixed inset-0 z-50 right-30 top-20.5 ml-auto"
          >
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
              <div
                className="w-20 h-20 mx-auto rounded-full mt-5.5 mb-10 cursor-pointer border-2 border-dashed border-gray-300 flex items-center justify-center overflow-hidden"
                onClick={() =>
                  document.getElementById("profile-image-upload")?.click()
                }
              >
                {profileImage && profileImage !== "null" && profileImage !== "undefined" ? (
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
            <div className="relative">
              <input
                type="text"
                value={isEditingName ? tempFullName : fullName}
                onChange={(e) => setTempFullName(e.target.value)}
                onFocus={handleNameInputFocus}
                onBlur={handleNameInputBlur}
                onKeyDown={handleKeyDown}
                disabled={isUpdating}
                className={`py-2.5 pl-4 rounded-[70px] outline-none w-full mt-2 transition-all ${isEditingName ? "bg-white border border-[#007AFF]" : "bg-[#F5F6F9] border-transparent"}`}
              />
              {isEditingName && (
                <button
                  onMouseDown={() => {
                    isMouseDownOnSave.current = true;
                  }}
                  onClick={updateProfile}
                  disabled={isUpdating}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
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
                  <p>{formatPhoneNumber(phoneNumber)}</p>
                  <RightOutlined className="w-2 h-1" />
                </div>
              </li>
              <li
                onClick={() => toast.info(t("keyingi_versiyada"))}
                className="flex items-center justify-between border-b border-white pb-2"
              >
                <p>{t("support")}</p>
                <RightOutlined className="w-2 h-1" />
              </li>
              <li
                onClick={() => toast.info(t("keyingi_versiyada"))}
                className="flex items-center justify-between border-b border-white pb-2"
              >
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
              {t("profildan_chiqish")}
            </button>
          </div>
        </>
      )}
      {/* Notification modal  */}
      {notificationModal && (
        <>
          <div className="fixed inset-0 z-50 backdrop-blur bg-black/40" />
          <div className="w-130 h-screen p-4 rounded-tl-[20px] rounded-bl-[20px] bg-white fixed inset-0 z-50 right-0 ml-auto pt-8 pb-10 px-7 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#2D2D2D] text-[24px] font-medium">
                {t("bildirishnomalar")}
              </h2>
              <button
                onClick={() => {
                  setNotificationModal(false);
                  setServis(null);
                }}
                className="cursor-pointer"
              >
                <ExitIcon />
              </button>
            </div>

            {/* Bildirishnomalar ro'yxati */}
            <div className="flex flex-col gap-2">
              {allNotification && allNotification.length > 0 ? (
                (() => {
                  // 1. Oddiy xabarlar (service_created)
                  const serviceCreated = allNotification.filter(
                    (n) => n.data.event === "service_created",
                  );

                  // 2. Sariq ogohlantirishlar (warning - qolgan barcha eventlar warning_overdue'dan tashqari)
                  const warnings = allNotification.filter(
                    (n) =>
                      n.data.event !== "service_created" &&
                      n.data.event !== "warning_overdue",
                  );

                  // 3. Qizil ogohlantirish (warning_overdue - qo'lda kiritish)
                  const overdue = allNotification.filter(
                    (n) => n.data.event === "warning_overdue",
                  );

                  // Massivlarni siz aytgan tartibda birlashtiramiz
                  const sortedNotifications = [
                    ...serviceCreated,
                    ...warnings,
                    ...overdue,
                  ];

                  return sortedNotifications.map((item, index) => {
                    if (item.data.event === "service_created") {
                      return (
                        <div
                          key={index}
                          onClick={() => {
                            handleShowServis(Number(item.data.service_id));
                            if (!item.is_read) markAsRead(item.id);
                          }}
                          className={`w-full py-3 px-3 rounded-2xl cursor-pointer transition-colors ${
                            servis?.id === Number(item.data.service_id)
                              ? "bg-[#E4ECFE]"
                              : "bg-[#F5F6F9]"
                          }`}
                        >
                          <ul className="flex items-center justify-between pointer-events-none">
                            <li className="flex items-center gap-2">
                              {item.data.image ? (
                                <img
                                  className="w-11 h-11 rounded-lg object-cover shrink-0"
                                  src={item.data.image}
                                  alt="rasm"
                                />
                              ) : (
                                <div className="w-11 h-11 rounded-lg bg-linear-to-br from-blue-400 to-blue-600 flex items-center justify-center shrink-0">
                                  <span className="text-white text-lg font-bold uppercase">
                                    {"?"}
                                  </span>
                                </div>
                              )}
                              <div>
                                <strong className="text-[#2D2D2D] block">
                                  {item.title}
                                </strong>
                              </div>
                            </li>
                            <li>
                              <RightOutlined
                                className={`w-2 h-2 ${
                                  servis?.id === Number(item.data.service_id)
                                    ? "text-blue-600"
                                    : "text-gray-400"
                                }`}
                              />
                            </li>
                          </ul>
                        </div>
                      );
                    } else if (item.data.event === "warning_overdue") {
                      return (
                        <div
                          key={index}
                          className="p-3 rounded-2xl bg-[#F5F6F9]"
                        >
                          <ul className="flex items-start gap-3">
                            <li className="bg-white rounded-full">
                              <span className="block p-2.75!">
                                <RedIcon />
                              </span>
                            </li>
                            <li>
                              <strong className="text-[#D42323]">
                                {item.title}
                              </strong>
                              <p className="text-[#7B7B7B] text-[14px]">
                                {item.body?.[lang] || item.body?.uz}
                              </p>
                            </li>
                          </ul>
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              onClick={() => {
                                clearOverdueNotifications();
                                setNotificationModal(false);
                              }}
                              className="py-2 w-[50%] text-[#2D2D2D] rounded-4xl bg-white cursor-pointer"
                            >
                              {t("tasdiqlash")}
                            </button>
                            <button
                              onClick={() => {
                                setInputProbegModal(true);
                                setNotificationModal(false);
                              }}
                              className="py-2 w-[50%] text-white bg-[#1E5DE5] rounded-4xl cursor-pointer"
                            >
                              {t("qolda_kiritish")}
                            </button>
                          </div>
                        </div>
                      );
                    } else {
                      // Sariq ogohlantirish (WarningIcon)
                      return (
                        <div
                          onClick={() => {
                            if (!item.is_read) markAsRead(item.id);
                          }}
                          key={index}
                          className="p-3 rounded-2xl bg-[#F5F6F9]"
                        >
                          <ul className="flex items-start gap-3">
                            <li className="bg-white rounded-full">
                              <span className="block p-2.75!">
                                <WarningIcon />
                              </span>
                            </li>
                            <li>
                              <strong className="text-[#F47F09]">
                                {item.title}
                              </strong>
                              <p className="text-[#7B7B7B] text-[14px]">
                                {item.body?.[lang] || item.body?.uz}
                              </p>
                            </li>
                          </ul>
                          <div className="flex items-center mt-3 gap-2">
                            <button
                              onClick={() => {
                                markOverdueNotificationAsRead(item.id);
                                setNotificationModal(false);
                              }}
                              className="py-2 w-[50%] text-[#2D2D2D] rounded-4xl bg-white cursor-pointer"
                            >
                              {t("tasdiqlash")}
                            </button>
                            <button
                              onClick={() => {
                                setInputProbegModal(true);
                                setNotificationModal(false);
                              }}
                              className="py-2 w-[50%] text-white bg-[#1E5DE5] rounded-4xl cursor-pointer"
                            >
                              {t("qolda_kiritish")}
                            </button>
                          </div>
                        </div>
                      );
                    }
                  });
                })()
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-20 h-20 bg-[#F5F6F9] rounded-full flex items-center justify-center mb-4">
                    <NotificationIcon />
                  </div>
                  <p className="text-[#7B7B7B] font-medium">
                    Hozircha bildirishnomalar yo'q
                  </p>
                </div>
              )}
            </div>

            {/* Pastdan chiqadigan servis modal - modal ichida, ro'yxat ustida */}
            {servis && (
              <div className="fixed inset-x-0 bottom-0 z-60 w-130 right-0 ml-auto animate-slide-up ">
                <div className="bg-white rounded-tl-3xl shadow-2xl border-t border-gray-100">
                  <div className="relative p-5 h-133!">
                    <div className="text-center">
                      <div className="relative">
                        <img
                          className="w-20 h-20 mx-auto rounded-full object-cover border-2 border-white shadow-sm"
                          src={servis.workshop.image || ""}
                          alt="logo"
                        />
                        <button
                          onClick={() => setServis(null)}
                          className="absolute -right-2 -top-2 cursor-pointer"
                        >
                          <XIcon />
                        </button>
                      </div>

                      <strong className="block mt-2 text-lg text-[#2D2D2D]">
                        {t("moy_almashtirish")}
                      </strong>
                      <p className="text-[#7B7B7B] text-[14px]">
                        {servis.description}
                      </p>
                    </div>

                    <div className="bg-[#F5F6F9]  rounded-[20px] mt-6">
                      <ul className="p-4 rounded-2xl flex flex-col gap-3 my-5">
                        <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("oil_brand")}
                          </p>
                          <p className="text-[#2D2D2D] font-medium text-sm">
                            {servis.description}
                          </p>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("oil_type")}
                          </p>
                          <p className="text-[#2D2D2D] font-medium text-sm">
                            {servis.service_type.name}
                          </p>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("kilometers")}
                          </p>
                          <p className="text-[#2D2D2D] font-medium text-sm">
                            {servis.probeg.toLocaleString()} km
                          </p>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("auto_service")}
                          </p>
                          <p className="text-[#2D2D2D] font-medium text-sm">
                            {servis.workshop.title}
                          </p>
                        </li>
                        <li className="flex items-center justify-between border-b border-gray-50 pb-2">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("manzil")}
                          </p>
                          <button
                            onClick={() =>
                              openMap(servis.workshop.lat, servis.workshop.lng)
                            }
                            className="text-[#2D2D2D] font-medium text-sm text-right truncate ml-4"
                          >
                            {servis.workshop.address}
                          </button>
                        </li>
                        <li className="flex items-center justify-between">
                          <p className="text-[#7B7B7B] text-sm">
                            {t("telefon_raqami")}
                          </p>
                          <p className="text-[#2D2D2D] font-medium text-sm">
                            {servis.workshop.phone_number}
                          </p>
                        </li>
                      </ul>
                    </div>

                    <div className="flex justify-end gap-2 mt-3 ">
                      <button
                        className="bg-[#FFFFFF] p-3 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                        title="Nusxa olish"
                      >
                        <CopyIcon />
                      </button>
                      <button
                        className="bg-[#FFFFFF] p-3 rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                        title="Ulashish"
                      >
                        <ShareIcon />
                      </button>
                      <button
                        className="bg-[#FFFFFF] w-12 h-12 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors shadow-sm"
                        title="Yuklab olish"
                      >
                        <DowlandIcon />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* input probeg  */}
      {inputProbegModal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40"></div>
          <div className="w-110 h-55 rounded-2xl p-4  bg-white fixed inset-0 z-50 m-auto ">
            <p className="text-[#2D2D2D] text-[20px] block mb-6">
              {t("umumiy_probeg")}
            </p>
            <form onSubmit={(e) => handleInputProbeg(e)}>
              <label className="flex flex-col w-full">
                <span className="text-[12px] pl-3">{t("probeg")}</span>
                <input
                  value={inputProbeg}
                  onChange={(e) => handleMileageInputChange(e.target.value)}
                  type="text"
                  inputMode="numeric"
                  placeholder="50 000"
                  required
                  className="py-2.5 pl-4 bg-[#F5F6F9] text-[#2D2D2D] rounded-[70px] outline-none"
                />
              </label>
              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => setInputProbegModal(false)}
                  className="w-49! cursor-pointer py-2.5 rounded-4xl bg-[#F5F6F9] "
                >
                  {t("bekor_qilish")}
                </button>
                <button
                  type="submit"
                  className={`${loading ? "w-49! cursor-pointer py-2.5 rounded-4xl bg-blue-400 text-white" : "w-49! cursor-pointer py-2.5 rounded-4xl bg-[#1E5DE5] text-white"} `}
                >
                  {loading ? t("tayyor__") : t("tayyor")}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Logout Modal */}
      {logoutModal && (
        <>
          <div className="fixed inset-0 backdrop-blur-md bg-black/40 z-40" />
          <div className="w-96 h-70 rounded-[20px] p-6 bg-white fixed inset-0 z-50 m-auto flex flex-col items-center justify-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              {t("profildan_chiqishni_istaysizmi")}
            </h2>
            <p className="text-gray-600 text-center mb-6">
              {t("qayta_login_qilishingiz_kerak_bo'ladi")}
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => setLogoutModal(false)}
                className="px-6 py-2.5 cursor-pointer rounded-4xl text-[#2D2D2D] font-medium bg-[#F5F6F9]"
              >
                {t("bekor_qilish")}
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2.5 cursor-pointer rounded-4xl bg-[#D423231A] font-medium text-[#D42323]"
              >
                {t("chiqish")}
              </button>
            </div>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;
