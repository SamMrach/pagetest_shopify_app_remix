// Configuration
const API_BASE_URL =
  '${process.env.SHOPIFY_APP_URL || "https://your-app-domain.com"}'; // Will use your app's URL

// Get the current shop domain from the window location
const shopDomain = Shopify.shop || window.location.hostname;

// Helper function to determine if the current page is a product page
function isProductPage() {
  return window.location.pathname.includes("/products/");
}

// Helper function to extract product ID from the page
function getCurrentProductId() {
  // This assumes Shopify's standard data structure
  if (window.meta && window.meta.product && window.meta.product.id) {
    return `${window.meta.product.id}`;
  }

  // Alternative method if meta is not available
  const productJson = document.getElementById("ProductJson-product-template");
  if (productJson) {
    try {
      const data = JSON.parse(productJson.innerHTML);
      return `gid://shopify/Product/${data.id}`;
    } catch (e) {
      console.error("Error parsing product JSON:", e);
    }
  }

  return null;
}

// Helper function to get current page ID
function getCurrentPageId() {
  if (
    window.meta &&
    window.meta.page &&
    window.meta.page.pageType === "page" &&
    window.meta.page.resourceId
  ) {
    // Return the page ID in the Shopify GraphQL ID format
    return window.meta.page.resourceId;
  }
  return null;
}
// Fetch only the relevant selected items based on page type
function fetchSelectedItems() {
  // Determine if we're on a product page or regular page
  const isOnProductPage = isProductPage();
  const dataType = isOnProductPage ? "products" : "pages";

  console.log(
    "PageTest.ai - Detected page type:",
    isOnProductPage
      ? "Product Page"
      : isOnRegularPage()
        ? "Regular Page"
        : "Unknown",
  );

  // Fetch only the data we need based on page type
  return fetch(
    `${API_BASE_URL}/api/shop-data?domain=${encodeURIComponent(shopDomain)}&type=${dataType}`,
  )
    .then((response) => {
      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }
      return response.json();
    })
    .catch((error) => {
      console.error("Error fetching selected items:", error);
      return isOnProductPage ? { selectedProducts: [] } : { selectedPages: [] };
    });
}

// Check if current page/product is in the selected list
function checkCurrentPage(selections) {
  // Determine if we're on a product page
  const isOnProductPage = isProductPage();

  if (isOnProductPage) {
    // We're on a product page, check if it's selected
    const productId = getCurrentProductId();
    //console.log("PageTest.ai - Current product ID:", productId);

    // Handle the case where selections might be a string or array
    const selectedProducts = Array.isArray(selections.selectedProducts)
      ? selections.selectedProducts
      : typeof selections.selectedProducts === "string"
        ? selections.selectedProducts.split(",")
        : [];

    //console.log("PageTest.ai - Selected Products:", selectedProducts);

    if (selectedProducts.length === 0) {
      console.log("PageTest.ai - No products selected for testing");
      return;
    }

    if (productId && selectedProducts.includes(productId)) {
      console.log("PageTest.ai - Current product is selected for testing");
      // Implement your product page testing logic here
      fetchAndInjectedLatestSnippet();
    } else {
      console.log("PageTest.ai - Current product is NOT selected for testing");
    }
  } else if (isOnRegularPage()) {
    // We're on a regular page, check if it's selected
    const pageId = getCurrentPageId();
    console.log("PageTest.ai - Current page ID/handle:", pageId);

    // Handle the case where selections might be a string or array
    const selectedPages = Array.isArray(selections.selectedPages)
      ? selections.selectedPages
      : typeof selections.selectedPages === "string"
        ? selections.selectedPages.split(",")
        : [];

    console.log("PageTest.ai - Selected Pages:", selectedPages);

    if (selectedPages.length === 0) {
      console.log("PageTest.ai - No pages selected for testing");
      return;
    }

    if (pageId && selectedPages.some((p) => p.includes(pageId))) {
      console.log("PageTest.ai - Current page is selected for testing");
      // Implement your page testing logic here
      fetchAndInjectedLatestSnippet();
    } else {
      console.log("PageTest.ai - Current page is NOT selected for testing");
    }
  }
}

function isOnRegularPage() {
  return window.location.pathname.includes("/pages/");
}

// Initialize page testing
function fetchAndInjectedLatestSnippet() {
  // Your page testing logic here
  const snippetUrl = "https://cdn.pagetest.ai/snippet/latest.js";
  const script = document.createElement("script");
  script.src = snippetUrl;
  //document.body.appendChild(script);
  console.log("PageTest.ai - Initializing page testing");
}

// Main execution
fetchSelectedItems()
  .then((selections) => {
    checkCurrentPage(selections);
  })
  .catch((error) => {
    console.error("PageTest.ai - Error:", error);
  });
