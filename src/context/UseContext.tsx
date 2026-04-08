import { createContext,  useState, useEffect, } from 'react'
import type { Dispatch, ReactNode, SetStateAction } from 'react'

interface User {
  id: number
  phoneNumber: string
  code:string
  full_name?: string
}

export interface AuthContextType {
  user?: User | null
  token?: string | null
  isLoading?: boolean
  login?: (token: string, user: User) => void
  logout?: () => void
  phoneNumber:string
  code:string
  selectRole:string
  names:string,
  password:string
  resetToken:string
  isForgotPassword:boolean
  setCarId:Dispatch<SetStateAction<number>>
  carId:number
  deleteCarId:number,
  setDeleteCarId:Dispatch<SetStateAction<number>>
  setServisId:Dispatch<SetStateAction<number>>
  servisId:number
  setProbeg:Dispatch<SetStateAction<number>>
  probeg:number
  
  // Workshop registration fields
  workshopTitle?: string
  workshopAddress?: string
  workshopDescription?: string
  workshopWorkingTime?: string
  workshopPassword?: string
  workshopPasswordConfirm?: string
  workshopLocation?: { lat: number; lng: number }
  workshopImages?: string[]
  // Clear functions
  clearDriverData?: () => void
  clearWorkshopData?: () => void
  clearAllRegistrationData?: () => void
  setResetToken:React.Dispatch<React.SetStateAction<string>>
  setCode:React.Dispatch<React.SetStateAction<string>>
  setPhoneNumber:React.Dispatch<React.SetStateAction<string>>
  setSelectRole:React.Dispatch<React.SetStateAction<string>>
  setNames:React.Dispatch<React.SetStateAction<string>>
  setPassword:React.Dispatch<React.SetStateAction<string>>
  setIsForgotPassword:React.Dispatch<React.SetStateAction<boolean>>
  setWorkshopTitle:React.Dispatch<React.SetStateAction<string>>
  setWorkshopAddress:React.Dispatch<React.SetStateAction<string>>
  setWorkshopDescription:React.Dispatch<React.SetStateAction<string>>
  setWorkshopWorkingTime:React.Dispatch<React.SetStateAction<string>>
  setWorkshopPassword:React.Dispatch<React.SetStateAction<string>>
  setWorkshopPasswordConfirm:React.Dispatch<React.SetStateAction<string>>
  setWorkshopLocation:React.Dispatch<React.SetStateAction<{ lat: number; lng: number } | undefined>>
  setWorkshopImages:React.Dispatch<React.SetStateAction<string[]>>
}

