import React, {
    useState,
    useEffect
} from 'react';
import {
    X,
    CreditCard,
    Banknote,
    Smartphone,
    CheckCircle2,
    Printer,
    AlertCircle,
    Loader2,
    Plus,
    Trash2
} from 'lucide-react';
import {
    usePOS
} from '../../context/POSContext';
import {
    api
} from '../../utils/api';
import {
    playSuccessSound
} from '../../utils/sound';

export default function PaymentModal() {
    const {
        isPaymentModalOpen,
        setIsPaymentModalOpen,
        cart,
        subtotal,
        taxAmount,
        netTotal,
        discount,
        customer,
        settings,
        clearCart,
        triggerPrintReceipt,
        loadProducts,
        addPaymentMethod,
        deletePaymentMethod
    } = usePOS();

    const dynamicPaymentMethods = settings.paymentMethods && settings.paymentMethods.length > 0 ?
        settings.paymentMethods : ['Cash', 'Card / POS', 'EasyPaisa', 'JazzCash', 'Raast / QR', 'Bank Transfer', 'Store Credit'];

    const [paymentMethod, setPaymentMethod] = useState('Cash');
    const [paidAmount, setPaidAmount] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [showAddMethod, setShowAddMethod] = useState(false);
    const [newMethodName, setNewMethodName] = useState('');
    const [savingMethod, setSavingMethod] = useState(false);

    // Default paid amount to netTotal
    useEffect(() => {
        if (isPaymentModalOpen) {
            setPaymentMethod(dynamicPaymentMethods[0] || 'Cash');
            setPaidAmount(String(netTotal));
            setError('');
            setShowAddMethod(false);
            setNewMethodName('');
        }
    }, [isPaymentModalOpen, netTotal]);

    if (!isPaymentModalOpen) return null;

    const isCashType = paymentMethod.toLowerCase().includes('cash');
    const numericPaid = Number(paidAmount) || 0;
    const changeDue = Math.max(0, numericPaid - netTotal);
    const isInsufficient = numericPaid < netTotal && isCashType;

    const handleAddNewPaymentMethod = async (e) => {
        e.preventDefault();
        if (!newMethodName.trim()) return;
        setSavingMethod(true);
        try {
            await addPaymentMethod(newMethodName.trim());
            setPaymentMethod(newMethodName.trim());
            setNewMethodName('');
            setShowAddMethod(false);
        } catch (err) {
            setError(err.message || "Failed to add payment method");
        } finally {
            setSavingMethod(false);
        }
    };

    const getMethodIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('cash')) return Banknote;
        if (lower.includes('card') || lower.includes('pos')) return CreditCard;
        if (lower.includes('wallet') || lower.includes('paisa') || lower.includes('jazz') || lower.includes('raast') || lower.includes('qr') || lower.includes('pay')) return Smartphone;
        return CreditCard;
    };

    // Quick Cash Preset chips
    const presets = [{
            label: 'Exact',
            value: netTotal
        },
        {
            label: '+100',
            value: netTotal + 100
        },
        {
            label: '+500',
            value: Math.ceil(netTotal / 500) * 500 || 500
        },
        {
            label: '+1,000',
            value: Math.ceil(netTotal / 1000) * 1000 || 1000
        },
        {
            label: '+5,000',
            value: Math.ceil(netTotal / 5000) * 5000 || 5000
        },
    ];

    const handleCompleteOrder = async () => {
        if (cart.length === 0) return;
        if (isInsufficient) {
            setError(`Amount received is less than total bill (${settings.currency} ${netTotal.toLocaleString()})`);
            return;
        }

        setSubmitting(true);
        setError('');

        try {
            const orderPayload = {
                items: cart.map(item => ({
                    productId: item.productId,
                    barcode: item.barcode,
                    name: item.name,
                    price: item.price,
                    qty: item.qty,
                    total: item.total
                })),
                subtotal,
                discount: Number(discount || 0),
                tax: Number(taxAmount || 0),
                total: netTotal,
                paidAmount: numericPaid,
                change: changeDue,
                paymentMethod,
                customerName: customer.name || 'Walk-in Customer',
                customerPhone: customer.phone || '',
                cashier: 'Admin'
            };

            const res = await api.createOrder(orderPayload);
            const createdOrder = res.data;

            playSuccessSound(settings.enableBeep);
            clearCart();
            setIsPaymentModalOpen(false);
            loadProducts(); // refresh stock counts

            // Automatically trigger receipt print modal!
            triggerPrintReceipt(createdOrder);
        } catch (err) {
            setError(err.message || "Failed to complete transaction");
        } finally {
            setSubmitting(false);
        }
    };

    return ( <
        div className = "fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in" >
        <
        div className = "bg-[#111827] border border-slate-700/80 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-in" >

        {
            /* Modal Header */
        } <
        div className = "px-6 py-4 border-b border-slate-800 bg-[#0F172A] flex items-center justify-between" >
        <
        div className = "flex items-center gap-2.5" >
        <
        div className = "p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" >
        <
        Banknote size = {
            20
        }
        /> < /
        div > <
        div >
        <
        h3 className = "font-display font-bold text-white text-lg" > Checkout & Payment < /h3> <
        p className = "text-xs text-slate-400" > Total payable: < strong className = "text-emerald-400 font-mono" > {
            settings.currency
        } {
            netTotal.toLocaleString()
        } < /strong></p >
        <
        /div> < /
        div > <
        button onClick = {
            () => setIsPaymentModalOpen(false)
        }
        className = "w-8 h-8 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors" >
        <
        X size = {
            16
        }
        /> < /
        button > <
        /div>

        {
            /* Modal Body */
        } <
        div className = "p-6 space-y-5" >

        {
            error && ( <
                div className = "flex items-center gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs" >
                <
                AlertCircle size = {
                    15
                }
                /> <
                span > {
                    error
                } < /span> < /
                div >
            )
        }

        {
            /* Payment Method Selector */
        } <
        div >
        <
        div className = "flex items-center justify-between mb-2" >
        <
        label className = "text-xs font-semibold text-slate-400 uppercase tracking-wider" >
        Payment Method <
        /label> <
        button type = "button"
        onClick = {
            () => setShowAddMethod(!showAddMethod)
        }
        className = "text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 hover:underline" >
        <
        Plus size = {
            13
        }
        /> <
        span > +Custom Method < /span> < /
        button > <
        /div>

        {
            showAddMethod && ( <
                form onSubmit = {
                    handleAddNewPaymentMethod
                }
                className = "flex items-center gap-2 mb-3 p-2 bg-slate-900 border border-indigo-500/40 rounded-xl animate-fade-in" >
                <
                input type = "text"
                placeholder = "e.g. Nayapay, SadaPay, Cheque..."
                value = {
                    newMethodName
                }
                onChange = {
                    (e) => setNewMethodName(e.target.value)
                }
                className = "flex-1 bg-slate-800 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-white focus:outline-none focus:border-indigo-500 placeholder-slate-500"
                autoFocus /
                >
                <
                button type = "submit"
                disabled = {
                    savingMethod || !newMethodName.trim()
                }
                className = "px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold" > {
                    savingMethod ? 'Adding...' : 'Add'
                } <
                /button> <
                button type = "button"
                onClick = {
                    () => setShowAddMethod(false)
                }
                className = "px-2 py-1.5 text-xs text-slate-400 hover:text-white" > ✕
                <
                /button> < /
                form >
            )
        }

        <
        div className = "grid grid-cols-3 gap-2 max-h-36 overflow-y-auto pr-1" > {
            dynamicPaymentMethods.map((mName) => {
                const Icon = getMethodIcon(mName);
                const isSelected = paymentMethod === mName;
                return ( <
                    button key = {
                        mName
                    }
                    type = "button"
                    onClick = {
                        () => {
                            setPaymentMethod(mName);
                            if (!mName.toLowerCase().includes('cash')) {
                                setPaidAmount(String(netTotal));
                            }
                        }
                    }
                    className = {
                        `flex flex-col items-center justify-center p-2.5 rounded-2xl border text-xs font-semibold gap-1.5 transition-all text-center ${
                      isSelected
                        ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                        : 'bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800'
                    }`
                    } >
                    <
                    Icon size = {
                        18
                    }
                    /> <
                    span className = "truncate w-full" > {
                        mName
                    } < /span> < /
                    button >
                );
            })
        } <
        /div> < /
        div >

        {
            /* Cash Amount Tendered vs Digital Pay Confirmation */
        } {
            isCashType ? ( <
                div className = "space-y-3" >
                <
                div >
                <
                label className = "block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider" >
                Cash Received({
                    settings.currency
                }) <
                /label> <
                div className = "relative" >
                <
                span className = "absolute left-3.5 top-3 text-slate-400 font-mono text-base" > {
                    settings.currency
                } <
                /span> <
                input type = "number"
                min = "0"
                autoFocus value = {
                    paidAmount
                }
                onChange = {
                    (e) => setPaidAmount(e.target.value)
                }
                className = "w-full pl-12 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 text-xl font-bold font-mono text-white focus:outline-none focus:border-indigo-500"
                placeholder = "0" /
                >
                <
                /div> < /
                div >

                {
                    /* Quick Presets */
                } <
                div className = "flex flex-wrap gap-2" > {
                    presets.map((p, idx) => ( <
                        button key = {
                            idx
                        }
                        type = "button"
                        onClick = {
                            () => setPaidAmount(String(p.value))
                        }
                        className = "px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700/80 text-xs font-mono font-medium text-slate-300 hover:text-white transition-colors" > {
                            p.label
                        } <
                        /button>
                    ))
                } <
                /div> < /
                div >
            ) : ( <
                div className = "p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-between animate-fade-in" >
                <
                div className = "flex items-center gap-3" >
                <
                div className = "p-2.5 rounded-xl bg-indigo-500/20 text-indigo-400" >
                <
                CheckCircle2 size = {
                    22
                }
                /> < /
                div > <
                div >
                <
                span className = "text-xs font-bold text-indigo-300 block" > {
                    paymentMethod
                } < /span> <
                span className = "text-xs text-slate-400" > Instant digital checkout— No cash change required < /span> < /
                div > <
                /div> <
                span className = "text-lg font-mono font-bold text-emerald-400" > {
                    settings.currency
                } {
                    netTotal.toLocaleString()
                } <
                /span> < /
                div >
            )
        }

        {
            /* Change Calculation Box */
        } <
        div className = "p-4 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center justify-between" >
        <
        div >
        <
        span className = "text-xs text-slate-400 block" > Change to
        return </span> <
        span className = {
            `text-2xl font-mono font-black ${
                changeDue > 0 ? 'text-emerald-400' : 'text-slate-300'
              }`
        } > {
            settings.currency
        } {
            changeDue.toLocaleString()
        } <
        /span> < /
        div > {
            changeDue > 0 && ( <
                span className = "px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" >
                Return to Customer <
                /span>
            )
        } <
        /div> < /
        div >

        {
            /* Modal Actions */
        } <
        div className = "px-6 py-4 bg-[#0F172A] border-t border-slate-800 flex items-center justify-end gap-3" >
        <
        button type = "button"
        onClick = {
            () => setIsPaymentModalOpen(false)
        }
        className = "px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800 transition-colors" >
        Cancel <
        /button>

        <
        button type = "button"
        disabled = {
            submitting || isInsufficient
        }
        onClick = {
            handleCompleteOrder
        }
        className = {
            `flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold shadow-lg transition-all ${
              submitting || isInsufficient
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 shadow-glowEmerald'
            }`
        } > {
            submitting ? ( <
                >
                <
                Loader2 size = {
                    16
                }
                className = "animate-spin" / >
                <
                span > Processing... < /span> < /
                >
            ) : ( <
                >
                <
                Printer size = {
                    18
                }
                /> <
                span > Complete Sale & Print Receipt < /span> < /
                >
            )
        } <
        /button> < /
        div >

        <
        /div> < /
        div >
    );
}