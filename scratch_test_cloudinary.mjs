async function testCloudinaryUrl() {
  const urlWithoutGen = "https://res.cloudinary.com/dwtefghdi/image/upload/v1780001839/qzonzlcs6eob01alv9to.webp";
  const urlWithGen = "https://res.cloudinary.com/dwtefghdi/image/upload/f_jpg/e_gen_background_replace:prompt_Elegant%2C_sunlit_patio_with_marble_and_lush_greenery_surroundings./v1780001839/qzonzlcs6eob01alv9to.jpg";

  try {
    const resWithout = await fetch(urlWithoutGen);
    console.log(`URL without gen status: ${resWithout.status}`);

    const resWith = await fetch(urlWithGen);
    console.log(`URL with gen status: ${resWith.status}`);
    if (resWith.status !== 200) {
      const text = await resWith.text();
      console.log(`Error body snippet:`, text.substring(0, 300));
    }
  } catch (err) {
    console.error(err);
  }
}

testCloudinaryUrl();
