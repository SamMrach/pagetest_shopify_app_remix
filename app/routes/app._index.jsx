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
import prisma from "../db.server";

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

  // Fetch selected pages and products from the database
  const selectedData = await fetchSelectePagesAndProducts(session.shop);

  return json({
    pages,
    products,
    shop: session.shop,
    selectedData,
    selectedPages: selectedData.selectedPages,
    selectedProducts: selectedData.selectedProducts,
  });
}

const fetchSelectePagesAndProducts = async (domain) => {
  const shop = await prisma.shop.findUnique({
    where: { domain },
    select: { selections: true },
  });

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }
  return json(shop.selections);
};

const saveSelectedPagesAndProducts = async (
  domain,
  selectedPages,
  selectedProducts,
) => {
  const shop = await prisma.shop.findUnique({
    where: { domain },
    select: { selections: true },
  });

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }

  await prisma.shop.update({
    where: { domain },
    data: {
      selections: {
        selectedPages,
        selectedProducts,
      },
    },
  });
};

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPages = formData.get("selectedPages");
  const selectedProducts = formData.get("selectedProducts");
  const selectedPagesArray = selectedPages.split(",");
  const selectedProductsArray = selectedProducts.split(",");
  const domain = session.shop;
  await saveSelectedPagesAndProducts(domain, selectedPages, selectedProducts);
  return json({ success: true });
}

export default function Index() {
  const {
    pages,
    products,
    shop,
    selectedData,
    selectedPages,
    selectedProducts,
  } = useLoaderData();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const fetcher = useFetcher();

  const onLogin = (token) => {
    localStorage.setItem("pagetest_authToken", token);
    setIsAuthenticated(true);
  };

  const onLogout = () => {
    localStorage.removeItem("pagetest_authToken");
    setIsAuthenticated(false);
  };

  const triggerAction = async (selectedPages, selectedProducts) => {
    fetcher.submit(
      {
        _action: "submit",
        selectedPages,
        selectedProducts,
      },
      { method: "post" }, // Adjust the path as needed
    );
    console.log("selectedPages", selectedPages);
    console.log("selectedProducts", selectedProducts);
  };

  useEffect(() => {
    const authToken = localStorage.getItem("pagetest_authToken");
    if (authToken) {
      setIsAuthenticated(true);
    }

    console.log("selectedPages", selectedPages);
    console.log("selectedProducts", selectedProducts);
    console.log("selectedData", selectedData);
  }, []);

  return (
    <Page>
      {isAuthenticated ? (
        <Dashboard
          onLogout={onLogout}
          pages={pages}
          products={products}
          triggerAction={triggerAction}
        />
      ) : (
        <LoginComponent onLogin={onLogin} />
      )}
    </Page>
  );
}
