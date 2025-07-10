import React, { memo } from 'react';
import {
  MdDelete,
  MdAdd,
  MdClose,
  MdDashboard,
  MdAttachMoney,
  MdPieChart,
  MdBarChart,
  MdLogout,
  MdMenu,
  MdSettings,
  MdDownload,
  MdPsychology,
  MdChat,
  MdSmartToy,
} from 'react-icons/md';

interface IconProps {
  name: 'delete' | 'add' | 'close' | 'dashboard' | 'money' | 'budget' | 'chart' | 'logout' | 'menu' | 'settings' | 'download' | 'ai' | 'chat' | 'robot';
  className?: string;
  onClick?: () => void;
  size?: string;
}

const Icon = memo(({ name, className = '', onClick, size = '1.3em' }: IconProps) => {
  const icons = {
    delete: <MdDelete size={size} />,
    add: <MdAdd size={size} />,
    close: <MdClose size={size} />,
    dashboard: <MdDashboard size={size} />,
    money: <MdAttachMoney size={size} />,
    budget: <MdPieChart size={size} />,
    chart: <MdBarChart size={size} />,
    logout: <MdLogout size={size} />,
    menu: <MdMenu size={size} />,
    settings: <MdSettings size={size} />,
    download: <MdDownload size={size} />,
    ai: <MdPsychology size={size} />,
    chat: <MdChat size={size} />,
    robot: <MdSmartToy size={size} />,
  };

  return (
    <span
      className={`icon ${className}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
    >
      {icons[name]}
    </span>
  );
});

Icon.displayName = 'Icon';

export default Icon;
