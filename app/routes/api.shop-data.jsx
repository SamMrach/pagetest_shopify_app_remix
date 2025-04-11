import { json } from "@remix-run/node";
import prisma from "../db.server";

// Add this function to handle OPTIONS requests
export async function loader({ request }) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
  // Handle preflight OPTIONS request
  if (request.method === "OPTIONS") {
    return new Response(null, {
      headers,
    });
  }

  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");
  const dataType = url.searchParams.get("type"); // "pages", "products", or undefined for both

  if (!domain) {
    return json(
      { error: "Missing shop domain" },
      {
        status: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
          "Cache-Control": "no-store",
        },
      },
    );
  }

  const shop = await prisma.shop.findUnique({
    where: { domain },
    select: { selections: true },
  });

  if (!shop) {
    return json(
      { error: "Shop not found" },
      {
        status: 404,
        headers,
      },
    );
  }

  // Prepare the response based on the requested data type
  let responseData = {};

  if (dataType === "pages") {
    // Return only pages
    responseData = {
      selectedPages: shop.selections.selectedPages || [],
    };
  } else if (dataType === "products") {
    // Return only products
    responseData = {
      selectedProducts: shop.selections.selectedProducts || [],
    };
  } else {
    // Invalid data type requested
    return json(
      { error: "Invalid data type." },
      {
        status: 400,
        headers,
      },
    );
  }

  return json(responseData, {
    headers,
  });
}
