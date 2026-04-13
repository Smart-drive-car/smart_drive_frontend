
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { CustomMenu } from "../../components"
import { Cliend, HeaderPages, Service, WorkshopHeader } from "../../modules"
import AddCarsPages from "./AddCarsPages"
import LastServisPages from "../../modules/LastServisPages"
  
   
   
   
   const Dashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isSearchPage = location.pathname === '/search-pages';
  
  // useEffect yo'q — to'g'ridan-to'g'ri o'qi
  const role = localStorage.getItem("role");

  if (!role) {
    navigate("/login");
    return null;
  }

  return (
    <div>
      {role === "DRIVER" ? (
        <div className="flex p-7.5">
          <CustomMenu/>
          <div className="w-[80%] ml-4">
            <HeaderPages/>
            {!isSearchPage && <AddCarsPages/>}
            {!isSearchPage && <LastServisPages/>}
            <Outlet/>
          </div>
        </div>
      ) : (
        <div className="p-7.5">
          <WorkshopHeader/>
          <Service/>
          <Cliend/>
          <Outlet/>
        </div>
      )}
    </div>
  );
}

export default Dashboard;