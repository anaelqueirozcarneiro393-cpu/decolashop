async function testLogin(domain) {
  try {
    console.log(`\nTesting login on ${domain}...`);
    // 1. Get CSRF token
    const csrfRes = await fetch(`${domain}/api/auth/csrf`);
    const csrfData = await csrfRes.json();
    const csrfToken = csrfData.csrfToken;
    const cookies = csrfRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    console.log('CSRF token:', csrfToken);
    console.log('CSRF cookies:', cookies);

    // 2. Post credentials
    const loginRes = await fetch(`${domain}/api/auth/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Cookie': cookies || ''
      },
      body: new URLSearchParams({
        csrfToken,
        email: 'gerente@decolashop.com',
        password: 'decola123',
        redirect: 'false'
      })
    });

    console.log('Login status:', loginRes.status);
    const loginCookies = loginRes.headers.getSetCookie().map(c => c.split(';')[0]).join('; ');
    console.log('Login Set-Cookie headers:', loginCookies);

    // 3. Check session with that cookie
    const sessRes = await fetch(`${domain}/api/auth/session`, {
      headers: {
        'Cookie': loginCookies || cookies || ''
      }
    });
    const sessData = await sessRes.json();
    console.log('Session response:', JSON.stringify(sessData, null, 2));
  } catch (err) {
    console.error('Error on ' + domain + ':', err);
  }
}

async function run() {
  await testLogin('https://decolashop-saas.vercel.app');
  await testLogin('https://www.decolashop.com.br');
}
run();
