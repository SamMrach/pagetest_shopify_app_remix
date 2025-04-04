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
} from "@shopify/polaris";
import "@shopify/polaris/build/esm/styles.css";
import {
  getAuthToken,
  getSelectedPages,
  getSelectedProducts,
} from "../helpers/utils";

export default function Dashboard({ onLogout }) {
  const [pages, setPages] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedPages, setSelectedPages] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [allPagesSelected, setAllPagesSelected] = useState(false);
  const [allProductsSelected, setAllProductsSelected] = useState(false);

  // Fetch pages and products from Shopify store
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const host = params.get("host");
    const shop = params.get("shop");

    if (!host || !shop) {
      console.warn(
        "Missing host or shop parameter, app may not be properly embedded",
      );
    }

    const authToken = getAuthToken();
    if (!authToken) {
      window.location.href = "/login";
    }
    // Mock data for testing
    setPages([
      { id: "1", title: "Home Page" },
      { id: "2", title: "About Us" },
      { id: "3", title: "Contact" },
      // ... other pages
    ]);

    setProducts([
      { id: "101", title: "Product A" },
      { id: "102", title: "Product B" },
      { id: "103", title: "Product C" },
    ]);

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
  const handleSaveSettings = () => {
    // This would be your API call to save the selected pages and products
    console.log("Saving settings:", {
      pages: selectedPages,
      products: selectedProducts,
    });
    // Save selected pages and products to local storage
    localStorage.setItem(
      "pagetest_selectedPages",
      JSON.stringify(selectedPages),
    );
    localStorage.setItem(
      "pagetest_selectedProducts",
      JSON.stringify(selectedProducts),
    );

    alert("Settings saved!");
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
  );
}
