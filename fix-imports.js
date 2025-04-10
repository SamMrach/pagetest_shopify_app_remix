import fs from "fs";
import path from "path";

const filePath = path.resolve(
  "./node_modules/@shopify/shopify-app-remix/dist/esm/react/components/AppProvider/AppProvider.mjs",
);

if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, "utf8");

  // Replace the problematic import with a dynamic import
  content = content.replace(
    /import\s+enTranslations\s+from\s+['"]@shopify\/polaris\/locales\/en\.json['"]\s+with\s+{\s+type:\s+['"]json['"]\s+};/,
    `const enTranslations = await import('@shopify/polaris/locales/en.json', { assert: { type: 'json' } }).then(m => m.default);`,
  );

  fs.writeFileSync(filePath, content);
  console.log("Fixed import assertion in AppProvider.mjs");
}
