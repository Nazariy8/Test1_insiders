import { useState, useEffect} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Package,
  LayoutDashboard,
  Landmark,
  Phone,
  UserCheck,
  Store,
  PieChart,
  Mail,
  Settings,
  HelpCircle,
  Boxes,
    ListFilter,
  Pin
} from "lucide-react";

const TAB_ICONS = {
  warehouse: Package,
  dashboard: LayoutDashboard,
  banking: Landmark,
  telephony: Phone,
  accounting: UserCheck,
  sales: Store,
  statistics: PieChart,
  "post-office": Mail,
  administration: Settings,
  help: HelpCircle,
  inventory: Boxes,
  "selection-lists": ListFilter,
};

const INITIAL_TABS = [
  {
    id: "warehouse",
    title: "Warehouse Management",
    isPinned: true,
    isOpen: true,
  },
  { id: "dashboard", title: "Dashboard", isPinned: false, isOpen: true },
  { id: "banking", title: "Banking", isPinned: false, isOpen: true },
  { id: "telephony", title: "Telephony", isPinned: false, isOpen: true },
  { id: "accounting", title: "Accounting", isPinned: false, isOpen: true },
  { id: "sales", title: "Sales", isPinned: false, isOpen: true },
  { id: "statistics", title: "Statistics", isPinned: false, isOpen: true },
  { id: "post-office", title: "Post Office", isPinned: false, isOpen: true },
  {
    id: "administration",
    title: "Administration",
    isPinned: false,
    isOpen: true,
  },
  { id: "help", title: "Help", isPinned: false, isOpen: true },
  { id: "inventory", title: "Inventory", isPinned: false, isOpen: true },
  {
    id: "selection-lists",
    title: "Selection Lists",
    isPinned: false,
    isOpen: true,
  },
];

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();

  const [tabs, setTabs] = useState(() => {
    const saved = localStorage.getItem("tabs");
    return saved ? JSON.parse(saved) : INITIAL_TABS;
  });

  useEffect(() => {
    localStorage.setItem("tabs", JSON.stringify(tabs));
  }, [tabs]);

  const [maxVisible, setMaxVisible] = useState(6);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contextTabId, setContextTabId] = useState(null);

  useEffect(() => {
    const calcLimit = () =>
      setMaxVisible(Math.max(1, Math.floor(window.innerWidth / 180)));
    calcLimit();
    window.addEventListener("resize", calcLimit);
    return () => window.removeEventListener("resize", calcLimit);
  }, []);

  const openTabs = tabs.filter((t) => t.isOpen);
  const visibleTabs = openTabs.slice(0, maxVisible);
  const dropdownTabs = [
    ...openTabs.slice(maxVisible),
    ...tabs.filter((t) => !t.isOpen),
  ];

  const [draggedIndex, setDraggedIndex] = useState(null);

  const handleDrop = (dropIndex) => {
    if (draggedIndex === null || draggedIndex === dropIndex) return;

    const source = visibleTabs[draggedIndex];
    const target = visibleTabs[dropIndex];

    const nextTabs = [...tabs];
    const from = nextTabs.findIndex((t) => t.id === source.id);
    const to = nextTabs.findIndex((t) => t.id === target.id);

    const [moved] = nextTabs.splice(from, 1);
    nextTabs.splice(to, 0, moved);

    setTabs(nextTabs);
    setDraggedIndex(null);
  };

  const updateTab = (id, changes) => {
    setTabs((prev) =>
      prev.map((tab) => (tab.id === id ? { ...tab, ...changes } : tab)),
    );
  };

  const togglePin = (id) => {
    setTabs((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, isPinned: !t.isPinned } : t,
      );
      return updated.sort(
        (a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0),
      );
    });
    setContextTabId(null);
  };

  const closeTab = (e, id) => {
    e.stopPropagation();
    updateTab(id, { isOpen: false });

    if (location.pathname.includes(id)) {
      const nextTab = openTabs.find((t) => t.id !== id);
      if (nextTab) navigate(`/tabs/${nextTab.id}`);
    }
  };

  const openFromDropdown = (tab) => {
    updateTab(tab.id, { isOpen: true });
    navigate(`/tabs/${tab.id}`);
    setIsMenuOpen(false);
  };

  return (
    <header className="tabs-header">
      <div className="tabs-list">
        {visibleTabs.map((tab, index) => {
          const Icon = TAB_ICONS[tab.id]; 
          const isActive =
            location.pathname.includes(tab.id) ||
            (location.pathname === "/" && index === 0);

          return (
            <div
              key={tab.id}
              draggable
              onDragStart={() => setDraggedIndex(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(index)}
              onClick={() => navigate(`/tabs/${tab.id}`)}
              onContextMenu={(e) => {
                e.preventDefault();
                setContextTabId(contextTabId === tab.id ? null : tab.id);
              }}
              className={`tab-item ${tab.isPinned ? "pinned" : ""} ${
                isActive ? "active" : ""
              } ${draggedIndex === index ? "dragging" : ""}`}
              title={tab.isPinned ? tab.title : ""}
            >
              {Icon && <Icon size={16} />}
              {!tab.isPinned && <span className="tab-title">{tab.title}</span>}

              {!tab.isPinned && (
                <button
                  type="button"
                  className="close-tab-btn"
                  onClick={(e) => closeTab(e, tab.id)}
                >
                  ✕
                </button>
              )}

              {contextTabId === tab.id && (
                <div
                  className="tab-context-menu"
                  onClick={(e) => {
                    e.stopPropagation();
                    togglePin(tab.id);
                  }}
                >
                  📌 {tab.isPinned ? "Tab pinned" : "Tab unpinned"}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="dropdown-container">
        <button
          type="button"
          className="dropdown-toggle-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          ⌃
        </button>

        {isMenuOpen && (
          <div className="dropdown-menu">
            {dropdownTabs.length > 0 ? (
              dropdownTabs.map((tab) => {
                const DropdownIcon = TAB_ICONS[tab.id];
                return (
                  <div
                    key={tab.id}
                    className="dropdown-item"
                    onClick={() => openFromDropdown(tab)}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {DropdownIcon && <DropdownIcon size={15} />}
                      <span>{tab.title}</span>
                    </div>
                    {!tab.isOpen && (
                      <small style={{ color: "#94a3b8" }}>(закрито)</small>
                    )}
                  </div>
                );
              })
            ) : (
              <div
                style={{ padding: "10px", color: "#94a3b8", fontSize: "13px" }}
              >
                Усі вкладки відкриті
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
