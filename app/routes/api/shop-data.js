// app/routes/api/shop-data.ts
import { json } from "@remix-run/node";
import { prisma } from "../../db.server"; // your Prisma instance

export async function loader({ request }) {
  const url = new URL(request.url);
  const domain = url.searchParams.get("domain");

  if (!domain) {
    return json({ error: "Missing shop domain" }, { status: 400 });
  }

  const shop = await prisma.shop.findUnique({
    where: { domain },
    select: { selections: true },
  });

  if (!shop) {
    return json({ error: "Shop not found" }, { status: 404 });
  }

  return json(shop.selections, {
    headers: {
      "Cache-Control": "no-store",
    },
  });
}
