"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  Checkbox,
  Button,
  Page,
  OptionList,
  Layout,
  Text,
  Toast, // Add this import
  Frame, // Add this import
} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import {
  getAuthToken,
  getSelectedPages,
  getSelectedProducts,
} from "../helpers/utils";
import { useFetcher } from "@remix-run/react";
export default function Dashboard({
  onLogout,
  pages,
  products,
  triggerAction,
}) {
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [allProductsSelected, setAllProductsSelected] = useState(false);
  const fetcher = useFetcher();

  // Add state for toast
  const [toastActive, setToastActive] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  // Function to toggle toast
  const toggleToast = (message) => {
    setToastMessage(message);
    setToastActive(true);
  };

  // Fetch pages and products from Shopify store
  useEffect(() => {
    const selectedPages = getSelectedPages();
    const selectedProducts = getSelectedProducts();
    if (selectedPages) {
      setSelectedPages(selectedPages);
    }
    if (selectedProducts) {
      setSelectedProducts(selectedProducts);
    }
  }, []);

  // Handle "All Pages" checkbox
  const handleAllPagesChange = () => {
    const newValue = !allPagesSelected;
    setAllPagesSelected(newValue);

    if (newValue) {
      setSelectedPages(pages.map((page) => page.id));
    } else {
      setSelectedPages([]);
    }
  };

  // Handle "All Products" checkbox
  const handleAllProductsChange = () => {
    const newValue = !allProductsSelected;
    setAllProductsSelected(newValue);

    if (newValue) {
      setSelectedProducts(products.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  // Handle page selection with OptionList
  const handlePagesChange = (selected) => {
    setSelectedPages(selected);
    setAllPagesSelected(selected.length === pages.length);
  };

  // Handle product selection with OptionList
  const handleProductsChange = (selected) => {
    setSelectedProducts(selected);
    setAllProductsSelected(selected.length === products.length);
  };

  // Save settings
  const handleSaveSettings = async () => {
    // This would be your API call to save the selected pages and products
    // console.log("Saving settings:", {
    //   pages: selectedPages,
    //   products: selectedProducts,
    // });
    // Save selected pages and products to local storage
    // localStorage.setItem(
    //   "pagetest_selectedPages",
    //   JSON.stringify(selectedPages),
    // );
    // localStorage.setItem(
    //   "pagetest_selectedProducts",
    //   JSON.stringify(selectedProducts),
    // );

    // Call the fetcher to save the settings
    fetcher.submit(
      {
        selectedPages: selectedPages.join(","),
        selectedProducts: selectedProducts.join(","),
      },
      { method: "post" },
    );

    // Replace alert with toast
    toggleToast("Settings saved successfully!");
  };

  // Convert pages to OptionList format
  const pageOptions = pages.map((page) => ({
    value: page.id,
    label: page.title,
  }));

  // Convert products to OptionList format
  const productOptions = products.map((product) => ({
    value: product.id,
    label: product.title,
  }));

  return (
    <Frame>
      <Page
        title="PageTest.ai Settings"
        primaryAction={{
          content: "Logout",
          onAction: () => {
            // Logout logic here
            onLogout();
          },
        }}
      >
        {/* Add Toast component */}
        {toastActive && (
          <Toast
            content={toastMessage}
            onDismiss={() => setToastActive(false)}
            duration={4000}
            position="top"
          />
        )}
        <Layout>
          <Layout.Section>
            <Card title="Pages to Test">
              <Text as="h2" variant="headingSm">
                Select Pages to Test
              </Text>
              <div style={{ padding: "16px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <Checkbox
                    label="All Pages"
                    checked={allPagesSelected}
                    onChange={handleAllPagesChange}
                  />
                </div>
                <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                  <OptionList
                    onChange={handlePagesChange}
                    options={pageOptions}
                    selected={selectedPages}
                    allowMultiple
                  />
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              <Text as="h2" variant="headingSm">
                Select Products to Test
              </Text>
              <div style={{ padding: "16px" }}>
                <div style={{ marginBottom: "16px" }}>
                  <Checkbox
                    label="All Products"
                    checked={allProductsSelected}
                    onChange={handleAllProductsChange}
                  />
                </div>
                <div style={{ maxHeight: "180px", overflowY: "auto" }}>
                  <OptionList
                    onChange={handleProductsChange}
                    options={productOptions}
                    selected={selectedProducts}
                    allowMultiple
                  />
                </div>
              </div>
            </Card>
          </Layout.Section>

          <Layout.Section>
            <div
              style={{
                marginTop: "5px",
                display: "flex",
                justifyContent: "flex-start",
              }}
            >
              <Button variant="primary" onClick={handleSaveSettings}>
                Save Settings
              </Button>
            </div>
          </Layout.Section>
        </Layout>
      </Page>
    </Frame>
  );
}
