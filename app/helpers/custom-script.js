// Configuration
const API_BASE_URL = "${process.env.SHOPIFY_APP_URL}";
const snippetUrl = "https://app.pagetest.ai/build/snippet/ptai.js";
const shopDomain = Shopify.shop || window.location.hostname;

// Helper function to determine if the current page is a product page
function isProductPage() {
  return window.location.pathname.includes("/products/");
}

// Helper function to extract product ID from the page
function getCurrentProductId() {
  // This assumes Shopify's standard data structure
  if (window.APP_PAGE_DATA?.productId) return window.APP_PAGE_DATA.productId;

  // if (window.meta?.product?.id) {
  //   return `${window.meta.product.id}`;
  // }

  return null;
}

function getCurrentPageId() {
  if (window.APP_PAGE_DATA?.pageId) return window.APP_PAGE_DATA.pageId;

  // if (
  //   window.meta &&
  //   window.meta.page &&
  //   window.meta.page.pageType === "page" &&
  //   window.meta.page.resourceId
  // ) {
  //   return window.meta.page.resourceId;
  // }

  return null;
}

async function fetchSelectedItems(dataType, shopDomain) {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/shop-data?domain=${encodeURIComponent(shopDomain)}&type=${dataType}`,
    );
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error fetching selected items:", error);
    return isProductPage() ? { selectedProducts: [] } : { selectedPages: [] };
  }
}

function isOnRegularPage() {
  return window.location.pathname.includes("/pages/");
}

// Initialize page testing
function fetchAndInjectedLatestSnippet() {
  // Your page testing logic here
  const script = document.createElement("script");
  script.src = snippetUrl;
  document.body.appendChild(script);
}

async function initializePageTestScript() {
  if (!isOnRegularPage() && !isProductPage()) {
    console.log("PageTest.ai - Not on a product or regular page");
    return;
  }

  const isOnProductPage = isProductPage();
  const dataType = isOnProductPage ? "products" : "pages";
  const shopDomain = Shopify.shop || window.location.hostname;
  const selectedItems = await fetchSelectedItems(dataType, shopDomain);
  if (selectedItems.length === 0) {
    console.log("PageTest.ai - No items selected for testing");
    return;
  }
  const currentItemId = isOnProductPage
    ? getCurrentProductId()
    : getCurrentPageId();

  if (currentItemId) {
    if (selectedItems.includes(currentItemId)) {
      console.log("PageTest.ai - Current item is selected for testing");
      fetchAndInjectedLatestSnippet();
    } else {
      console.log("PageTest.ai - Current item is NOT selected for testing");
    }
  } else {
    console.log("PageTest.ai - Could not determine current item");
  }
}

initializePageTestScript();
