export const initialProducts = [
  {
    barcode: "8964000101",
    name: "Lipton Yellow Label Tea 400g",
    category: "Beverages",
    price: 680,
    costPrice: 590,
    stock: 45,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000102",
    name: "Olper's Full Cream Milk 1 Litre",
    category: "Dairy",
    price: 290,
    costPrice: 260,
    stock: 60,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000103",
    name: "Coca Cola Classic Can 330ml",
    category: "Beverages",
    price: 110,
    costPrice: 90,
    stock: 120,
    minStock: 24,
    image: "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000104",
    name: "Lay's Classic Salted Potato Chips 50g",
    category: "Snacks",
    price: 100,
    costPrice: 82,
    stock: 80,
    minStock: 20,
    image: "https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000105",
    name: "Dawn Milky Bread Large",
    category: "Bakery",
    price: 220,
    costPrice: 190,
    stock: 25,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000106",
    name: "Nestle Pure Life Mineral Water 1.5L",
    category: "Beverages",
    price: 120,
    costPrice: 95,
    stock: 75,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000107",
    name: "Cadbury Dairy Milk Chocolate 80g",
    category: "Snacks",
    price: 280,
    costPrice: 235,
    stock: 50,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1548907040-4baa42d10919?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000108",
    name: "Ariel Complete Detergent Powder 1kg",
    category: "Household",
    price: 750,
    costPrice: 660,
    stock: 30,
    minStock: 6,
    image: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000109",
    name: "Colgate Maximum Cavity Protection 100g",
    category: "Personal Care",
    price: 240,
    costPrice: 195,
    stock: 40,
    minStock: 10,
    image: "https://images.unsplash.com/photo-1559591937-e1032b4b4231?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000110",
    name: "National Basmati Rice Super Kernel 5kg",
    category: "Groceries",
    price: 1950,
    costPrice: 1720,
    stock: 20,
    minStock: 5,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000111",
    name: "Dalda Cooking Oil 1 Litre Pouch",
    category: "Groceries",
    price: 520,
    costPrice: 475,
    stock: 35,
    minStock: 8,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000112",
    name: "Oreo Original Sandwich Cookies 120g",
    category: "Snacks",
    price: 130,
    costPrice: 105,
    stock: 65,
    minStock: 15,
    image: "https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000113",
    name: "Shan Biryani Masala Double Pack",
    category: "Groceries",
    price: 180,
    costPrice: 145,
    stock: 90,
    minStock: 20,
    image: "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000114",
    name: "Dettol Anti-Bacterial Soap 135g",
    category: "Personal Care",
    price: 160,
    costPrice: 130,
    stock: 4, // low stock for alert testing
    minStock: 10,
    image: "https://images.unsplash.com/photo-1607006311028-d897519bb5a1?w=300&auto=format&fit=crop&q=60"
  },
  {
    barcode: "8964000115",
    name: "Red Bull Energy Drink 250ml",
    category: "Beverages",
    price: 450,
    costPrice: 380,
    stock: 3, // low stock
    minStock: 12,
    image: "https://images.unsplash.com/photo-1551024709-8f23befc6f87?w=300&auto=format&fit=crop&q=60"
  }
];

export const initialSettings = {
  storeName: "AL-MADINA SUPER MART",
  storeTagline: "Quality & Value Every Day",
  address: "Shop #14-B, Commercial Market, Main Boulevard",
  city: "Lahore, Pakistan",
  phone: "+92 300 9876543",
  ntn: "TRN-9843210-9",
  currency: "Rs.",
  taxRate: 5, // 5% default tax
  paperWidth: "80mm", // '80mm' | '58mm'
  receiptFooter: "Goods once sold can be exchanged within 3 days with receipt.\nThank you for shopping with us!",
  enableBeep: true,
  autoPrintReceipt: true
};
