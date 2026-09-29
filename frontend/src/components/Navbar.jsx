import React, {
    useState,
    useEffect
} from 'react';
import {
    ShoppingCart,
    Package,
    Clock,
    BarChart3,
    Settings as SettingsIcon,
    Receipt,
    Zap,
    Volume2,
    VolumeX,
    HelpCircle,
    Sparkles,
    Truck,
    DollarSign,
    Home,
    LogOut,
    User,
    ShieldCheck,
    UserCheck,
    Users,
    Maximize,
    Minimize,
    Smartphone,
    Download
} from 'lucide-react';
import {
    usePOS
} from '../context/POSContext';
import ShortcutsModal from './ShortcutsModal';
import PWAInstallModal from './PWAInstallModal';

export default function Navbar({
    activeTab,
    setActiveTab,
    onOpenLogin
}) {
    const {
        cart,
        netTotal,
        settings,
        setSettings,
        currentUser,
        logout
    } = usePOS();
    const [time, setTime] = useState(new Date());
    const [showShortcuts, setShowShortcuts] = useState(false);
    const [showPWAModal, setShowPWAModal] = useState(false);
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
        };
        document.addEventListener('fullscreenchange', handleFullscreenChange);
        document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
        };
    }, []);

    const toggleFullscreen = () => {
        if (!document.fullscreenElement && !document.webkitFullscreenElement) {
            const el = document.documentElement;
            if (el.requestFullscreen) {
                el.requestFullscreen().catch(() => {});
            } else if (el.webkitRequestFullscreen) {
                el.webkitRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen().catch(() => {});
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            }
        }
    };

    const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

    const toggleSound = () => {
        setSettings(prev => ({
            ...prev,
            enableBeep: !prev.enableBeep
        }));
    };

    const navItems = [{
            id: 'landing',
            label: 'Home',
            icon: Home
        },
        {
            id: 'register',
            label: 'POS Terminal',
            icon: ShoppingCart,
            badge: totalItemsCount > 0 ? totalItemsCount : null
        },
        {
            id: 'inventory',
            label: 'Inventory',
            icon: Package
        },
        {
            id: 'purchases',
            label: 'Purchases',
            icon: Truck
        },
        {
            id: 'expenses',
            label: 'Expenses',
            icon: DollarSign
        },
        {
            id: 'sales',
            label: 'Sales',
            icon: Receipt
        },
        {
            id: 'dashboard',
            label: 'Analytics',
            icon: BarChart3
        },
        {
            id: 'staff',
            label: 'Staff & Roles',
            icon: Users
        },
        {
            id: 'settings',
            label: 'Settings',
            icon: SettingsIcon
        },
    ];

    return ( <
        >
        <
        header className = "sticky top-0 z-40 bg-[#0B0F19]/95 backdrop-blur-md border-b border-slate-800 shadow-xl" >
        <
        div className = "max-w-[1920px] mx-auto px-4 lg:px-6 h-16 flex items-center justify-between" >

        {
            /* Brand Logo & Store Name */ } <
        div onClick = {
            () => setActiveTab('landing')
        }
        className = "flex items-center gap-3 cursor-pointer select-none group" >
        <
        div className = "w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-glow text-white font-bold text-lg group-hover:scale-105 transition-transform" >
        <
        Zap size = {
            22
        }
        className = "animate-pulse-subtle" / >
        <
        /div> <
        div >
        <
        div className = "flex items-center gap-2" >
        <
        span className = "font-display font-extrabold text-lg text-white tracking-tight" >
        Retail < span className = "text-indigo-400" > POS < /span> Pro <
        /span> <
        span className = "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" >
        <
        span className = "w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" > < /span>
        Active <
        /span> <
        /div> <
        p className = "text-xs text-slate-400 font-medium truncate max-w-[180px] sm:max-w-xs" > {
            settings.storeName
        } <
        /p> <
        /div> <
        /div>

        {
            /* Navigation Links */ } <
        nav className = "hidden xl:flex items-center gap-1 bg-[#131B2E]/90 p-1.5 rounded-2xl border border-slate-800/80" > {
            navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return ( <
                    button key = {
                        item.id
                    }
                    onClick = {
                        () => setActiveTab(item.id)
                    }
                    className = {
                        `relative flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`
                    } >
                    <
                    Icon size = {
                        14
                    }
                    /> <
                    span > {
                        item.label
                    } < /span> {
                        item.badge !== null && ( <
                            span className = "ml-1 px-1.5 py-0.2 rounded-full text-[9px] bg-white text-indigo-700 font-bold" > {
                                item.badge
                            } <
                            /span>
                        )
                    } <
                    /button>
                );
            })
        } <
        /nav>

        {
            /* Right Action Widgets (Sound, Fullscreen, PWA Install, Shortcuts, User Profile) */ } <
        div className = "flex items-center gap-2" >

        {
            /* PWA Mobile & Desktop Web App Install Button */ } <
        button onClick = {
            () => setShowPWAModal(true)
        }
        title = "Install RetailPOS as Web App on Android, iOS & Desktop"
        className = "flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600/20 to-violet-600/20 hover:from-indigo-600/35 hover:to-violet-600/35 border border-indigo-500/30 text-indigo-300 hover:text-white text-xs font-semibold transition-all" >
        <
        Smartphone size = {
            14
        }
        className = "text-indigo-400" / >
        <
        span className = "hidden md:inline" > Install App < /span> <
        /button>

        {
            /* Full Screen Kiosk Mode Toggle [F9] */ } <
        button onClick = {
            toggleFullscreen
        }
        title = {
            isFullscreen ? "Exit Fullscreen Mode [F9]" : "Enter Full Screen Kiosk Mode [F9]"
        }
        className = {
            `p-2 rounded-xl border transition-colors ${
                isFullscreen
                  ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                  : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700'
              }`
        } >
        {
            isFullscreen ? < Minimize size = {
                16
            }
            /> : <Maximize size={16} / >
        } <
        /button>

        {
            /* Sound Toggle */ } <
        button onClick = {
            toggleSound
        }
        title = {
            settings.enableBeep ? "Sound Beep: ON" : "Sound Beep: OFF"
        }
        className = {
            `p-2 rounded-xl border transition-colors ${
                settings.enableBeep
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/20'
                  : 'bg-slate-800 border-slate-700 text-slate-500 hover:text-slate-300'
              }`
        } >
        {
            settings.enableBeep ? < Volume2 size = {
                16
            }
            /> : <VolumeX size={16} / >
        } <
        /button>

        {
            /* Shortcuts Help [F1] */ } <
        button onClick = {
            () => setShowShortcuts(true)
        }
        title = "Keyboard Shortcuts Cheat Sheet [F1]"
        className = "p-2 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-400 hover:text-white transition-colors" >
        <
        HelpCircle size = {
            16
        }
        /> <
        /button>

        {
            /* Quick Cart Pill */ } {
            activeTab !== 'register' && ( <
                button onClick = {
                    () => setActiveTab('register')
                }
                className = "flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold hover:bg-indigo-500/20 transition-all" >
                <
                ShoppingCart size = {
                    14
                }
                /> <
                span > {
                    settings.currency
                } {
                    netTotal.toLocaleString()
                } < /span> <
                /button>
            )
        }

        {
            /* User Profile / Auth State */ } {
            currentUser ? ( <
                div className = "flex items-center gap-2 pl-2 border-l border-slate-800" >
                <
                button onClick = {
                    () => setActiveTab('staff')
                }
                title = "Manage Staff & Switch Roles"
                className = "flex items-center gap-2 text-left hover:opacity-80 transition-opacity" >
                <
                div className = "w-8 h-8 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 flex items-center justify-center" > {
                    currentUser.avatar ? ( <
                        img src = {
                            currentUser.avatar
                        }
                        alt = {
                            currentUser.name
                        }
                        className = "w-full h-full object-cover" / >
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-[#EDF1F2]">
                        {currentUser?.name?.[0] || 'U'}
                      </div>
                    )}
                  </div>
                  <div className="hidden lg:block text-left">
                    <p className="text-xs font-semibold text-[#EDF1F2] leading-tight">
                      {currentUser?.name?.split(' ')[0] || 'User'}
                    </p> <
                span className = "text-[10px] text-indigo-400 font-mono capitalize flex items-center gap-0.5" > {
                    currentUser.role === 'owner' && '👑 '
                } {
                    currentUser.role === 'manager' && '💼 '
                } {
                    (currentUser.role === 'salesman' || currentUser.role === 'cashier') && '⚡ '
                } {
                    currentUser.role || 'Staff'
                } <
                /span> <
                /div> <
                /button> <
                button onClick = {
                    logout
                }
                title = "Sign Out"
                className = "p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors ml-1" >
                <
                LogOut size = {
                    15
                }
                /> <
                /button> <
                /div>
            ) : ( <
                button onClick = {
                    onOpenLogin
                }
                className = "px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors" >
                Sign In <
                /button>
            )
        }

        <
        /div> <
        /div>

        {
            /* Mobile / Tablet Horizontal Scroll Menu */ } <
        div className = "xl:hidden flex overflow-x-auto border-t border-slate-800/80 px-2 py-1 gap-1 no-scrollbar" > {
            navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return ( <
                    button key = {
                        item.id
                    }
                    onClick = {
                        () => setActiveTab(item.id)
                    }
                    className = {
                        `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800'
                }`
                    } >
                    <
                    Icon size = {
                        13
                    }
                    /> <
                    span > {
                        item.label
                    } < /span> {
                        item.badge !== null && ( <
                            span className = "px-1 rounded-full text-[9px] bg-white text-indigo-700 font-bold" > {
                                item.badge
                            } <
                            /span>
                        )
                    } <
                    /button>
                );
            })
        } <
        /div> <
        /header>

        {
            /* Global Shortcuts Modal & PWA Install Modal */ } <
        ShortcutsModal isOpen = {
            showShortcuts
        }
        onClose = {
            () => setShowShortcuts(false)
        }
        /> <
        PWAInstallModal isOpen = {
            showPWAModal
        }
        onClose = {
            () => setShowPWAModal(false)
        }
        /> <
        />
    );
}