import { Outlet, useLocation } from "react-router-dom"
import { CustomMenu } from "../../components"
import { HeaderPages } from "../../modules"
import AddCarsPages from "./AddCarsPages"
import LastServisPages from "../../modules/LastServisPages"



const Dashboard = () => {
  const location = useLocation();
  const isSearchPage = location.pathname === '/search-pages';
  const role = localStorage.getItem("role")
  

  return (
    <div>
      {
        role === "DRIVER" ? (
        <div className="flex p-7.5">
        <CustomMenu/>
        <div className="w-[80%] ml-4">
          <HeaderPages/>
          {!isSearchPage && <AddCarsPages/>}
          {!isSearchPage && <LastServisPages/>}
          <Outlet/>
        </div>
        </div>
        ):(
          <div className="p-7.5">
            <HeaderPages/>
            <Outlet/>
          </div>
        )
      }

    </div>
  )
}

export default Dashboard
