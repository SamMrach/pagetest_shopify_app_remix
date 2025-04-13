// Configuration
const API_BASE_URL = "${process.env.SHOPIFY_APP_URL}";
const snippetUrl = "https://app.pagetest.ai/build/snippet/ptai.js";
const shopDomain = Shopify.shop || window.location.hostname;

function isProductPage() {
  return (
    window.APP_PAGE_DATA?.pageType === "product" ||
    window.location.pathname.includes("/products/")
  );
}

function getCurrentProductId() {
  if (window.APP_PAGE_DATA?.resourceId) return window.APP_PAGE_DATA.resourceId;

  return null;
}

function getCurrentPageId() {
  if (window.APP_PAGE_DATA?.resourceId) return window.APP_PAGE_DATA.resourceId;

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
  return (
    window.APP_PAGE_DATA?.pageType === "page" ||
    window.location.pathname.includes("/pages/")
  );
}

function fetchAndInjectedLatestSnippet() {
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
  const res = await fetchSelectedItems(dataType, shopDomain);
  const selectedItems = isOnProductPage
    ? res.selectedProducts
    : res.selectedPages;

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
