async function main() {
  const url = "http://localhost:3000/api/ad-image?title=Bandeira%20do%20Brasil%20Copa%20do%20Mundo%202026%20150x105cm&price=39.9&image=https%3A%2F%2Fmxukkgweuanemcgwvwdk.supabase.co%2Fstorage%2Fv1%2Fobject%2Fpublic%2Fproducts%2Fbandeira_brasil_2026.png";
  try {
    console.log("Calling API:", url);
    const res = await fetch(url);
    console.log("Response Status:", res.status);
    console.log("Response Content-Type:", res.headers.get("content-type"));
    if (res.status !== 200) {
      const text = await res.text();
      console.log("Response Body (partial):", text.substring(0, 500));
    } else {
      console.log("Success! Image generated.");
    }
  } catch (err) {
    console.error("Error calling API:", err);
  }
}
main();
