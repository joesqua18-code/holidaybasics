# Holiday Basics - Order Management System

A web-based order-taking application for Holiday Basics product catalog, featuring a modern UI with product browsing, filtering, ordering, and CSV export capabilities.

## 🎯 Project Goal

Convert a product order management system to work with Holiday Basics' inventory data from Excel, create a GitHub Pages-hosted website where customers can browse products, place orders, and export order data.

## 📁 Project Structure

```
holidaybasics/
├── index.html                      # Landing page with project overview
├── order_app.html                  # Main order-taking application (2,119 lines)
├── convert_excel_to_csv.py         # Python script to convert Excel inventory to CSV
├── DEC ITEM MASTER.xlsx            # Source inventory data (2,724 products)
│
├── css/
│   └── style.css                   # Extracted stylesheet for all pages
│
├── js/
│   ├── shared_utils.js             # Utility functions (CSV parsing, filtering, sorting)
│   └── order_app.js                # Main application logic
│
├── data/
│   ├── products.csv                # Generated product catalog (converted from Excel)
│   └── category_breakdown.csv     # Category code mapping (e.g., "0010" → "Carry Over Hats")
│
└── images/                         # Product images (3,900+ .jpg files)
    ├── 1000506SW1.jpg
    ├── 1000858HT.jpg
    └── ...
```

## 🗂️ File Descriptions

### HTML Files

- **`index.html`** (Landing Page)
  - Welcome page with project overview
  - Features grid showing capabilities
  - Link to main order application
  - Clean, modern design with gradient header

- **`order_app.html`** (Main Application)
  - Complete order-taking system (2,119 lines with inline CSS/JS)
  - Product catalog viewer with grid layout
  - Advanced filtering and sorting
  - Order management and CSV export
  - Customer link generation
  - Image zoom functionality
  - Responsive design

### Data Files

- **`DEC ITEM MASTER.xlsx`** (Source Data - 247KB)
  - Original inventory spreadsheet
  - **Column A:** Item Code (matches image filenames)
  - **Column B:** Description
  - **Column C:** Sales Unit of Measure (e.g., "C48" = case of 48)
  - **Column D:** Prod (category code - needs mapping)
  - **Column L:** Total Quantity On Hand
  - **Column M:** UDF_UPC (barcode)
  - Contains 2,724 products

- **`data/products.csv`** (Generated Catalog)
  - Converted from Excel using `convert_excel_to_csv.py`
  - Headers: `STYLE,DESC,CATEGORY,LOT,QOH_CASES,UPC_SKU_2,PRICE_CS,PRICE_UNIT,SIZE`
  - **CATEGORY:** Human-readable names (mapped from Prod codes)
  - **PRICE_CS:** Placeholder $10.00 (ready to replace with real pricing)
  - **PRICE_UNIT:** Placeholder $1.00 (ready to replace with real pricing)
  - 2,725 rows (header + 2,724 products)

- **`data/category_breakdown.csv`** (Category Mapping)
  - Maps numeric category codes to descriptions
  - Example: `0010` → `Carry Over Hats`
  - Example: `10` → `Soft Goods`
  - Special: `Z` → `Inactive`
  - Unmapped codes default to `MISC`

### Scripts

- **`convert_excel_to_csv.py`** (Python Conversion Script)
  - Reads `DEC ITEM MASTER.xlsx`
  - Loads category mapping from `category_breakdown.csv`
  - Cleans quantity data (strips dashes like "48.00-")
  - Maps category codes with fuzzy matching (handles "10-" → "10")
  - Adds placeholder pricing ($10/$1)
  - Outputs to `data/products.csv`
  - **Usage:** `python3 convert_excel_to_csv.py`

### Stylesheets & Scripts

- **`css/style.css`**
  - Extracted from inline styles
  - CSS variables for theming (colors, spacing)
  - Responsive grid layouts
  - Product card styles
  - Modal and overlay styles
  - Zoom panel styling

- **`js/shared_utils.js`**
  - `parseCSV(text)` - Parse CSV text to array of objects
  - `applyFilters(products, filters)` - Filter products by criteria
  - `sortData(products, field, order)` - Sort products
  - `groupData(products, field)` - Group products by field
  - `formatPrice(price)` - Format number to 2 decimals
  - `loadProductImage(element, style, path, ext)` - Lazy load images
  - `showToast(message, type)` - Display notifications
  - `debounce(func, wait)` - Debounce function calls

- **`js/order_app.js`** (if extracted - currently inline in order_app.html)
  - Product catalog loading and rendering
  - Filter and search logic
  - Order management (add/remove products)
  - CSV export functionality
  - Customer link generation
  - Image zoom features
  - localStorage for saved orders

### Images

- **`images/` folder (3,900+ files)**
  - Product photos named by Item Code
  - Format: `{ITEM_CODE}.jpg` (e.g., `1000506SW1.jpg`)
  - Automatically matched to products during rendering
  - Missing images show "No Image" placeholder

## 🔧 How It Works

### Data Flow

```
1. Excel File (DEC ITEM MASTER.xlsx)
   ↓
2. Conversion Script (convert_excel_to_csv.py)
   ↓ (maps categories, cleans data, adds pricing)
   ↓
3. CSV File (data/products.csv)
   ↓
4. Order App (order_app.html)
   ↓ (loads products, applies filters, renders cards)
   ↓
5. User Interface (product grid with orders)
   ↓
6. CSV Export (customer orders)
```

### Key Features

