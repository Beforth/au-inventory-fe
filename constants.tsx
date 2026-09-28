
import React from 'react';
import { 
  LayoutDashboard, Package, Users, ShoppingCart, Truck, Warehouse,
  ClipboardList, BarChart3, RotateCcw, Briefcase, CalendarCheck,
  FileBarChart, Settings, DatabaseZap
} from "lucide-react";
import { NavItem } from './types';

export const SIDEBAR_LINKS: NavItem[] = [
  { title: "Dashboard", icon: LayoutDashboard, href: "/" },
  { title: "Tally Live Data", icon: DatabaseZap, href: "/tally" },
  { title: "Items", icon: Package, href: "/items" },
  { title: "Vendors", icon: Users, href: "/vendors" },
  { title: "Procurement", icon: ShoppingCart, href: "/procurement" },
  { title: "Material Inward", icon: Truck, href: "/inward" },
  { title: "Stores & Racks", icon: Warehouse, href: "/stores" },
  { title: "Job Orders", icon: ClipboardList, href: "/jobs" },
  { title: "Stock Levels", icon: BarChart3, href: "/stock" },
  { title: "Returns & Scrap", icon: RotateCcw, href: "/returns" },
  { title: "Assets & Employees", icon: Briefcase, href: "/assets" },
  { title: "AMC & Exhibitions", icon: CalendarCheck, href: "/amc" },
  { title: "Reports", icon: FileBarChart, href: "/reports" },
];

export const SECONDARY_LINKS: NavItem[] = [
  { title: "Settings", icon: Settings, href: "/settings" },
];
