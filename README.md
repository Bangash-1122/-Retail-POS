# 🛒 RetailPOS Pro — Next-Gen MERN Point of Sale & Inventory System

A modern, high-performance **Retail Point of Sale (POS) & Inventory Management System** built with the **MERN Stack** (MongoDB/Express/React/Node.js) featuring a cyberpunk/glassmorphic UI, real-time barcode scanning, Web Audio API sound effects, and **Universal Thermal Receipt Printing** (supports USB, Wi-Fi, and Bluetooth 80mm & 58mm thermal printers with 0-click silent Kiosk printing).

---

## ✨ Key Features

### 1. ⚡ High-Speed POS Terminal (Billing Register)
- **Fast Barcode & Text Search:** Instant SKU lookup with auto-focus (`F2` shortcut) and live hardware scanner support.
- **Audio Sound Effects:** 100% offline Web Audio API realistic scanner beeps (`Honeywell/Zebra` pitch) and cash payment chimes.
- **Category Filter Tabs:** Fast navigation across *Groceries, Beverages, Snacks, Dairy, Bakery, Personal Care, and Household*.
- **Interactive Real-Time Cart:**
  - Dynamic item quantity increment/decrement.
  - Subtotal, GST/Sales Tax toggle, and flat/percentage discount calculation.
  - Large illuminated Grand Total display.
  - Walk-in and registered customer tracking.

### 2. 🖨️ Universal Thermal Receipt Printing (Hardware Agnostic)
- **100% Universal Compatibility:** Works seamlessly with **USB, Wi-Fi/Network, and Bluetooth** thermal printers (Epson, Xprinter, Rongta, Star Micronics, Sunmi, generic Chinese printers).
- **Dual Paper Roll Support:** 1-click switcher between **80mm (3-inch Standard POS)** and **58mm (2-inch Mini POS)**.
- **Formatted Receipts:** Includes store branding, address, phone, NTN/Tax ID, order #, date/time, cashier name, itemized pricing, change due, and barcode visual footer.


## 🚀 Tech Stack

- **Frontend:**
  - React 18
  - Vite 5 (Ultra-fast HMR)
  - Tailwind CSS 3 (Glassmorphism & Cyber Dark Theme)
  - Lucide React (Modern icons)
  - Web Audio API (Scanner beep synthesizers)
- **Backend:**
  - Node.js & Express.js
  - RESTful API Architecture
  - CORS & Dotenv
- **Database Engine (Dual-Mode):**
  - **MongoDB / Mongoose:** Production-ready document storage.
  - **Local Persistent Engine:** Automatic fallback to persistent JSON storage (`store.json`) with pre-seeded FMCG retail products if MongoDB is offline.

---

## 🖨️ Universal Thermal Printer Setup Guide

### How It Works
Because the application utilizes standard OS printer drivers combined with `@media print` thermal formatting, you do not need low-level vendor SDKs or specific COM port drivers:

1. **Connect your thermal printer:**
   - **USB:** Plug in the cable; Windows will install it as a printer.
   - **Bluetooth:** Pair in Windows Settings (`Bluetooth & Devices` -> `Add Device`).
   - **Wi-Fi:** Connect to the store Wi-Fi network and add via IP in Windows.
2. In Windows **Printers & Scanners**, set your thermal printer as the **Default Printer**.
3. In **Printing Preferences**, select your roll width (**80mm** or **58mm**) and set margins to **None / 0**.

### ⚡ Enabling 0-Click Silent Kiosk Printing (Chrome / Edge)
To eliminate the browser print popup so receipts print instantly when pressing checkout:
1. Right-click your **Google Chrome** desktop shortcut -> **Properties**.
2. In the **Target** box, add `--kiosk-printing` to the end of the line:
   ```text
   "C:\Program Files\Google\Chrome\Application\chrome.exe" --kiosk-printing
   ```
3. Click **Apply** and open Chrome from this shortcut.
4. Now, whenever an order completes, the thermal receipt will print immediately without any popup!

---

## ⌨️ POS Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| <kbd>F2</kbd> | Focus Barcode / Product Search Input |
| <kbd>F4</kbd> | Open Checkout & Payment Dialog |
| <kbd>Esc</kbd> | Clear Search / Close Open Dialogs |
| <kbd>Enter</kbd> | Submit Scanned Barcode to Cart |

---

## 🛠️ Installation & Setup

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

### 1. Clone the Repository
```bash
git clone https://github.com/Bangash-1122/-Retail-POS.git
cd -Retail-POS
```

### 2. Backend Setup
```bash
cd backend
npm install
npm run dev
```
Backend runs on: `http://localhost:5001`

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Frontend runs on: `http://localhost:3000`

---

## 📂 Project Structure

```text
├── backend/
│   ├── src/
│   │   ├── controllers/      # Product, Order, Analytics, Settings controllers
│   │   ├── models/           # Product, Order, Setting schemas
│   │   ├── routes/           # REST API endpoints
│   │   └── data/             # Persistent JSON fallback & initial seed catalog
│   ├── .env.example          # Environment configuration
│   ├── package.json
│   └── server.js             # Express application entrypoint
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx    # Top navigation & system status
│   │   │   └── pos/          # ProductCard, CartDrawer, PaymentModal, ThermalReceipt
│   │   ├── context/          # POSContext (Cart, Products, Thermal Print Engine)
│   │   ├── pages/            # POSRegister, Inventory, SalesHistory, Dashboard, Settings
│   │   ├── utils/            # Web Audio scanner beep & API client
│   │   ├── App.jsx
│   │   ├── index.css         # @media print rules for 80mm/58mm thermal paper
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.js
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License.
