import React from 'react';

export default function ThermalReceipt({ order, settings, paperWidth }) {
  if (!order) return null;

  const width = paperWidth || settings?.paperWidth || '80mm';
  // 80mm roll standard printable width is ~72mm (280px-300px); 58mm is ~48mm (190px-200px)
  const is58mm = width === '58mm';

  return (
    <div
      id="thermal-receipt-printable"
      style={{
        width: is58mm ? '52mm' : '74mm',
        padding: is58mm ? '2mm' : '4mm',
        fontFamily: "'Courier New', Courier, monospace",
        fontSize: is58mm ? '10px' : '11px',
        lineHeight: '1.25',
        color: '#000000',
        backgroundColor: '#ffffff',
        margin: '0 auto',
      }}
    >
      {/* Store Header */}
      <div style={{ textAlign: 'center', marginBottom: '6px' }}>
        <h1 style={{ 
          fontSize: is58mm ? '14px' : '16px', 
          fontWeight: '900', 
          margin: '0 0 2px 0', 
          letterSpacing: '-0.5px',
          textTransform: 'uppercase'
        }}>
          {settings?.storeName || 'RETAIL STORE'}
        </h1>
        {settings?.storeTagline && (
          <p style={{ fontSize: is58mm ? '9px' : '10px', margin: '1px 0', fontStyle: 'italic' }}>
            {settings.storeTagline}
          </p>
        )}
        <p style={{ margin: '1px 0', fontSize: is58mm ? '9px' : '10px' }}>
          {settings?.address || 'Main Commercial Market'}
        </p>
        {settings?.phone && (
          <p style={{ margin: '1px 0', fontSize: is58mm ? '9px' : '10px' }}>
            Tel: {settings.phone}
          </p>
        )}
        {settings?.ntn && (
          <p style={{ margin: '1px 0', fontSize: is58mm ? '9px' : '10px' }}>
            NTN/Tax #: {settings.ntn}
          </p>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Invoice Meta */}
      <div style={{ fontSize: is58mm ? '9px' : '10px', margin: '4px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span><strong>INVOICE:</strong> {order.orderNo}</span>
          <span>{order.paymentMethod?.toUpperCase()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>DATE: {new Date(order.createdAt || Date.now()).toLocaleDateString()}</span>
          <span>{new Date(order.createdAt || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>CASHIER: {order.cashier || 'Admin'}</span>
          <span>TERMINAL: POS-01</span>
        </div>
        {order.customerName && order.customerName !== 'Walk-in Customer' && (
          <div>CUSTOMER: {order.customerName} {order.customerPhone ? `(${order.customerPhone})` : ''}</div>
        )}
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Items Table */}
      <table style={{ width: '100%', borderCollapse: 'collapse', margin: '4px 0' }}>
        <thead>
          <tr style={{ borderBottom: '1px dashed #000', textAlign: 'left', fontWeight: 'bold' }}>
            <th style={{ padding: '2px 0', width: is58mm ? '45%' : '50%' }}>ITEM</th>
            <th style={{ padding: '2px 0', textAlign: 'center', width: '15%' }}>QTY</th>
            <th style={{ padding: '2px 0', textAlign: 'right', width: '20%' }}>PRICE</th>
            <th style={{ padding: '2px 0', textAlign: 'right', width: is58mm ? '20%' : '15%' }}>TOTAL</th>
          </tr>
        </thead>
        <tbody>
          {(order.items || []).map((item, idx) => (
            <tr key={idx} style={{ verticalAlign: 'top' }}>
              <td style={{ padding: '2px 0', wordBreak: 'break-word' }}>
                {item.name}
              </td>
              <td style={{ padding: '2px 0', textAlign: 'center' }}>
                {item.qty}
              </td>
              <td style={{ padding: '2px 0', textAlign: 'right' }}>
                {item.price}
              </td>
              <td style={{ padding: '2px 0', textAlign: 'right', fontWeight: 'bold' }}>
                {item.total || item.qty * item.price}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div style={{ borderTop: '1px dashed #000', margin: '4px 0' }}></div>

      {/* Totals Section */}
      <div style={{ margin: '4px 0', fontSize: is58mm ? '10px' : '11px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
          <span>Subtotal:</span>
          <span>{settings?.currency || 'Rs.'} {order.subtotal?.toLocaleString()}</span>
        </div>

        {order.discount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
            <span>Discount:</span>
            <span>- {settings?.currency || 'Rs.'} {order.discount?.toLocaleString()}</span>
          </div>
        )}

        {order.tax > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
            <span>Sales Tax (GST):</span>
            <span>+ {settings?.currency || 'Rs.'} {order.tax?.toLocaleString()}</span>
          </div>
        )}

        {/* Grand Total */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          borderTop: '1px solid #000', 
          borderBottom: '1px solid #000', 
          padding: '4px 0',
          margin: '4px 0',
          fontSize: is58mm ? '12px' : '14px',
          fontWeight: '900'
        }}>
          <span>NET TOTAL:</span>
          <span>{settings?.currency || 'Rs.'} {order.total?.toLocaleString()}</span>
        </div>

        {/* Paid and Change */}
        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0' }}>
          <span>Tendered ({order.paymentMethod}):</span>
          <span>{settings?.currency || 'Rs.'} {order.paidAmount?.toLocaleString()}</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', margin: '1px 0', fontWeight: 'bold' }}>
          <span>Change Due:</span>
          <span>{settings?.currency || 'Rs.'} {order.change?.toLocaleString() || 0}</span>
        </div>
      </div>

      <div style={{ borderTop: '1px dashed #000', margin: '6px 0' }}></div>

      {/* Barcode & Footer Note */}
      <div style={{ textAlign: 'center', marginTop: '6px' }}>
        {/* CSS Barcode lines simulation */}
        <div style={{ 
          display: 'inline-flex', 
          alignItems: 'flex-end', 
          justifyContent: 'center', 
          gap: '2px', 
          height: '24px', 
          margin: '4px 0' 
        }}>
          {[2,1,3,1,2,3,1,2,1,3,2,1,2,3,1,2,1,3,2,1,3,1,2].map((w, i) => (
            <div 
              key={i} 
              style={{ 
                width: `${w}px`, 
                height: i % 2 === 0 ? '22px' : '16px', 
                backgroundColor: '#000' 
              }} 
            />
          ))}
        </div>
        <p style={{ margin: '1px 0', fontSize: '9px', letterSpacing: '2px' }}>
          *{order.orderNo}*
        </p>

        <p style={{ 
          fontSize: is58mm ? '8.5px' : '9.5px', 
          margin: '6px 0 2px 0', 
          whiteSpace: 'pre-line' 
        }}>
          {settings?.receiptFooter || "Thank you for your visit!"}
        </p>
        <p style={{ fontSize: '8px', color: '#666', margin: '2px 0' }}>
          Software by RetailPOS Pro
        </p>
      </div>

      {/* Spacing for Thermal Paper Tear/Cut */}
      <div style={{ height: '15mm' }}></div>
    </div>
  );
}
