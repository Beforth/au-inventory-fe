import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { SIDEBAR_LINKS, SECONDARY_LINKS } from '../../constants';
import { NavItem } from '../../types';
import { VersionsModal } from '../VersionsModal';

export const Sidebar: React.FC = () => {
  const [showChangelog, setShowChangelog] = useState(false);

  return (
    <aside className="w-60 h-screen bg-white border-r border-slate-200/60 flex flex-col fixed left-0 top-0 z-30">
      <div className="p-5 flex flex-col h-full">
        <Link
          to="/"
          className="flex items-center gap-2.5 mb-7 px-2 hover:opacity-80 transition-all"
        >
          <div className="w-7 h-7 bg-blue-600 rounded flex items-center justify-center shadow-sm">
            <span className="text-white font-bold text-sm">A</span>
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900">
            Aureole<span className="text-slate-400 font-medium">Inventory</span>
          </span>
        </Link>

        <div className="px-2 -mt-5 mb-5 flex items-center justify-between gap-2">
          <p className="text-[11px] font-medium text-slate-500">
            Powered by <span className="font-semibold text-slate-700">BeForth</span>
          </p>
          <button
            type="button"
            onClick={() => setShowChangelog(true)}
            className="text-[11px] font-semibold text-blue-700 bg-blue-50 border border-blue-200 rounded px-2 py-0.5 hover:bg-blue-100 transition-colors"
            title="View changelog"
          >
            v1.1.1
          </button>
        </div>

        <nav className="space-y-0.5">
          <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 mt-2">Main Menu</p>
          {SIDEBAR_LINKS.map((item) => (
            <SidebarItem key={item.title} item={item} />
          ))}
        </nav>

        <div className="mt-auto pt-4 space-y-0">
          <div className="border-t border-slate-100 pt-3 space-y-0.5">
            {SECONDARY_LINKS.map((item) => (
              <SidebarItem key={item.title} item={item} />
            ))}
          </div>

          <div className="mt-4 flex items-center gap-2.5 p-2.5 rounded-xl border border-slate-100/80 bg-slate-50/50 hover:bg-slate-50 transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200/50">
              <span className="text-blue-600 font-bold text-xs">AR</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[12px] font-semibold text-slate-900 truncate">Alex Rivera</p>
              <p className="text-[10px] text-slate-500 font-medium truncate">Administrator</p>
            </div>
          </div>
        </div>
      </div>

      <VersionsModal
        isOpen={showChangelog}
        onClose={() => setShowChangelog(false)}
      />
    </aside>
  );
};

const SidebarItem: React.FC<{ item: NavItem }> = ({ item }) => {
  return (
    <NavLink
      to={item.href}
      className={({ isActive }) => `
        group flex items-center justify-between w-full rounded-lg text-[13px] transition-all duration-200 font-medium px-3 py-2
        ${isActive
          ? 'bg-blue-50 text-blue-700'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
      `}
    >
      {({ isActive }) => (
        <>
          <div className="flex items-center gap-3">
            <item.icon
              size={18}
              strokeWidth={isActive ? 2.2 : 1.8}
              className={isActive ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}
            />
            <span className={isActive ? 'font-semibold' : ''}>{item.title}</span>
          </div>
          {item.badge && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold ${isActive ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
              {item.badge}
            </span>
          )}
        </>
      )}
    </NavLink>
  );
};
