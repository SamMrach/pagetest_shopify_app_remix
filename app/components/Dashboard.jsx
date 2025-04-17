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

import { useFetcher } from "@remix-run/react";
export default function Dashboard({
  onLogout,
  pages,
  products,
  initialSelectedPages,
  initialSelectedProducts,
}) {
  const [selectedPages, setSelectedPages] = useState(
    initialSelectedPages || [],
  );
  const [selectedProducts, setSelectedProducts] = useState(
    initialSelectedProducts || [],
  );
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
    setAllPagesSelected(
      selected.length === pages.length && selected.length > 0,
    );
  };

  // Handle product selection with OptionList
  const handleProductsChange = (selected) => {
    setSelectedProducts(selected.filter(Boolean));
    setAllProductsSelected(selected.filter(Boolean).length === products.length);
  };

  // Save settings
  const handleSaveSettings = async () => {
    // Call the fetcher to save the settings
    if (pages.length === 0 && products.length === 0) {
      toggleToast("No pages or products available to save.");
      return;
    }
    fetcher.submit(
      {
        actionType: "saveSelecedPagesAndProducts",
        selectedPages: selectedPages,
        selectedProducts: selectedProducts,
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

  useEffect(() => {
    setAllPagesSelected(
      selectedPages.length === pages.length && selectedPages.length > 0,
    );
    setAllProductsSelected(
      selectedProducts.length === products.length &&
        selectedProducts.length > 0,
    );
  }, []);

  return (
    <Frame>
      <Page
        title="PageTest.ai Settings"
        primaryAction={{
          content: "Logout",
          onAction: () => {
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
              {pages.length === 0 ? (
                <Text as="h2" variant="headingSm">
                  No pages found
                </Text>
              ) : (
                <>
                  {
                    <Text as="h2" variant="headingSm">
                      Select Pages to Test
                    </Text>
                  }
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
                </>
              )}
            </Card>
          </Layout.Section>

          <Layout.Section>
            <Card>
              {
                products.length === 0 ? (
                  <Text>No products available</Text>
                ) : (
                  <>
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
                  </>
                ) /* Show message if no products available */
              }
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
