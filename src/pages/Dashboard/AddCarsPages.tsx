import { PlusOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";

const AddCarsPages = () => {
  const { t } = useTranslation();
  return (
    <section className="p-4 rounded-[20px] bg-[#F5F6F9]">
        <div className="flex items-center justify-between">
          <ul className="text-[#1E5DE5] flex items-center gap-5">
            <li className="py-2.5 px-4 rounded-[20px] bg-[#E4ECFE]">
                Spark A123BC
            </li>
            <li className="py-2.5 px-4 rounded-[20px]">
                Spark A123BC
            </li>
            <li className="py-2.5 px-4 rounded-[20px]">
                Spark A123BC
            </li>
          </ul>
            <button className="text-[#1E5DE5] bg-[#E4ECFE] rounded-[50px] py-2.5 flex items-center gap-2 pl-4 pr-2.5 cursor-pointer">
                <span className="text-[#1E5DE5] ">{t("add_car")}</span>
                <PlusOutlined className="w-3 h-3" />
            </button>
        </div>
     
    </section>
  );
};

export default AddCarsPages;