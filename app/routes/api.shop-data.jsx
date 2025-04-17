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

  if (!domain || domain === "") {
    return json(
      { error: "Missing shop domain" },
      {
        status: 400,
        headers,
      },
    );
  }

  if (!dataType || (dataType !== "pages" && dataType !== "products")) {
    return json(
      { error: "Invalid data type" },
      {
        status: 400,
        headers,
      },
    );
  }

  const shop = await prisma.shop.findUnique({
    where: { domain },
    select: { selections: true, team_hash: true },
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

  let responseData = { team_hash: shop.team_hash };

  if (dataType === "pages") {
    responseData = {
      ...responseData,
      selectedPages: shop.selections.selectedPages || [],
    };
  } else if (dataType === "products") {
    responseData = {
      ...responseData,
      selectedProducts: shop.selections.selectedProducts || [],
    };
  }

  return json(responseData, {
    headers,
  });
}