1. **Product Browsing**
   - Grid layout with responsive design (4 items/row default, adjustable)
   - Product images with zoom-on-hover
   - Real-time search across Style, Description, UPC
   - Default filter: Hide out-of-stock products (QOH > 0)

2. **Advanced Filtering**
   - Multiple filter rows with operators (contains, equals, >, <, >=, <=)
   - Filter by: Item Code, Description, Category, UPC, Qty, Price
   - Combine filters with AND logic
   - Persistent filters until reset

3. **Grouping & Sorting**
   - Group by: Brand, Category
   - Sort by: Item Code, Description, Category, Price, Quantity
   - Ascending/Descending order

4. **Order Management**
   - Add quantities with +/- buttons or direct input
   - Visual highlight for items in order (green border)
   - Order summary sidebar (items count, total cases)
   - localStorage auto-save (order persists on refresh)

5. **Export**
   - Download orders as CSV
   - Includes: Customer info, Style, Description, Quantity, Price, Totals
   - Formatted for import into order processing systems

6. **Customer Links**
   - Generate password-protected links for specific product sets
   - Share filtered catalogs with customers
   - URL-encoded configuration (works offline)

## 🚀 Deployment (GitHub Pages)

### Current Status
- **Repository:** `joesqua18-code/holidaybasics`
- **Branch:** `main`
- **URL:** `https://joesqua18-code.github.io/holidaybasics/`

### Setup Steps
1. Repository → Settings → Pages
2. Source: Deploy from branch `main`
3. Folder: `/ (root)`
4. Wait 1-2 minutes for build

### What Was Done

#### Phase 1: Initial Setup (Completed)
- ✅ Created directory structure (css/, js/, data/, images/)
- ✅ Extracted CSS to external file
- ✅ Organized JavaScript utilities
- ✅ Set up GitHub Pages structure
- ✅ Fixed paths for root-relative deployment

#### Phase 2: Data Conversion (Completed)
- ✅ Analyzed Excel structure (2,724 products)
- ✅ Created conversion script
- ✅ Mapped 61 category codes to human names
- ✅ Cleaned quantity formatting (stripped dashes)
- ✅ Added placeholder pricing ($10/$1)
- ✅ Generated products.csv (2,725 lines)

#### Phase 3: Application Updates (Completed)
- ✅ Updated branding: "Liberty Distributors" → "Holiday Basics"
- ✅ Removed French/NL catalogs (single catalog now)
- ✅ Updated filter fields (removed VENDOR_ID, PARENT_CATEGORY, SUBCATEGORY)
- ✅ Simplified category display (CATEGORY only)
- ✅ Updated sort/group options
- ✅ Added default out-of-stock filter
- ✅ Fixed paths for GitHub Pages (removed `../`)

#### Phase 4: Known Issues
- ⚠️ GitHub Pages deployment pending/failing (404 error)
- Possible causes:
  - Deployment still building (can take 5-10 minutes)
  - GitHub Actions workflow issue
  - Cache needs clearing
- **Next step:** Check GitHub Actions tab for deployment status

## 🔄 Data Updates

To update the product catalog with new inventory:

```bash
# 1. Replace Excel file with new data
cp /path/to/new/DEC_ITEM_MASTER.xlsx DEC\ ITEM\ MASTER.xlsx

# 2. Re-run conversion
python3 convert_excel_to_csv.py

# 3. Commit and push
git add data/products.csv
git commit -m "Update product catalog"
git push origin main
```

### Updating Prices

When real pricing is available:

1. Open `data/products.csv`
2. Find and replace:
   - `10.00` → actual case prices
   - `1.00` → actual unit prices
3. Or update Excel and re-run conversion script

## 📊 Data Quality

From latest conversion (2,724 products):
- ✅ **Item Codes:** 100% populated (2,724/2,724)
- ✅ **Descriptions:** 100% populated (2,724/2,724)
- ✅ **Categories:** 100% mapped (using category_breakdown.csv)
- ⚠️ **UPCs:** 99.8% populated (2,718/2,724 - 6 missing)
- ⚠️ **Quantities:** Cleaned (1 had formatting issue "48.00-")
- ⚠️ **Pricing:** Placeholders only ($10/$1)

## 🎨 Branding

**Current Theme:**
- Primary color: `#1b3a6d` (Navy blue)
- Accent color: `#38a169` (Green)
- Company: Holiday Basics
- Version: v1.6.0

## 📝 Notes

- **Image Optimization:** Skipped (3,900 images would take too long)
- **Compression:** Images served at original quality
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)
- **Mobile Friendly:** Responsive design adapts to screen size
- **Offline Capability:** None (requires server for CSV loading)

## 🐛 Troubleshooting

### "No products found"
- Check browser console for CSV loading errors
- Verify `data/products.csv` exists
- Check Network tab for 404 errors on CSV file

### "Images not loading"
- Verify image filenames match Item Codes exactly
- Check `images/` folder exists with .jpg files
- Look for console errors about missing images

### "404 on GitHub Pages"
- Verify repository is public
- Check GitHub Pages is enabled in Settings
- Wait 2-5 minutes after pushing to main
- Check Actions tab for failed deployments

### "Prices showing as $10/$1"
- These are placeholders - update `data/products.csv` with real pricing
- Or add pricing to Excel and re-run conversion script

## 📞 Support

For issues or questions, check:
- GitHub Issues: `https://github.com/joesqua18-code/holidaybasics/issues`
- GitHub Pages Docs: `https://docs.github.com/en/pages`

---

**Last Updated:** February 13, 2026
**Status:** Deployed to main branch, GitHub Pages deployment pending
**Total Products:** 2,724
**Total Images:** 3,900+
