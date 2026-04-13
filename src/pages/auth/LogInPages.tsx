import {  useState,  type ChangeEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CustomButton } from '../../components';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import BASE_URL from '../../hooks/Env';
import { setAuthTokens } from '../../services/authTokens';
import { toast } from 'react-toastify';


const LogInPages: React.FC = () => {
  const [phone, setPhone] = useState("+998");
  const [password,setPassword] = useState<string>("")
  const [loading,setLoading] = useState(false)
  const navigate = useNavigate()
  
  
  const {t} = useTranslation()

  const handlePhoneChange = (e: ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");

    if (!value.startsWith("998")) {
      value = "998" + value;
    }

    const numbers = value.substring(0, 12);
    let formatted = "+998";

    if (numbers.length > 3) formatted += " " + numbers.substring(3, 5);
    if (numbers.length > 5) formatted += " " + numbers.substring(5, 8);
    if (numbers.length > 8) formatted += " " + numbers.substring(8, 10);
    if (numbers.length > 10) formatted += " " + numbers.substring(10, 12);

    setPhone(formatted);
  };


// log in 
const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
  setLoading(true);

  const clearPhone = phone.replace(/\D/g, "").substring(3);
  const data = { phone_number: clearPhone, password };

  try {
    const res = await axios.post(`${BASE_URL}/api/auth/login/`, data);
    setAuthTokens({ access: res.data.access, refresh: res.data.refresh });

    // Profile olish - navigate DAN OLDIN tugashi shart
    const profileRes = await axios.get(`${BASE_URL}/api/auth/profile/`, {
      headers: { Authorization: `Bearer ${res.data.access}` },
    });

    const role = profileRes.data?.role;
    if (role) {
      localStorage.setItem("role", role);
    } else {
      toast.error(t("role_topilmadi"));
      return; // role yo'q bo'lsa davom etma
    }

    toast.success(t("muvaffaqqiyatli_otildi"));
    navigate("/dashboard"); // faqat role yozilgandan KEYIN

  } catch (err: any) {
    toast.error(t("berilgan_hisob_malumotlari_bilan_faol_hisob_topilmadi"));
  } finally {
    setLoading(false);
  }
};
  return (
    <section className='flex items-center h-screen justify-center'>
      <div className=' hidden md:block text-center w-80 px-3  md:px-0 md:w-100'>
        <h2 className='font-medium text-[24px] '>{t("kirish")}</h2>
        <div className='my-6 md:my-9'>
          <h3 className='text-[24px] font-medium'>{t("telefon_raqamingizni_kiriting")}</h3>
          <p>{t("sizga_tasdiqlash_kodini_SMS_orqali_yuboramiz")}</p>
        </div>
        <form onSubmit={(e) => handleSubmit(e) } className='flex flex-col gap-4'>
          <label className='flex flex-col gap-1'>
            <span className='text-[12px] text-[#2D2D2D] text-start pl-2'>{t("telefon_raqamingiz")}</span>
            <input 
              type="tel" 
              value={phone}
              required
              onChange={handlePhoneChange}
              className='py-2.5 pl-4  bg-[#F5F6F9] rounded-4xl outline-none' 
            />
          </label>
          <label className='flex flex-col gap-1'>
            <span className='text-[12px] text-[#2D2D2D] outline-none text-start pl-2'>{t("parolingiz")}</span>
            <input onChange={(e) => setPassword(e.target.value)}
              type="password" 
              required
              placeholder={t("parolingizni_yozing")} 
              className='py-2.5 pl-4  bg-[#F5F6F9] rounded-4xl outline-none' 
            />
          </label>
           <Link to={"/otp-number"} className='text-[#3775FF] border-b  block w-fit text-center mx-auto'>
             {t("parolni_unutdingzmi")}
           </Link>
           <div className='flex flex-col md:flex-row justify-between mt-6 md:mt-9'>
            <Link to={"/otp-number"} className='text-[#1E5DE5] md:hidden mb-6'>{t("akaunt_yaratish")}</Link>
            <CustomButton text={t("akaunt_yaratish")} className='bg-[#F5F6F9]! text-[#2D2D2D]! rounded-4xl hidden md:flex' onClick={() => navigate("/otp-number")}/>
            <CustomButton type='submit' text={ loading ?  t("davom__etish") : t("davom_etish")} className={`  ${loading ? "bg-blue-400! rounded-4xl":"bg-[#1E5DE5]! rounded-4xl"}  bg-[#1E5DE5]! rounded-4xl `}/>
           </div>
        </form>
      </div>
      <div className='md:hidden'>
        <p className='text-center px-3'>
          {t("responsive")}
        </p>
      </div>
    </section>
  );
};

export default LogInPages;