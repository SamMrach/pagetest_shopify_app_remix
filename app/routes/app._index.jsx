import { useEffect, useState } from "react";
import { useFetcher } from "@remix-run/react";
import { Page } from "@shopify/polaris";
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

  const systemPages = [
    { id: "home", title: "Home" },
    { id: "cart", title: "Cart" },
  ];

  allPages.push(...systemPages);

  // Format the data for the component
  const pages = allPages.map((node) => ({
    id: node.id.replace("gid://shopify/Page/", ""),
    title: node.title,
  }));

  const products = allProducts.map((node) => ({
    id: node.id.replace("gid://shopify/Product/", ""),
    title: node.title,
  }));

  // Fetch selected pages and products from the database
  let selectedData = await fetchSelectePagesAndProducts(session.shop);

  return json({
    pages,
    products,
    shop: session.shop,
    selectedPages: selectedData.selectedPages,
    selectedProducts: selectedData.selectedProducts,
  });
}

const fetchSelectePagesAndProducts = async (domain) => {
  if (!domain) {
    console.log("Domain is not provided");
    return { selectedPages: [], selectedProducts: [] };
  }
  try {
    const shop = await prisma.shop.findUnique({
      where: { domain },
      select: { selections: true },
    });

    if (!shop || !shop.selections) {
      return { selectedPages: [], selectedProducts: [] };
    }
    return shop.selections;
  } catch (e) {
    console.log(e);
    return { selectedPages: [], selectedProducts: [] };
  }
};

const saveSelectedPagesAndProducts = async (
  domain,
  selectedPages,
  selectedProducts,
) => {
  try {
    const shop = await prisma.shop.findUnique({
      where: { domain },
      select: { selections: true },
    });

    if (!shop) {
      await prisma.shop.create({
        data: {
          domain,
          selections: {
            selectedPages,
            selectedProducts,
          },
        },
      });
      return { success: true, message: "Shop created and selections saved" };
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
    return { success: true, message: "Selections saved" };
  } catch (e) {
    console.log(e);
    return { success: false, message: "Something went wrong" };
  }
};

export async function action({ request }) {
  const { session } = await authenticate.admin(request);
  const formData = await request.formData();
  const selectedPages = formData
    .get("selectedPages")
    .split(",")
    .filter(Boolean);
  const selectedProducts = formData
    .get("selectedProducts")
    .split(",")
    .filter(Boolean);

  const domain = session.shop;

  if (!domain) {
    return json({ error: "Missing shop domain" }, { status: 400 });
  }
  const { success, message } = await saveSelectedPagesAndProducts(
    domain,
    selectedPages,
    selectedProducts,
  );
  return json({ success, message });
}

export default function Index() {
  const { pages, products, shop, selectedPages, selectedProducts } =
    useLoaderData();
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
        <Dashboard
          onLogout={onLogout}
          pages={pages}
          products={products}
          initialSelectedPages={selectedPages}
          initialSelectedProducts={selectedProducts}
        />
      ) : (
        <LoginComponent onLogin={onLogin} />
      )}
    </Page>
  );
}
