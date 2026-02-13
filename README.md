# Holiday Basics - Order System

Web-based order management for the Holiday Basics product catalog. Browse products, create orders, and export to CSV.

## Live Site

Hosted on GitHub Pages: `https://joesqua18-code.github.io/holidaybasics/`

## Project Structure

```
├── index.html              # Landing page
├── order_app.html          # Main order application
├── js/
│   └── shared_utils.js     # Shared utilities (CSV parsing, filtering, sorting)
├── data/
│   ├── products.csv        # Product catalog (2,724 products)
│   └── category_breakdown.csv  # Category code mapping
└── images/                 # Product images (3,900+ files)
```

## Features

- Product catalog with image grid
- Search, filter, sort, and group products
- Order management with quantity controls
- CSV export for orders
- Customer link generation (password-protected filtered catalogs)
- Order submission via Google Apps Script
- Responsive design

## GitHub Pages Setup

1. Repository Settings > Pages
2. Source: Deploy from branch `main`
3. Folder: `/ (root)`
