import React, { useState } from 'react';
import { 
  X, 
  Printer, 
  CheckCircle2, 
  ArrowRight, 
  Info
} from 'lucide-react';
import { usePOS } from '../../context/POSContext';
import ThermalReceipt from './ThermalReceipt';

export default function ReceiptModal() {
  const { 
    isReceiptModalOpen, 
    setIsReceiptModalOpen, 
    activeReceipt, 
    settings 
  } = usePOS();

  const [previewWidth, setPreviewWidth] = useState(settings?.paperWidth || '80mm');

  if (!isReceiptModalOpen || !activeReceipt) return null;

  const handlePrint = () => {
    window.print();
  };

  const is58mm = previewWidth === '58mm';

  return (
    <>
      {/* ── Screen Modal UI ── */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0A1214]/85 backdrop-blur-md animate-fade-in">
        <div className="bg-[#0A1214] border border-[#32383B] rounded-3xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-scale-in">
          
          {/* Header */}
          <div className="px-6 py-4 border-b border-[#32383B] bg-[#32383B]/50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-[#0A1214] text-[#EDF1F2] border border-[#32383B] flex items-center justify-center">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <h3 className="font-display font-bold text-[#EDF1F2] text-base">Receipt Ready</h3>
                <p className="text-xs text-[#B2BEC2]">Invoice: <span className="text-[#EDF1F2] font-mono font-bold">{activeReceipt.orderNo}</span></p>
              </div>
            </div>

            {/* Paper Width Toggle */}
            <div className="flex items-center gap-1 bg-[#0A1214] p-1 rounded-xl border border-[#32383B] text-xs">
              <button
                onClick={() => setPreviewWidth('80mm')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  previewWidth === '80mm'
                    ? 'bg-[#EDF1F2] text-[#0A1214] font-bold shadow-sm'
                    : 'text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6]'
                }`}
              >
                80mm (Standard)
              </button>
              <button
                onClick={() => setPreviewWidth('58mm')}
                className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                  previewWidth === '58mm'
                    ? 'bg-[#EDF1F2] text-[#0A1214] font-bold shadow-sm'
                    : 'text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6]'
                }`}
              >
                58mm (Mini)
              </button>
            </div>

            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="w-8 h-8 rounded-xl bg-[#32383B] hover:bg-[#CBD3D6] text-[#B2BEC2] hover:text-[#0A1214] flex items-center justify-center transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Thermal Receipt Visual Preview Box */}
          <div className="flex-1 overflow-y-auto p-6 bg-[#0A1214] flex flex-col items-center">
            
            {/* Paper Simulation Card */}
            <div 
              className={`bg-white text-black rounded-lg shadow-2xl transition-all duration-200 ${
                is58mm ? 'w-[230px] p-3 text-[10px]' : 'w-[320px] p-4 text-[11px]'
              }`}
              style={{ fontFamily: "'Courier New', Courier, monospace" }}
            >
              <div className="text-center pb-2">
                <h2 className="text-sm font-black uppercase tracking-tight text-black m-0">
                  {settings.storeName}
                </h2>
                <p className="text-[9px] text-neutral-600 m-0">{settings.storeTagline}</p>
                <p className="text-[9px] text-neutral-600 m-0">{settings.address}</p>
                <p className="text-[9px] text-neutral-600 m-0">Tel: {settings.phone}</p>
                {settings.ntn && <p className="text-[9px] text-neutral-600 m-0">NTN: {settings.ntn}</p>}
              </div>

              <div className="border-t border-dashed border-black my-1.5"></div>

              <div className="text-[10px] space-y-0.5">
                <div className="flex justify-between">
                  <span><strong>INV:</strong> {activeReceipt.orderNo}</span>
                  <span>{activeReceipt.paymentMethod ? activeReceipt.paymentMethod.toUpperCase() : 'CASH'}</span>
                </div>
                <div className="flex justify-between">
                  <span>{new Date(activeReceipt.createdAt || Date.now()).toLocaleDateString()}</span>
                  <span>{new Date(activeReceipt.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Cashier: {activeReceipt.cashier || 'Admin'}</span>
                  <span>POS-01</span>
                </div>
                {activeReceipt.customerName && activeReceipt.customerName !== 'Walk-in Customer' && (
                  <div>Cust: {activeReceipt.customerName}</div>
                )}
              </div>

              <div className="border-t border-dashed border-black my-1.5"></div>

              {/* Items List */}
              <table className="w-full text-left border-collapse my-1">
                <thead>
                  <tr className="border-b border-dashed border-black text-[10px] font-bold">
                    <th className="py-1">ITEM</th>
                    <th className="py-1 text-center">QTY</th>
                    <th className="py-1 text-right">PRICE</th>
                    <th className="py-1 text-right">TOTAL</th>
                  </tr>
                </thead>
                <tbody>
                  {(activeReceipt.items || []).map((it, idx) => (
                    <tr key={idx} className="align-top text-[10px]">
                      <td className="py-0.5 pr-1">{it.name}</td>
                      <td className="py-0.5 text-center">{it.qty}</td>
                      <td className="py-0.5 text-right">{it.price}</td>
                      <td className="py-0.5 text-right font-bold">{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t border-dashed border-black my-1.5"></div>

              {/* Totals */}
              <div className="space-y-0.5 text-[10px]">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{settings.currency} {activeReceipt.subtotal ? activeReceipt.subtotal.toLocaleString() : 0}</span>
                </div>
                {activeReceipt.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Discount:</span>
                    <span>- {settings.currency} {activeReceipt.discount.toLocaleString()}</span>
                  </div>
                )}
                {activeReceipt.tax > 0 && (
                  <div className="flex justify-between">
                    <span>Tax (GST):</span>
                    <span>+ {settings.currency} {activeReceipt.tax.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-xs border-y border-black py-1 my-1">
                  <span>NET TOTAL:</span>
                  <span>{settings.currency} {activeReceipt.total ? activeReceipt.total.toLocaleString() : 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Tendered ({activeReceipt.paymentMethod || 'Cash'}):</span>
                  <span>{settings.currency} {activeReceipt.paidAmount ? activeReceipt.paidAmount.toLocaleString() : 0}</span>
                </div>
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span>{settings.currency} {activeReceipt.change ? activeReceipt.change.toLocaleString() : 0}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-black my-2"></div>

              {/* Barcode & Footer */}
              <div className="text-center pt-1">
                <div className="flex justify-center items-end gap-0.5 h-5 my-1">
                  {[2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,3,1,2].map((w, i) => (
                    <div 
                      key={i} 
                      className="bg-black" 
                      style={{ width: `${w}px`, height: i % 2 === 0 ? '18px' : '12px' }} 
                    />
                  ))}
                </div>
                <p className="text-[8px] tracking-widest m-0">*{activeReceipt.orderNo}*</p>
                <p className="text-[8.5px] mt-2 whitespace-pre-line text-neutral-700">
                  {settings.receiptFooter}
                </p>
              </div>
            </div>

            {/* Silent Printing Tip */}
            <div className="mt-4 p-3 rounded-2xl bg-[#32383B]/70 border border-[#32383B] max-w-sm text-xs text-[#EDF1F2] flex items-start gap-2">
              <Info size={16} className="text-[#CBD3D6] flex-shrink-0 mt-0.5" />
              <span>
                <strong>Silent Print (Zero Popup):</strong> Run Chrome with <code className="bg-[#0A1214] px-1 py-0.5 rounded text-[#CBD3D6] border border-[#32383B] font-mono">--kiosk-printing</code> flag for 0-second auto printing!
              </span>
            </div>

          </div>

          {/* Modal Footer */}
          <div className="px-6 py-4 bg-[#0A1214] border-t border-[#32383B] flex items-center justify-between">
            <button
              onClick={() => setIsReceiptModalOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-[#B2BEC2] hover:text-[#0A1214] hover:bg-[#CBD3D6] transition-colors"
            >
              <span>Done / Next Sale</span>
              <ArrowRight size={14} />
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#EDF1F2] hover:bg-[#CBD3D6] text-[#0A1214] font-bold text-sm shadow-glow transition-all active:scale-[0.98] border border-[#EDF1F2] hover:border-[#CBD3D6]"
            >
              <Printer size={18} />
              <span>Print Receipt Now</span>
            </button>
          </div>

        </div>
      </div>

      {/* ── Hidden Print Element for Browser window.print() ── */}
      <ThermalReceipt 
        order={activeReceipt} 
        settings={settings} 
        paperWidth={previewWidth} 
      />
    </>
  );
}