import React, { useState } from 'react';
import type { MenuProps } from 'antd';
import {  Menu, Space } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { HomePagesIcon, SearchIcon } from '../assets/icons';

type MenuItem = Required<MenuProps>['items'][number];

const items: MenuItem[] = [
  { key: '/',   icon: <HomePagesIcon/>,  label: 'Bosh sahifa' },
  { key: '/search-pages',  icon: <SearchIcon/>,   label: 'Qidirish' },
];

const CustomMenu: React.FC = () => {
  const [collapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleMenuClick: MenuProps['onClick'] = ({ key }) => {
    navigate(key); 
  };

  return (
    <div className='w-[20%] h-screen!'>
      <div className='w-full bg-[#F5F6F9]! rounded-t-[20px] pt-4 pl-4 pb-3  '>
  <div className='w-19.75 py-2.5 bg-[#EBEBEB]! text-black rounded-xl text-center flex items-center justify-center'>
    logo
  </div>
     </div>
     <div className='px-4! h-px bg-white'></div>
    <div className=' bg-[#F5F6F9]! h-full text-white! px-4 rounded-b-[20px] pt-4'>
      <Space style={{ marginBottom: 16 }} className='rounded-4xl!' >
      </Space>
      <Menu className="menu-custom  bg-[#F5F6F9]!"
        selectedKeys={[location.pathname]} 
        mode="inline"
        inlineCollapsed={collapsed}
        items={items}
        onClick={handleMenuClick}
      />
    </div>
    </div>
  );
};

export default CustomMenu;