import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import type { LogoutModalProps } from "../@types";



const LogoutModal = ({ isOpen, onClose }: LogoutModalProps) => {
  const { t } = useTranslation();

  const handleLogout = () => {
    Cookies.remove("access_token");
    Cookies.remove("refresh_token");
    localStorage.clear();
    toast.success(t("profildan_chiqdingiz!")); // Tarjima qilingan xabar
    window.location.href = "/log-in";
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md bg-black/40 z-50"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="fixed inset-0 flex items-center justify-center z-60">
        <div className="w-80 md:w-96 bg-white rounded-[20px] p-3 md:p-6 text-center shadow-2xl">
          <h2 className="text-xl font-semibold mb-2 md:mb-4">
            {t("profildan_chiqishni_istaysizmi")}
          </h2>
          <p className="text-gray-600 mb-3 md:mb-6">
            {t("qayta_login_qilishingiz_kerak_bo'ladi")}
          </p>
          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 py-2 md:py-2.5 bg-[#F5F6F9] rounded-3xl hover:bg-gray-200 transition-all"
            >
              {t("bekor_qilish")}
            </button>
            <button
              onClick={handleLogout}
              className="flex-1 py-2 md:py-2.5 bg-[#D423231A] text-[#D42323] rounded-3xl hover:bg-[#D423232A] transition-all"
            >
              {t("chiqish")}
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default LogoutModal;