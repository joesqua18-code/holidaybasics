// Shared utility functions for Holiday Basics Order System

// Parse CSV text into an array of objects
function parseCSV(text) {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
    const products = [];

    for (let i = 1; i < lines.length; i++) {
        const obj = {};
        const currentLine = lines[i];

        // Simple CSV parser (handles basic quoted fields)
        const values = [];
        let currentValue = '';
        let inQuotes = false;

        for (let j = 0; j < currentLine.length; j++) {
            const char = currentLine[j];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(currentValue.trim());
                currentValue = '';
            } else {
                currentValue += char;
            }
        }
        values.push(currentValue.trim());

        headers.forEach((header, index) => {
            obj[header] = values[index] ? values[index].replace(/^"|"$/g, '') : '';
        });

        products.push(obj);
    }

    return products;
}

// Apply filters to products
function applyFilters(products, filters) {
    if (!filters || filters.length === 0) return products;

    return products.filter(product => {
        return filters.every(filter => {
            const value = String(product[filter.field] || '').toLowerCase();
            const filterValue = String(filter.value || '').toLowerCase();

            switch (filter.operator) {
                case 'contains':
                    return value.includes(filterValue);
                case 'equals':
                    return value === filterValue;
                case 'starts':
                    return value.startsWith(filterValue);
                case 'gt':
                    return parseFloat(value) > parseFloat(filterValue);
                case 'lt':
                    return parseFloat(value) < parseFloat(filterValue);
                case 'gte':
                    return parseFloat(value) >= parseFloat(filterValue);
                case 'lte':
                    return parseFloat(value) <= parseFloat(filterValue);
                default:
                    return true;
            }
        });
    });
}

// Sort products by field
function sortData(products, field, order = 'asc') {
    return [...products].sort((a, b) => {
        let aVal = a[field];
        let bVal = b[field];

        // Try to parse as numbers if possible
        const aNum = parseFloat(aVal);
        const bNum = parseFloat(bVal);

        if (!isNaN(aNum) && !isNaN(bNum)) {
            return order === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // String comparison
        aVal = String(aVal || '').toLowerCase();
        bVal = String(bVal || '').toLowerCase();

        if (order === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
    });
}

// Group products by field
function groupData(products, field) {
    const groups = {};
    products.forEach(product => {
        const key = product[field] || 'Unknown';
        if (!groups[key]) groups[key] = [];
        groups[key].push(product);
    });
    return groups;
}

// Format price to 2 decimal places
function formatPrice(price) {
    const num = parseFloat(price);
    return isNaN(num) ? '0.00' : num.toFixed(2);
}

// Unload product image (for lazy loading cleanup)
function unloadProductImage(element) {
    element.style.backgroundImage = '';
    element.classList.remove('has-image');
}

// Load product image and update element
function loadProductImage(element, style, imagePath, imageExt) {
    const img = new Image();
    img.onload = function() {
        element.style.backgroundImage = `url('${imagePath}${style}${imageExt}')`;
        element.classList.add('has-image');
    };
    img.onerror = function() {
        // Image failed to load, keep default "No Image" state
    };
    img.src = `${imagePath}${style}${imageExt}`;
}

// Show toast notification
function showToast(message, type = 'success') {
    // Remove existing toast if present
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);

    // Trigger animation
    setTimeout(() => toast.classList.add('show'), 10);

    // Auto-hide after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Debounce function to limit function calls
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
