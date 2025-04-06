(function() {
    // Configuration
    const API_BASE_URL = 'https://your-app-domain.com'; // Replace with your actual app domain
    
    // Get the current shop domain from the window location
    const shopDomain = Shopify.shop || window.location.hostname;
    
    // Helper function to determine if the current page is a product page
    function isProductPage() {
      return window.location.pathname.includes('/products/');
    }
    
    // Helper function to extract product ID from the page
    function getCurrentProductId() {
      // This assumes Shopify's standard data structure
      if (window.meta && window.meta.product && window.meta.product.id) {
        return `gid://shopify/Product/${window.meta.product.id}`;
      }
      
      // Alternative method if meta is not available
      const productJson = document.getElementById('ProductJson-product-template');
      if (productJson) {
        try {
          const data = JSON.parse(productJson.innerHTML);
          return `gid://shopify/Product/${data.id}`;
        } catch (e) {
          console.error('Error parsing product JSON:', e);
        }
      }
      
      return null;
    }
    
    // Helper function to get current page ID
    function getCurrentPageId() {
      // This is more complex as page IDs aren't typically exposed in the frontend
      // You might need to use the page handle and match it on the backend
      const pageHandle = window.location.pathname.replace(/^\/pages\//, '');
      
      // For demonstration, we'll return a placeholder
      // In a real implementation, you might need to map handles to IDs on your backend
      return pageHandle ? `page-handle-${pageHandle}` : null;
    }
    
    // Fetch selected pages and products from your API
    function fetchSelectedItems() {
      return fetch(`${API_BASE_URL}/api/shop-data?domain=${encodeURIComponent(shopDomain)}`)
        .then(response => {
          if (!response.ok) {
            throw new Error(`API request failed with status ${response.status}`);
          }
          return response.json();
        })
        .catch(error => {
          console.error('Error fetching selected items:', error);
          return { selectedPages: [], selectedProducts: [] };
        });
    }
    
    // Check if current page/product is in the selected list
    function checkCurrentPage(selections) {
      // Convert string arrays to arrays if needed
      const selectedPages = Array.isArray(selections.selectedPages) 
        ? selections.selectedPages 
        : (typeof selections.selectedPages === 'string' ? selections.selectedPages.split(',') : []);
      
      const selectedProducts = Array.isArray(selections.selectedProducts) 
        ? selections.selectedProducts 
        : (typeof selections.selectedProducts === 'string' ? selections.selectedProducts.split(',') : []);
      
      console.log('PageTest.ai - Selected Pages:', selectedPages);
      console.log('PageTest.ai - Selected Products:', selectedProducts);
      
      // If both arrays are empty, do nothing
      if (selectedPages.length === 0 && selectedProducts.length === 0) {
        console.log('PageTest.ai - No pages or products selected for testing');
        return;
      }
      
      // Check if we're on a product page
      if (isProductPage()) {
        const productId = getCurrentProductId();
        console.log('PageTest.ai - Current product ID:', productId);
        
        if (productId && selectedProducts.includes(productId)) {
          console.log('PageTest.ai - Current product is selected for testing');
          // Implement your product page testing logic here
          initializeProductTesting();
        } else {
          console.log('PageTest.ai - Current product is NOT selected for testing');
        }
        return;
      }
      
      // Check if we're on a regular page
      const pageId = getCurrentPageId();
      console.log('PageTest.ai - Current page ID/handle:', pageId);
      
      if (pageId && selectedPages.some(p => p.includes(pageId))) {
        console.log('PageTest.ai - Current page is selected for testing');
        // Implement your page testing logic here
        initializePageTesting();
      } else {
        console.log('PageTest.ai - Current page is NOT selected for testing');
      }
    }
    
    // Initialize product testing
    function initializeProductTesting() {
      // Your product testing logic here
      console.log('PageTest.ai - Initializing product testing');
      
      // Example: Add a visual indicator
      const indicator = document.createElement('div');
      indicator.style.position = 'fixed';
      indicator.style.top = '10px';
      indicator.style.right = '10px';
      indicator.style.background = 'rgba(0, 128, 0, 0.7)';
      indicator.style.color = 'white';
      indicator.style.padding = '5px 10px';
      indicator.style.borderRadius = '3px';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'PageTest.ai Active';
      document.body.appendChild(indicator);
    }
    
    // Initialize page testing
    function initializePageTesting() {
      // Your page testing logic here
      console.log('PageTest.ai - Initializing page testing');
      
      // Example: Add a visual indicator (same as product testing in this example)
      const indicator = document.createElement('div');
      indicator.style.position = 'fixed';
      indicator.style.top = '10px';
      indicator.style.right = '10px';
      indicator.style.background = 'rgba(0, 128, 0, 0.7)';
      indicator.style.color = 'white';
      indicator.style.padding = '5px 10px';
      indicator.style.borderRadius = '3px';
      indicator.style.zIndex = '9999';
      indicator.textContent = 'PageTest.ai Active';
      document.body.appendChild(indicator);
    }
    
    // Main execution
    document.addEventListener('DOMContentLoaded', function() {
      console.log('PageTest.ai - Script loaded for shop:', shopDomain);
      
      // Fetch selected items and check current page
      fetchSelectedItems()
        .then(selections => {
          checkCurrentPage(selections);
        })
        .catch(error => {
          console.error('PageTest.ai - Error:', error);
        });
    });
  })();
  