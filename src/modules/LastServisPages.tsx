import { RightOutlined } from "@ant-design/icons"
import { CopyIcon, DowlandIcon, SearchIcon, ShareIcon } from "../assets/icons"
import { LocationImg } from "../assets/images"
import { useTranslation } from "react-i18next"


const LastServisPages = () => {
  const { t } = useTranslation()
  return (
    <section className="flex gap-3">
        <div className="w-[60%] bg-[#F5F6F9] rounded-[20px] p-4 mt-3 overflow-y-auto h-[60%]">
            <div className="flex items-center justify-between p-4">
                <strong className="text-[#2D2D2D] font-medium text-[20px]">{t("last_services")}</strong>
                <div className="relative w-[60%] ">
                <input type="text" placeholder={t("search")} className="w-full py-3 pl-3 text-[#7B7B7B] text-[13px] rounded-[40px] bg-[#FFFFFF] outline-none" />
                <button className="absolute right-2 top-2.5 ">
                <SearchIcon />

                </button>

                </div>
            </div>
            <ul className="flex flex-col gap-2">
                <li className="flex items-center justify-between p-3 bg-[#E4ECFE] rounded-[20px]">
                    <div className="flex items-center gap-3">
                        <img src={LocationImg} alt={t("logo_alt")} width={44} height={44} />
                        <div className="">
                            <p className="text-[#2D2D2D]">{t("brand_name")}</p>
                            <span className="text-[13px] text-[#7B7B7B]">Mobil 5W-30 Synthetic</span>
                        </div>
                    </div>
                    <RightOutlined className="w-3 h-2" />
                </li>
                <li className="flex items-center justify-between p-3 bg-[#E4ECFE] rounded-[20px]">
                    <div className="flex items-center gap-3">
                        <img src={LocationImg} alt={t("logo_alt")} width={44} height={44} />
                        <div className="">
                            <p className="text-[#2D2D2D]">{t("brand_name")}</p>
                            <span className="text-[13px] text-[#7B7B7B]">Mobil 5W-30 Synthetic</span>
                        </div>
                    </div>
                    <RightOutlined className="w-3 h-2" />
                </li>
                <li className="flex items-center justify-between p-3 bg-[#E4ECFE] rounded-[20px]">
                    <div className="flex items-center gap-3">
                        <img src={LocationImg} alt={t("logo_alt")} width={44} height={44} />
                        <div className="">
                            <p className="text-[#2D2D2D]">{t("brand_name")}</p>
                            <span className="text-[13px] text-[#7B7B7B]">Mobil 5W-30 Synthetic</span>
                        </div>
                    </div>
                    <RightOutlined className="w-3 h-2" />
                </li>
                <li className="flex items-center justify-between p-3 bg-[#E4ECFE] rounded-[20px]">
                    <div className="flex items-center gap-3">
                        <img src={LocationImg} alt={t("logo_alt")} width={44} height={44} />
                        <div className="">
                            <p className="text-[#2D2D2D]">{t("brand_name")}</p>
                            <span className="text-[13px] text-[#7B7B7B]">Mobil 5W-30 Synthetic</span>
                        </div>
                    </div>
                    <RightOutlined className="w-3 h-2" />
                </li>
            
            
            </ul>

        </div>
        <div className="w-[40%] bg-[#F5F6F9] rounded-[20px] p-4 mt-3 overflow-y-auto h-[60%]">
            <div className="text-center">
              <img className="w-20 h-20 mx-auto" src={LocationImg} alt={t("logo_alt")} width={80} height={80}/>
              <strong className="text-medium text-[#2D2D2D]">{t("oil_change")}</strong>
              <p className="text-[#7B7B7B] text-[14px]">Mobil15w-30 synthetic</p>

            </div>
            <ul className="bg-[#FFFFFF] p-3 rounded-2xl flex flex-col gap-2 my-3">
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("oil_brand")}</p>
                    <p className="text-[#2D2D2D]">Mobil</p>
                </li>
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("oil_type")}</p>
                    <p className="text-[#2D2D2D]">Mobil15w-30 synthetic</p>
                </li>
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("kilometers")}</p>
                    <p className="text-[#2D2D2D]">45 000</p>
                </li>
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("auto_service")}</p>
                    <p className="text-[#2D2D2D]">CAR1 A.S.</p>
                </li>
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("manzil")}</p>
                    <p className="text-[#2D2D2D]">link</p>
                </li>
                <li className="flex items-center justify-between">
                    <p className="text-[#7B7B7B]">{t("telefon_raqami")}</p>
                    <p className="text-[#2D2D2D]">+998 94 667 07 77</p>
                </li>
            </ul>
            <div className="flex justify-end gap-2">
                <div className="bg-[#FFFFFF] p-2.5 rounded-full">
                    <CopyIcon/>
                </div>
                <div className="bg-[#FFFFFF] p-2.5 rounded-full">
                    <ShareIcon/>
                </div>
                <div className="bg-[#FFFFFF] p-2.5 rounded-full">
                    <DowlandIcon/>
                </div>
            </div>
        </div>
    </section>
  )
}

export default LastServisPages
