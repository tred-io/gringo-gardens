import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Sprout, Users, Settings, FileText, Image, Star, Mail, User, Home, Info } from "lucide-react";

interface TabGroup {
  id: string;
  label: string;
  icon: React.ReactNode;
  tabs: {
    id: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

interface GroupedTabsProps {
  groups: TabGroup[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  children: React.ReactNode;
}

/**
 * GroupedTabs - Organizes 9 tabs into 3 logical groups
 *
 * Problem solved: 9 individual tabs overwhelming users
 * Solution: Group related tabs together for easier navigation
 *
 * Groups:
 * 1. Content - Products, Categories, Blog, Gallery
 * 2. Customer - Reviews, Messages
 * 3. Settings - Team, Business, Pages
 */
export function GroupedTabs({ groups, activeTab, onTabChange, children }: GroupedTabsProps) {
  // Find which group contains the active tab
  const activeGroup = groups.find(group =>
    group.tabs.some(tab => tab.id === activeTab)
  )?.id || groups[0].id;

  const [selectedGroup, setSelectedGroup] = useState(activeGroup);

  // Get tabs for selected group
  const currentGroup = groups.find(g => g.id === selectedGroup);
  const currentTabs = currentGroup?.tabs || [];

  return (
    <div className="space-y-4">
      {/* Top-level group selector */}
      <div className="border-b">
        <div className="flex gap-2 px-4">
          {groups.map((group) => (
            <button
              key={group.id}
              onClick={() => {
                setSelectedGroup(group.id);
                // Auto-select first tab in group
                onTabChange(group.tabs[0].id);
              }}
              className={`
                flex items-center gap-2 px-4 py-3 border-b-2 transition-colors
                ${selectedGroup === group.id
                  ? 'border-bluebonnet-600 text-bluebonnet-600 font-medium'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
                }
              `}
            >
              {group.icon}
              <span>{group.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Sub-tabs for selected group */}
      <Tabs value={activeTab} onValueChange={onTabChange}>
        <TabsList className="w-full justify-start">
          {currentTabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className="flex items-center gap-2"
            >
              {tab.icon}
              <span>{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {children}
      </Tabs>
    </div>
  );
}

// Pre-configured groups for Gringo Gardens admin
export const ADMIN_TAB_GROUPS: TabGroup[] = [
  {
    id: "content",
    label: "Content",
    icon: <FileText className="w-4 h-4" />,
    tabs: [
      { id: "products", label: "Products", icon: <Sprout className="w-4 h-4" /> },
      { id: "categories", label: "Categories", icon: <Sprout className="w-4 h-4" /> },
      { id: "blog", label: "Blog Posts", icon: <FileText className="w-4 h-4" /> },
      { id: "gallery", label: "Gallery", icon: <Image className="w-4 h-4" /> },
    ],
  },
  {
    id: "customer",
    label: "Customer",
    icon: <Users className="w-4 h-4" />,
    tabs: [
      { id: "reviews", label: "Reviews", icon: <Star className="w-4 h-4" /> },
      { id: "messages", label: "Messages", icon: <Mail className="w-4 h-4" /> },
    ],
  },
  {
    id: "settings",
    label: "Settings",
    icon: <Settings className="w-4 h-4" />,
    tabs: [
      { id: "team", label: "Team", icon: <User className="w-4 h-4" /> },
      { id: "content-pages", label: "Pages", icon: <Home className="w-4 h-4" /> },
      { id: "business", label: "Business", icon: <Info className="w-4 h-4" /> },
    ],
  },
];
