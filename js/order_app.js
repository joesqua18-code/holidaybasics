        let filteredProducts = [];
        let order = {};
        let currentImagePath = 'images/';
        let currentImageExt = '.jpg';

        document.addEventListener('DOMContentLoaded', function() {
            // Check URL params for catalog selection
            const urlParams = new URLSearchParams(window.location.search);
            const catalog = urlParams.get('catalog');
            if (catalog) {
                const select = document.getElementById('dataSource');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].dataset.catalog === catalog) {
                        select.selectedIndex = i;
                        break;
                    }
                }
            }

            // Check for customer mode BEFORE loading data
            // If customer link params exist, skip loadData - loadCustomerData will handle it
            const isCustomerLink = urlParams.get('cx') || urlParams.get('customer');
            if (!isCustomerLink) {
                loadData();
            }
            addFilter();
            document.getElementById('searchInput').addEventListener('input', debounce(renderProducts, 300));
        });

        function toggleSection(header) {
            header.parentElement.classList.toggle('collapsed');
        }

        async function loadData() {
            // Skip if in customer mode - loadCustomerData handles this
            if (customerMode) return;

            try {
                const select = document.getElementById('dataSource');
                const selectedOption = select.options[select.selectedIndex];
                currentImagePath = selectedOption.dataset.images || 'images/';
                currentImageExt = selectedOption.dataset.ext || '.jpg';

                const response = await fetch(select.value);
                const text = await response.text();

                // Check again after async fetch in case customer mode started
                if (customerMode) return;

                allProducts = parseCSV(text);
                allProducts.forEach(p => { if (p.DESC) p.BRAND = p.DESC.split(' ')[0]; });
                filteredProducts = [...allProducts];
                order = {}; // Clear order when switching catalogs
                renderProducts();
                showToast(`Loaded ${allProducts.length} products from ${selectedOption.text}`, 'success');
            } catch (err) {
                showToast('Error loading data', 'error');
            }
        }

        function copyShareLink() {
            const select = document.getElementById('dataSource');
            const selectedOption = select.options[select.selectedIndex];
            const catalog = selectedOption.dataset.catalog;
            const url = `${window.location.origin}${window.location.pathname}?catalog=${catalog}`;
            navigator.clipboard.writeText(url).then(() => {
                showToast('Share link copied to clipboard!', 'success');
            }).catch(() => {
                // Fallback for older browsers
                prompt('Copy this link:', url);
            });
        }

        const FILTER_FIELDS = [
            { id: 'STYLE', label: 'Style #' },
            { id: 'DESC', label: 'Description' },
            { id: 'VENDOR_ID', label: 'Vendor ID' },
            { id: 'CATEGORY', label: 'Category' },
            { id: 'UPC_SKU_2', label: 'UPC' },
            { id: 'PRICE_CS', label: 'Case Price' },
            { id: 'QOH_CASES', label: 'Qty on Hand' }
        ];

        function addFilter() {
            const container = document.getElementById('filterContainer');
            const row = document.createElement('div');
            row.className = 'filter-row';
            row.innerHTML = `
                <select class="form-select filter-field">
                    <option value="">Field</option>
                    ${FILTER_FIELDS.map(f => `<option value="${f.id}">${f.label}</option>`).join('')}
                </select>
                <select class="form-select filter-operator">
                    <option value="contains">Contains</option>
                    <option value="equals">Equals</option>
                    <option value="starts">Starts</option>
                    <option value="gt">&gt;</option>
                    <option value="lt">&lt;</option>
                    <option value="gte">≥</option>
                    <option value="lte">≤</option>
                </select>
                <input type="text" class="form-input filter-value" placeholder="Value">
                <button class="btn-icon danger" onclick="this.parentElement.remove()">×</button>
            `;
            container.appendChild(row);
        }

        function getFilters() {
            const filters = [];
            document.querySelectorAll('.filter-row').forEach(row => {
                const field = row.querySelector('.filter-field').value;
                const operator = row.querySelector('.filter-operator').value;
                const value = row.querySelector('.filter-value').value;
                if (field && value) filters.push({ field, operator, value });
            });
            return filters;
        }

        function applyFiltersAndRender() {
            filteredProducts = applyFilters(allProducts, getFilters());
            renderProducts();
            showToast(`Found ${filteredProducts.length} products`, 'success');
        }

        function resetFilters() {
            document.getElementById('filterContainer').innerHTML = '';
            addFilter();
            document.getElementById('searchInput').value = '';
            document.getElementById('groupBy').value = '';
            document.getElementById('sortBy').value = '';
            filteredProducts = [...allProducts];
            renderProducts();
        }

        function renderProducts() {
            const search = document.getElementById('searchInput').value.toLowerCase();
            const sortBy = document.getElementById('sortBy').value;
            const sortOrder = document.getElementById('sortOrder').value;
            const groupBy = document.getElementById('groupBy').value;

            let products = [...filteredProducts];
            if (search) {
                products = products.filter(p =>
                    (p.STYLE || '').toLowerCase().includes(search) ||
                    (p.DESC || '').toLowerCase().includes(search) ||
                    (p.UPC_SKU_2 || '').includes(search)
                );
            }
            if (sortBy) products = sortData(products, sortBy, sortOrder);

            document.getElementById('productCount').textContent = products.length;

            const showPrice = document.getElementById('showPrice').checked;
            const showEachPrice = document.getElementById('showEachPrice').checked;
            const showUPC = document.getElementById('showUPC').checked;
            const showQOH = document.getElementById('showQOH').checked;
            const showSize = document.getElementById('showSize').checked;
            const showLot = document.getElementById('showLot').checked;

            const container = document.getElementById('productGrid');

            if (products.length === 0) {
                container.innerHTML = `<div class="empty-state"><h3>No Products Found</h3></div>`;
                return;
            }

            let html = '';
            if (groupBy) {
                const groups = groupData(products, groupBy);
                Object.keys(groups).sort().forEach(key => {
                    html += `<div class="group-divider">${key} (${groups[key].length})</div>`;
                    groups[key].forEach(p => html += renderCard(p, showPrice, showEachPrice, showUPC, showQOH, showSize, showLot));
                });
            } else {
                products.forEach(p => html += renderCard(p, showPrice, showEachPrice, showUPC, showQOH, showSize, showLot));
            }

            container.innerHTML = html;
            container.querySelectorAll('.product-image[data-style]').forEach(el => loadProductImage(el, el.dataset.style, currentImagePath, currentImageExt));
            updateOrderSummary();
        }

        function renderCard(p, showPrice, showEachPrice, showUPC, showQOH, showSize, showLot) {
            const qty = order[p.STYLE] || 0;
            let details = '';
            if (showSize && p.SIZE) details += `<div class="label">Size</div><div class="value">${p.SIZE}</div>`;
            if (showLot && p.LOT) details += `<div class="label">Pack</div><div class="value">${p.LOT}</div>`;
            if (showUPC && p.UPC_SKU_2) details += `<div class="label">UPC</div><div class="value">${(p.UPC_SKU_2||'').replace("'","")}</div>`;
            if (showQOH) details += `<div class="label">Stock</div><div class="value">${p.QOH_CASES || 0}</div>`;

            let price = '';
            if (showPrice && p.PRICE_CS) {
                price = `<div class="product-price">$${formatPrice(p.PRICE_CS)}`;
                if (showEachPrice && p.PRICE_UNIT) price += ` <span class="each">($${formatPrice(p.PRICE_UNIT)}/ea)</span>`;
                price += '</div>';
            }

            return `
                <div class="product-card ${qty > 0 ? 'has-qty' : ''}">
                    <div class="product-image zoomable" data-style="${p.STYLE}" data-desc="${(p.DESC||'').replace(/"/g, '&quot;')}"
                         onmouseenter="startZoom(this)" onmousemove="moveZoom(event, this)" onmouseleave="endZoom(this)">
                        <span class="zoom-hint">Hover to zoom</span>
                        <div class="zoom-lens"></div>
                    </div>
                    <div class="product-info">
                        <div class="product-style">${p.STYLE}</div>
                        <div class="product-desc" title="${p.DESC||''}">${p.DESC||''}</div>
                        ${details ? `<div class="product-details">${details}</div>` : ''}
                        ${price}
                        <div class="qty-control">
                            <button class="qty-btn minus" onclick="adjustQty('${p.STYLE}',-1)">−</button>
                            <input type="number" class="qty-input ${qty>0?'has-qty':''}" value="${qty}" min="0" onchange="setQty('${p.STYLE}',this.value)" onfocus="this.select()">
                            <button class="qty-btn plus" onclick="adjustQty('${p.STYLE}',1)">+</button>
                        </div>
                    </div>
                </div>
            `;
        }

        function adjustQty(style, delta) {
            const current = order[style] || 0;
            const newQty = Math.max(0, current + delta);
            if (newQty > 0) order[style] = newQty;
            else delete order[style];
            updateCardQty(style, newQty);
        }

        function setQty(style, value) {
            const newQty = Math.max(0, parseInt(value) || 0);
            if (newQty > 0) order[style] = newQty;
            else delete order[style];
            updateCardQty(style, newQty);
        }

        function updateCardQty(style, qty) {
            // Find the card for this style and update it without re-rendering everything
            const card = document.querySelector(`.product-card .product-image[data-style="${style}"]`);
            if (card) {
                const cardEl = card.closest('.product-card');
                const input = cardEl.querySelector('.qty-input');
                if (input) {
                    input.value = qty;
                    if (qty > 0) {
                        input.classList.add('has-qty');
                        cardEl.classList.add('has-qty');
                    } else {
                        input.classList.remove('has-qty');
                        cardEl.classList.remove('has-qty');
                    }
                }
            }
            updateOrderSummary();
        }

        function clearOrder() {
            order = {};
            renderProducts();
            showToast('Order cleared', 'success');
        }

        function updateOrderSummary() {
            const styles = Object.keys(order);
            const totalCases = Object.values(order).reduce((s, q) => s + q, 0);

            const summary = document.getElementById('orderSummary');
            if (styles.length > 0) {
                summary.style.display = 'block';
                document.getElementById('orderItems').textContent = styles.length;
                document.getElementById('orderCases').textContent = totalCases;
            } else {
                summary.style.display = 'none';
            }
        }

        function exportOrder() {
            if (Object.keys(order).length === 0) { showToast('No items in order', 'error'); return; }
            document.getElementById('exportModal').classList.add('active');
        }

        function closeExportModal() { document.getElementById('exportModal').classList.remove('active'); }

        function downloadOrder() {
            const name = document.getElementById('customerName').value || 'Unknown';
            const id = document.getElementById('customerId').value || 'N/A';
            let csv = 'Customer Name,Customer ID,Style,Description,Quantity,Case Price,Line Total\n';
            Object.keys(order).forEach(style => {
                const p = allProducts.find(x => x.STYLE === style);
                if (p) {
                    const price = parseFloat(p.PRICE_CS) || 0;
                    csv += `"${name}","${id}","${style}","${(p.DESC||'').replace(/"/g,'""')}",${order[style]},${price},${(price*order[style]).toFixed(2)}\n`;
                }
            });
            const blob = new Blob([csv], { type: 'text/csv' });
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `order_${id}_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            closeExportModal();
            showToast('Order exported!', 'success');
        }

        function setItemsPerRow(n) { document.getElementById('productGrid').style.setProperty('--items-per-row', n); }

        // Amazon-style Image Zoom Functions
        // Hover over product image to see zoomed view in panel to the right
        let zoomActive = false;
        let zoomImageLoaded = {};
        const ZOOM_LEVEL = 2.5;  // Magnification level for the zoom panel

        function startZoom(el) {
            const style = el.dataset.style;
            const desc = el.dataset.desc;
            const imgUrl = `${currentImagePath}${style}${currentImageExt}`;

            const panel = document.getElementById('zoomPanel');
            const panelImg = document.getElementById('zoomPanelImg');
            const panelTitle = document.getElementById('zoomPanelTitle');

            // Position panel to the right of the product card
            const cardRect = el.closest('.product-card').getBoundingClientRect();
            const panelWidth = 400;
            const panelHeight = 400;

            // Calculate position - try right side first, fallback to left if no space
            let panelX = cardRect.right + 15;
            if (panelX + panelWidth > window.innerWidth - 20) {
                panelX = cardRect.left - panelWidth - 15;
            }
            // Clamp to screen bounds
            panelX = Math.max(10, Math.min(panelX, window.innerWidth - panelWidth - 10));

            let panelY = cardRect.top;
            if (panelY + panelHeight > window.innerHeight - 20) {
                panelY = window.innerHeight - panelHeight - 20;
            }
            panelY = Math.max(10, panelY);

            panel.style.left = panelX + 'px';
            panel.style.top = panelY + 'px';

            // Load image if not cached
            if (!zoomImageLoaded[imgUrl]) {
                const testImg = new Image();
                testImg.onload = function() {
                    zoomImageLoaded[imgUrl] = { width: testImg.naturalWidth, height: testImg.naturalHeight };
                    panelImg.src = imgUrl;
                    panelImg.style.width = (testImg.naturalWidth * ZOOM_LEVEL) + 'px';
                    panelImg.style.height = (testImg.naturalHeight * ZOOM_LEVEL) + 'px';
                };
                testImg.src = imgUrl;
            } else {
                panelImg.src = imgUrl;
                const info = zoomImageLoaded[imgUrl];
                panelImg.style.width = (info.width * ZOOM_LEVEL) + 'px';
                panelImg.style.height = (info.height * ZOOM_LEVEL) + 'px';
            }

            panelTitle.textContent = `${style} - ${desc}`;

            el.classList.add('zooming');
            panel.classList.add('active');
            zoomActive = true;
        }

        function moveZoom(e, el) {
            if (!zoomActive) return;

            const rect = el.getBoundingClientRect();
            const lens = el.querySelector('.zoom-lens');
            const panelImg = document.getElementById('zoomPanelImg');
            const panel = document.getElementById('zoomPanel');

            // Calculate mouse position relative to image
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            // Lens dimensions
            const lensW = lens.offsetWidth;
            const lensH = lens.offsetHeight;

            // Constrain lens to image bounds
            let lensX = x - lensW / 2;
            let lensY = y - lensH / 2;
            lensX = Math.max(0, Math.min(lensX, rect.width - lensW));
            lensY = Math.max(0, Math.min(lensY, rect.height - lensH));

            // Position the lens
            lens.style.left = lensX + 'px';
            lens.style.top = lensY + 'px';

            // Calculate position ratio (where in the image the lens center is)
            const ratioX = (lensX + lensW / 2) / rect.width;
            const ratioY = (lensY + lensH / 2) / rect.height;

            // Position the zoomed image in the panel
            const imgW = panelImg.offsetWidth;
            const imgH = panelImg.offsetHeight;
            const panelW = panel.offsetWidth;
            const panelH = panel.offsetHeight;

            // Center the zoomed area in the panel
            let imgX = -(ratioX * imgW - panelW / 2);
            let imgY = -(ratioY * imgH - panelH / 2);

            // Clamp so we don't show outside the image
            imgX = Math.min(0, Math.max(imgX, panelW - imgW));
            imgY = Math.min(0, Math.max(imgY, panelH - imgH));

            panelImg.style.left = imgX + 'px';
            panelImg.style.top = imgY + 'px';
        }

        function endZoom(el) {
            el.classList.remove('zooming');
            document.getElementById('zoomPanel').classList.remove('active');
            zoomActive = false;
        }

        // Customer Link Functions
        let customerMode = false;
        let customerConfig = null;
        let customerSettings = { showPrices: true, showStock: true };

        function showCustomerLinkModal() {
            document.getElementById('linkCustomerCode').value = '';
            document.getElementById('linkPassword').value = '';
            document.getElementById('generatedLinkContainer').style.display = 'none';
            document.getElementById('linkWarning').style.display = 'none';
            document.getElementById('linkProductCount').textContent = filteredProducts.length;
            document.getElementById('customerLinkModal').classList.add('active');
        }

        function closeCustomerLinkModal() {
            document.getElementById('customerLinkModal').classList.remove('active');
        }

        function generateCustomerLink() {
            const customerCode = document.getElementById('linkCustomerCode').value.trim().toUpperCase();
            const password = document.getElementById('linkPassword').value;

            if (!customerCode) {
                showToast('Please enter a customer code', 'error');
                return;
            }
            if (!password) {
                showToast('Please set a password', 'error');
                return;
            }
            if (filteredProducts.length === 0) {
                showToast('No products selected! Apply filters first.', 'error');
                return;
            }

            // Get list of product styles to include
            const styles = filteredProducts.map(p => p.STYLE);

            // Get current catalog
            const select = document.getElementById('dataSource');
            const selectedOption = select.options[select.selectedIndex];
            const catalog = selectedOption.dataset.catalog;

            // Encode data in URL
            const data = {
                c: customerCode,
                p: password,
                cat: catalog,
                s: styles
            };
            const encoded = btoa(JSON.stringify(data));
            const url = `${window.location.origin}${window.location.pathname}?cx=${encoded}`;

            // Show warning if URL is too long
            const warningEl = document.getElementById('linkWarning');
            if (url.length > 2000) {
                warningEl.style.display = 'block';
            } else {
                warningEl.style.display = 'none';
            }

            // Display results
            document.getElementById('generatedLink').textContent = url;
            document.getElementById('generatedLinkContainer').style.display = 'block';
            showToast(`Config generated with ${styles.length} products`, 'success');
        }

        function copyGeneratedLink() {
            const link = document.getElementById('generatedLink').textContent;
            navigator.clipboard.writeText(link).then(() => {
                showToast('Customer link copied!', 'success');
            }).catch(() => {
                prompt('Copy this link:', link);
            });
        }

        // Customer Mode Functions
        async function checkForCustomerLink() {
            const urlParams = new URLSearchParams(window.location.search);

            // Check for URL-encoded data (cx= parameter)
            const encodedData = urlParams.get('cx');
            if (encodedData) {
                try {
                    const data = JSON.parse(atob(encodedData));
                    customerConfig = {
                        code: data.c,
                        name: data.c,
                        password: data.p,
                        catalog: data.cat,
                        allowedStyles: data.s,
                        settings: { showPrices: true, showStock: true }
                    };
                    customerMode = true;
                    document.getElementById('passwordScreen').style.display = 'flex';
                    setupCustomerUI();
                    return true;
                } catch (e) {
                    console.error('Invalid customer link:', e);
                    showToast('Invalid customer link', 'error');
                }
            }

            // Fallback: check for config file (customer= parameter)
            const customerCode = urlParams.get('customer');
            if (customerCode) {
                try {
                    const response = await fetch(`data/customers/${customerCode}.json`);
                    if (!response.ok) throw new Error('Config not found');
                    customerConfig = await response.json();
                    customerMode = true;
                    document.getElementById('passwordScreen').style.display = 'flex';
                    setupCustomerUI();
                    return true;
                } catch (e) {
                    console.error('Customer config not found:', customerCode);
                    showToast(`Customer "${customerCode}" not found`, 'error');
                }
            }
            return false;
        }

        function setupCustomerUI() {
            // Hide the header back link for customers
            document.querySelector('.app-home-btn').style.display = 'none';
            // Hide version number for customers
            document.querySelector('.header-version').style.display = 'none';
            // Only hide Data Source section (index 0), keep Filters, Sorting, Display Fields
            const sections = document.querySelectorAll('.sidebar .section');
            if (sections[0]) sections[0].style.display = 'none'; // Data Source only
            // Keep Reset button hidden, but allow Clear Order
            document.querySelectorAll('.action-buttons .btn-outline').forEach(btn => {
                if (btn.textContent === 'Reset') btn.style.display = 'none';
            });
        }

        function checkPassword() {
            const entered = document.getElementById('accessPassword').value;
            const errorEl = document.getElementById('passwordError');

            if (customerConfig && entered === customerConfig.password) {
                document.getElementById('passwordScreen').style.display = 'none';
                // Update customer info display
                document.getElementById('navUserName').textContent = customerConfig.name || customerConfig.code;
                document.getElementById('navUserAvatar').textContent = customerConfig.code.charAt(0).toUpperCase();
                errorEl.style.display = 'none';

                // Apply customer settings
                if (customerConfig.settings) {
                    customerSettings = customerConfig.settings;
                }

                // Load customer-specific data
                loadCustomerData();
            } else {
                errorEl.style.display = 'block';
                document.getElementById('accessPassword').value = '';
            }
        }

        async function loadCustomerData() {
            try {
                // Set catalog based on customer config
                const select = document.getElementById('dataSource');
                for (let i = 0; i < select.options.length; i++) {
                    if (select.options[i].dataset.catalog === customerConfig.catalog) {
                        select.selectedIndex = i;
                        break;
                    }
                }

                const selectedOption = select.options[select.selectedIndex];
                currentImagePath = selectedOption.dataset.images || 'images/';
                currentImageExt = selectedOption.dataset.ext || '.jpg';

                const response = await fetch(select.value);
                const text = await response.text();
                let products = parseCSV(text);
                products.forEach(p => { if (p.DESC) p.BRAND = p.DESC.split(' ')[0]; });

                // Filter to only allowed styles
                if (customerConfig.allowedStyles && customerConfig.allowedStyles.length > 0) {
                    const styleSet = new Set(customerConfig.allowedStyles);
                    products = products.filter(p => styleSet.has(p.STYLE));
                }

                // Apply settings - hide prices if not allowed
                if (!customerSettings.showPrices) {
                    document.getElementById('showPrice').checked = false;
                    document.getElementById('showEachPrice').checked = false;
                    document.getElementById('showPrice').parentElement.style.display = 'none';
                    document.getElementById('showEachPrice').parentElement.style.display = 'none';
                }
                if (!customerSettings.showStock) {
                    document.getElementById('showQOH').checked = false;
                    document.getElementById('showQOH').parentElement.style.display = 'none';
                }

                allProducts = products;
                filteredProducts = [...allProducts];

                // Load saved order from localStorage
                loadSavedOrder();

                renderProducts();
                showToast(`Welcome ${customerConfig.name}! ${allProducts.length} products available.`, 'success');
            } catch (err) {
                showToast('Error loading products', 'error');
            }
        }

        // localStorage functions for saving orders
        function getOrderKey() {
            const code = customerConfig ? customerConfig.code : 'default';
            return `liberty_order_${code}`;
        }

        function saveOrder() {
            if (Object.keys(order).length > 0) {
                localStorage.setItem(getOrderKey(), JSON.stringify(order));
            }
        }

        function loadSavedOrder() {
            const saved = localStorage.getItem(getOrderKey());
            if (saved) {
                try {
                    const savedOrder = JSON.parse(saved);
                    // Only load styles that are in allowed products
                    const allowedSet = new Set(allProducts.map(p => p.STYLE));
                    Object.keys(savedOrder).forEach(style => {
                        if (allowedSet.has(style)) {
                            order[style] = savedOrder[style];
                        }
                    });
                    if (Object.keys(order).length > 0) {
                        showToast('Previous order restored', 'success');
                    }
                } catch (e) {
                    console.error('Error loading saved order');
                }
            }
        }

        function clearSavedOrder() {
            localStorage.removeItem(getOrderKey());
        }

        // Override clearOrder to also clear localStorage
        const originalClearOrder = clearOrder;
        clearOrder = function() {
            order = {};
            clearSavedOrder();
            renderProducts();
            showToast('Order cleared', 'success');
        };

        // Auto-save order on changes
        const originalAdjustQty = adjustQty;
        adjustQty = function(style, delta) {
            originalAdjustQty(style, delta);
            saveOrder();
        };

        const originalSetQty = setQty;
        setQty = function(style, value) {
            originalSetQty(style, value);
            saveOrder();
        };

        // Keyboard shortcuts
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                // Close any open zoom panel
                document.getElementById('zoomPanel').classList.remove('active');
                zoomActive = false;
                document.querySelectorAll('.product-image.zooming').forEach(el => el.classList.remove('zooming'));
                closeExportModal();
                closeCustomerLinkModal();
            }
        });

        // Check for customer link on load
        (function() {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.get('cx') || urlParams.get('customer')) {
                if (document.readyState === 'loading') {
                    document.addEventListener('DOMContentLoaded', checkForCustomerLink);
                } else {
                    checkForCustomerLink();
                }
            }
