export function loader() {
    return new Response(
      `(function() {
        // Your script code here
        // ...
      })();`,
      {
        status: 200,
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "public, max-age=3600"
        }
      }
    );
  }
  