export const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({ children }: { children: ReactNode }) => {
    // sessionStorage dan ma'lumotlarni yuklash
    const getStoredValue = (key: string, defaultValue: string) => {
  try {
    const item = sessionStorage.getItem(key);
    if (!item || item === 'undefined' || item === 'null') return defaultValue;  // ← o'zgartiring
    return JSON.parse(item);
  } catch {
    return defaultValue;
  }
};

    const [phoneNumber, setPhoneNumber] = useState(() => getStoredValue('auth_phoneNumber', ''));
    const [code, setCode] = useState(() => getStoredValue('auth_code', ''));
    const [selectRole, setSelectRole] = useState(() => getStoredValue('auth_selectRole', ''));
    const [names, setNames] = useState(() => getStoredValue('auth_names', ''));
    // ❗ Security: parolni storage'ga yozmaymiz (faqat memory'da saqlanadi)
    const [password, setPassword] = useState<string>('');
    const [resetToken, setResetToken] = useState(() => getStoredValue('auth_resetToken', ''));
    const [probeg, setProbeg] = useState(0);
    const [isForgotPassword, setIsForgotPassword] = useState(() => {
  const item = sessionStorage.getItem('auth_isForgotPassword');
  if (!item || item === 'undefined' || item === 'null') return false;
  return JSON.parse(item);
});

    // Workshop registration fields
    const [workshopTitle, setWorkshopTitle] = useState(() => getStoredValue('workshop_title', ''));
    const [workshopAddress, setWorkshopAddress] = useState(() => getStoredValue('workshop_address', ''));
    const [workshopDescription, setWorkshopDescription] = useState(() => getStoredValue('workshop_description', ''));
    const [workshopWorkingTime, setWorkshopWorkingTime] = useState(() => getStoredValue('workshop_workingTime', ''));
    // ❗ Security: parollar storage'ga yozilmaydi (faqat memory'da saqlanadi)
    const [workshopPassword, setWorkshopPassword] = useState<string>('');
    const [workshopPasswordConfirm, setWorkshopPasswordConfirm] = useState<string>('');
   const [workshopLocation, setWorkshopLocation] = useState<{ lat: number; lng: number } | undefined>(() => {
  const item = sessionStorage.getItem('workshop_location');
  if (!item || item === 'undefined' || item === 'null') return undefined;
  return JSON.parse(item);
});
    const [workshopImages, setWorkshopImages] = useState<string[]>(() => {
      const item = sessionStorage.getItem('workshop_images');
      return item ? JSON.parse(item) : [];
    });

    const [carId,setCarId] = useState(0)
    const [deleteCarId,setDeleteCarId] = useState(0)
    const [servisId,setServisId] = useState(0)

    // Ma'lumotlarni sessionStorage ga saqlash
    useEffect(() => {
      sessionStorage.setItem('auth_phoneNumber', JSON.stringify(phoneNumber));
    }, [phoneNumber]);
    useEffect(() => {
      sessionStorage.setItem('auth_code', JSON.stringify(code));
    }, [code]);
    useEffect(() => {
      sessionStorage.setItem('auth_selectRole', JSON.stringify(selectRole));
    }, [selectRole]);
    useEffect(() => {
      sessionStorage.setItem('auth_names', JSON.stringify(names));
    }, [names]);
    useEffect(() => {
      sessionStorage.setItem('auth_resetToken', JSON.stringify(resetToken));
    }, [resetToken]);
    useEffect(() => {
      sessionStorage.setItem('auth_isForgotPassword', JSON.stringify(isForgotPassword));
    }, [isForgotPassword]);
    useEffect(() => {
      sessionStorage.setItem('workshop_title', JSON.stringify(workshopTitle));
    }, [workshopTitle]);
    useEffect(() => {
      sessionStorage.setItem('workshop_address', JSON.stringify(workshopAddress));
    }, [workshopAddress]);
    useEffect(() => {
      sessionStorage.setItem('workshop_description', JSON.stringify(workshopDescription));
    }, [workshopDescription]);
    useEffect(() => {
      sessionStorage.setItem('workshop_workingTime', JSON.stringify(workshopWorkingTime));
    }, [workshopWorkingTime]);
    useEffect(() => {
      sessionStorage.setItem('workshop_location', JSON.stringify(workshopLocation));
    }, [workshopLocation]);
    useEffect(() => {
      sessionStorage.setItem('workshop_images', JSON.stringify(workshopImages));
    }, [workshopImages]);

    // Ma'lumotlarni tozalash funksiyalari
    const clearDriverData = () => {
      setNames('');
      setPassword('');
      sessionStorage.removeItem('auth_names');
      sessionStorage.removeItem('auth_password'); // backward-compat cleanup
    };

    const clearWorkshopData = () => {
      setWorkshopTitle('');
      setWorkshopAddress('');
      setWorkshopDescription('');
      setWorkshopWorkingTime('');
      setWorkshopPassword('');
      setWorkshopPasswordConfirm('');
      setWorkshopLocation(undefined);
      setWorkshopImages([]);
      sessionStorage.removeItem('workshop_title');
      sessionStorage.removeItem('workshop_address');
      sessionStorage.removeItem('workshop_description');
      sessionStorage.removeItem('workshop_workingTime');
      sessionStorage.removeItem('workshop_password'); // backward-compat cleanup
      sessionStorage.removeItem('workshop_passwordConfirm'); // backward-compat cleanup
      sessionStorage.removeItem('workshop_location');
      sessionStorage.removeItem('workshop_images');
    };

    // Barcha ro'yxatdan o'tish ma'lumotlarini tozalash
    const clearAllRegistrationData = () => {
      clearDriverData();
      clearWorkshopData();
      // Auth related data
      sessionStorage.removeItem('auth_phoneNumber');
      sessionStorage.removeItem('auth_code');
      sessionStorage.removeItem('auth_selectRole');
      sessionStorage.removeItem('auth_names');
      sessionStorage.removeItem('auth_password');
      sessionStorage.removeItem('auth_resetToken');
      sessionStorage.removeItem('auth_isForgotPassword');
    };

  return (
    <AuthContext.Provider value={{phoneNumber,setPhoneNumber,code,setCode,selectRole,setSelectRole,names,setNames,password,setPassword,resetToken,setResetToken,isForgotPassword,setIsForgotPassword, workshopTitle, setWorkshopTitle, workshopAddress, setWorkshopAddress, workshopDescription, setWorkshopDescription, workshopWorkingTime, setWorkshopWorkingTime, workshopPassword, setWorkshopPassword, workshopPasswordConfirm, setWorkshopPasswordConfirm, workshopLocation, setWorkshopLocation, workshopImages, setWorkshopImages, clearDriverData, clearWorkshopData, clearAllRegistrationData,setCarId,carId,setDeleteCarId,deleteCarId,setServisId,servisId,setProbeg,probeg}}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider