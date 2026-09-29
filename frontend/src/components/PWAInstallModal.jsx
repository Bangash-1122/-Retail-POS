import React, {
    useState,
    useEffect
} from 'react';
import {
    Download,
    Smartphone,
    Share,
    PlusSquare,
    CheckCircle2,
    X,
    Zap,
    Monitor,
    WifiOff,
    Sparkles,
    ArrowRight
} from 'lucide-react';

export default function PWAInstallModal({
    isOpen,
    onClose
}) {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [isIOS, setIsIOS] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);
    const [installSuccess, setInstallSuccess] = useState(false);

    useEffect(() => {
        // Check if already installed in standalone mode
        const standalone = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
        setIsStandalone(standalone);

        // Detect iOS
        const userAgent = window.navigator.userAgent.toLowerCase();
        const isAppleDevice = /iphone|ipad|ipod/.test(userAgent);
        setIsIOS(isAppleDevice);

        // Listen for beforeinstallprompt event (Android / Chromium)
        const handleBeforeInstall = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            window.deferredPWAInstallPrompt = e;
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstall);

        // Check if already captured globally
        if (window.deferredPWAInstallPrompt) {
            setDeferredPrompt(window.deferredPWAInstallPrompt);
        }

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
        };
    }, []);

    const handleNativeInstall = async () => {
        if (!deferredPrompt) {
            if (isIOS) {
                // Will show iOS guide in modal
                return;
            }
            alert("To install, use your browser's install icon (in the address bar or menu: 'Install RetailPOS Pro').");
            return;
        }

        deferredPrompt.prompt();
        const {
            outcome
        } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
            setInstallSuccess(true);
            setDeferredPrompt(null);
            window.deferredPWAInstallPrompt = null;
        }
    };

    if (!isOpen) return null;

    return ( <
        div className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" >
        <
        div className = "bg-[#111827] border border-slate-700 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-scale-in" >

        {
            /* Header */ } <
        div className = "px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between" >
        <
        div className = "flex items-center gap-2.5" >
        <
        div className = "w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30" >
        <
        Smartphone size = {
            18
        }
        /> <
        /div> <
        div >
        <
        h3 className = "font-display font-bold text-white text-base" > Install RetailPOS App < /h3> <
        p className = "text-[11px] text-slate-400" > PWA Native Web App Experience < /p> <
        /div> <
        /div> <
        button onClick = {
            onClose
        }
        className = "text-slate-400 hover:text-white transition-colors" >
        <
        X size = {
            16
        }
        /> <
        /button> <
        /div>

        {
            /* Content Body */ } <
        div className = "p-6 space-y-4 text-xs" >

        {
            /* App Highlights Card */ } <
        div className = "p-3.5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-indigo-950/30 border border-indigo-500/30 flex items-center gap-3" >
        <
        div className = "w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-glow flex-shrink-0" >
        <
        Zap size = {
            22
        }
        /> <
        /div> <
        div >
        <
        h4 className = "font-bold text-slate-200 text-sm" > RetailPOS Pro Terminal < /h4> <
        p className = "text-[11px] text-slate-400" > Offline - ready• Fullscreen Kiosk• Fast Hardware Billing < /p> <
        /div> <
        /div>

        {
            /* Features Checklist */ } <
        div className = "grid grid-cols-2 gap-2 text-[11px] text-slate-300" >
        <
        div className = "flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800" >
        <
        CheckCircle2 size = {
            13
        }
        className = "text-emerald-400 flex-shrink-0" / >
        <
        span > Full Screen Kiosk < /span> <
        /div> <
        div className = "flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800" >
        <
        CheckCircle2 size = {
            13
        }
        className = "text-emerald-400 flex-shrink-0" / >
        <
        span > Works on iPhone & iPad < /span> <
        /div> <
        div className = "flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800" >
        <
        CheckCircle2 size = {
            13
        }
        className = "text-emerald-400 flex-shrink-0" / >
        <
        span > Android & Tablet POS < /span> <
        /div> <
        div className = "flex items-center gap-1.5 p-2 rounded-xl bg-slate-900 border border-slate-800" >
        <
        WifiOff size = {
            13
        }
        className = "text-indigo-400 flex-shrink-0" / >
        <
        span > Offline Cache Ready < /span> <
        /div> <
        /div>

        {
            /* Instructions for iOS vs Android/Desktop */ } {
            isStandalone ? ( <
                    div className = "p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-1 text-center" >
                    <
                    p className = "font-bold text-xs flex items-center justify-center gap-1.5" >
                    <
                    CheckCircle2 size = {
                        15
                    }
                    />
                    App is Already Installed!
                    <
                    /p> <
                    p className = "text-[11px] text-emerald-400/80" >
                    You are currently running RetailPOS in standalone native app mode. <
                    /p> <
                    /div>
                ) : isIOS ? (
                    /* Apple iOS Step-by-Step Instructions */
                    <
                    div className = "p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-2.5" >
                    <
                    div className = "flex items-center gap-2 text-indigo-300 font-bold" >
                    <
                    Share size = {
                        15
                    }
                    /> <
                    span > How to Install on iPhone & iPad(iOS Safari): < /span> <
                    /div> <
                    ol className = "space-y-2 text-[11px] text-slate-300 list-decimal list-inside" >
                    <
                    li >
                    Tap the < strong className = "text-white" > Share button < /strong> (square with arrow pointing up <span className="inline-block px-1 py-0.2 bg-slate-800 rounded">⎋</span > ) at the bottom / top of Safari. <
                /li> <
                li >
                Scroll down the options and select < strong className = "text-white font-medium" > 'Add to Home Screen' < /strong> (<span className="inline-block px-1 py-0.2 bg-slate-800 rounded">➕</span > ). <
        /li> <
        li >
        Tap < strong className = "text-indigo-400" > 'Add' < /strong> in the top right. RetailPOS will now launch like a native iOS app! <
        /li> <
        /ol> <
        /div>
    ): (
        /* Android / Chrome / Edge One-Click Installation */
        <
        div className = "space-y-3" >
        <
        p className = "text-slate-400 text-xs" >
        Install as a standalone native app on Windows, macOS, Android tablets, or phones without browser address bars. <
        /p> <
        button onClick = {
            handleNativeInstall
        }
        className = "w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-2" >
        <
        Download size = {
            16
        }
        /> <
        span > Install POS App Now < /span> <
        /button> <
        /div>
    )
}

{
    /* Close Action */ } <
div className = "pt-2 flex justify-end" >
    <
    button
onClick = {
    onClose
}
className = "px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-colors" >
    Done <
    /button> <
    /div>

    <
    /div>

    <
    /div> <
    /div>
);
}