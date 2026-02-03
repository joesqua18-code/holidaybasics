# Holiday Basics Order App

A web-based product catalog and order management system with customer-specific access control.

## Project Structure

```
holidaybasics/
├── src/
│   └── order_app.html          (Main application)
├── data/
│   ├── products.csv            (Product catalog - 3,664 items)
│   ├── category_breakdown.csv  (Category reference)
│   └── DEC ITEM MASTER.xlsx    (Original Excel source data)
├── public/
│   └── images/
│       └── Holiday Basics Images/  (3,920+ product images)
├── RUN_SERVER.bat              (Windows startup script)
└── RUN_SERVER.sh               (Linux/Mac startup script)
```

## How to Run

### Option 1: Windows (Using Command Prompt)

1. Open Command Prompt
2. Navigate to the holidaybasics folder:
   ```
   cd path\to\holidaybasics
   ```
3. Run the startup script:
   ```
   RUN_SERVER.bat
   ```
4. Open your browser to:
   ```
   http://localhost:8000/src/order_app.html
   ```

### Option 2: Linux/Mac (Using Terminal)

1. Open Terminal
2. Navigate to the holidaybasics folder:
   ```
   cd path/to/holidaybasics
   ```
3. Make the script executable:
   ```
   chmod +x RUN_SERVER.sh
   ```
4. Run the startup script:
   ```
   ./RUN_SERVER.sh
   ```
5. Open your browser to:
   ```
   http://localhost:8000/src/order_app.html
   ```

### Option 3: Manual Python Command

From the `holidaybasics` directory, run:
```bash
python -m http.server 8000
```

Then open: `http://localhost:8000/src/order_app.html`

## Features

- **Product Grid Display** - Browse 3,664+ products with images
- **Advanced Filtering** - Filter by Style, Description, Vendor, Category, Price, Stock
- **Grouping & Sorting** - Organize products by Brand or Category
- **Order Management** - Add items to cart and export orders as CSV
- **Image Zoom** - Amazon-style hover zoom to inspect products
- **Customer Portal** - Password-protected access with customer-specific catalogs
- **Responsive Design** - Works on desktop, tablet, and mobile

## Network Access

To access from another computer on your network (e.g., from an iPad):

**Your IP Address:** `10.8.0.176`

**URL:** `http://10.8.0.176:8000/src/order_app.html`

Make sure both devices are on the same network.

## Customizing Product Data

The `products.csv` file contains:
- STYLE - Product SKU/style number (must match image filenames)
- DESC - Product description
- PRICE_CS - Case price
- PRICE_UNIT - Unit/each price
- QOH_CASES - Quantity on hand
- CATEGORY - Product category
- And more...

You can edit this file to update product information. Changes will reflect in the app when you reload.

## Image Requirements

Product images should be placed in: `public/images/Holiday Basics Images/`

Image filenames should match the STYLE column in products.csv:
- `10-1054.jpg` → STYLE: `10-1054`
- `1000506SW1.jpg` → STYLE: `1000506SW1`

## Notes

- The app runs entirely in your browser - no server-side processing
- Data is stored in CSV files for simplicity
- Customer configurations can be stored as JSON files in `data/customers/`
- All changes to orders are saved locally in browser storage
