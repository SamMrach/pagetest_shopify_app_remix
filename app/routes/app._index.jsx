import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import {
  Page,
  Layout,
  Text,
  Card,
  Button,
  BlockStack,
  Box,
  List,
  Link,
  InlineStack,
} from "@shopify/polaris";
import { TitleBar, useAppBridge } from "@shopify/app-bridge-react";
import { authenticate } from "../shopify.server";
import { useLoaderData } from "@remix-run/react";
import Dashboard from "../components/Dashboard";
import LoginComponent from "../components/LoginComponent";
import { json } from "@remix-run/node";

export async function loader({ request }) {
  const { admin, session } = await authenticate.admin(request);

  // Function to fetch all items with pagination
  async function fetchAllItems(queryFn) {
    let hasNextPage = true;
    let endCursor = null;
    let allItems = [];

    while (hasNextPage) {
      const response = await queryFn(endCursor);
      const data = await response.json();

      // Extract the relevant part of the response based on the query
      const responseKey = Object.keys(data.data)[0]; // Either 'pages' or 'products'
      const edges = data.data[responseKey].edges;
      const pageInfo = data.data[responseKey].pageInfo;

      // Add the current page of items
      allItems = [...allItems, ...edges.map((edge) => edge.node)];

      // Update pagination variables
      hasNextPage = pageInfo.hasNextPage;
      endCursor = pageInfo.endCursor;

      // Safety check to prevent infinite loops
      if (allItems.length > 5000) {
        console.warn(
          "Reached 5000 items, stopping pagination to prevent excessive API calls",
        );
        break;
      }
    }

    return allItems;
  }

  // Query function for pages
  const fetchPages = (cursor) => {
    const afterParam = cursor ? `, after: "${cursor}"` : "";
    return admin.graphql(`
      query {
        pages(first: 250${afterParam}) {
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `);
  };

  // Query function for products
  const fetchProducts = (cursor) => {
    const afterParam = cursor ? `, after: "${cursor}"` : "";
    return admin.graphql(`
      query {
        products(first: 250${afterParam}) {
          edges {
            node {
              id
              title
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    `);
  };

  // Fetch all pages and products in parallel
  const [allPages, allProducts] = await Promise.all([
    fetchAllItems(fetchPages),
    fetchAllItems(fetchProducts),
  ]);

  // Format the data for the component
  const pages = allPages.map((node) => ({
    id: node.id,
    title: node.title,
  }));

  const products = allProducts.map((node) => ({
    id: node.id,
    title: node.title,
  }));

  return json({
    pages,
    products,
    shop: session.shop,
  });
}

export default function Index() {
  const { pages, products, shop } = useLoaderData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const onLogin = (token) => {
    localStorage.setItem("pagetest_authToken", token);
    setIsAuthenticated(true);
  };

  const onLogout = () => {
    localStorage.removeItem("pagetest_authToken");
    setIsAuthenticated(false);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("pagetest_authToken");
    if (authToken) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Page>
      {isAuthenticated ? (
        <Dashboard onLogout={onLogout} pages={pages} products={products} />
      ) : (
        <LoginComponent onLogin={onLogin} />
      )}
    </Page>
  );
}
