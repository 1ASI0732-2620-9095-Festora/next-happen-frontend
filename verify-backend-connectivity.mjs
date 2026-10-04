/**
 * NextHappen - Backend End-to-End Connectivity Verification Suite
 * Verifies live connectivity, contracts, and authentication between frontend and backend.
 */

const BASE_URL = process.env.VITE_API_URL || 'https://next-happen-backend.onrender.com';

const DEMO_USER = {
  email: 'usuario@nexthappen.demo',
  password: 'Demo1234!'
};

const DEMO_ORGANIZER = {
  email: 'organizador@nexthappen.demo',
  password: 'Demo1234!'
};

let userToken = null;
let userId = null;
let organizerToken = null;
let sampleEventId = null;

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  \x1b[32m✔ PASS:\x1b[0m ${message}`);
    passed++;
  } else {
    console.error(`  \x1b[31m✖ FAIL:\x1b[0m ${message}`);
    failed++;
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });

  let data = null;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
  }

  return { status: res.status, ok: res.ok, data };
}

async function runTests() {
  console.log(`\n======================================================`);
  console.log(` NextHappen E2E Backend Connectivity & Contract Suite`);
  console.log(` Target Backend: ${BASE_URL}`);
  console.log(`======================================================\n`);

  // Test 1: Public Events
  console.log('[Test 1] Public Events Discovery: GET /api/events/public');
  try {
    const res = await request('/api/events/public');
    assert(res.status === 200, `Status code is 200 OK (received ${res.status})`);
    assert(Array.isArray(res.data), `Response is an array of events (count: ${res.data?.length || 0})`);
    if (res.data?.length > 0) {
      const ev = res.data[0];
      sampleEventId = ev.id;
      assert(!!ev.title && typeof ev.price === 'number', `Event schema verified: "${ev.title}" (S/. ${ev.price})`);
    }
  } catch (err) {
    assert(false, `Request failed: ${err.message}`);
  }

  // Test 2: User Login
  console.log('\n[Test 2] Attendee User Authentication: POST /api/auth/login');
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(DEMO_USER)
    });
    assert(res.status === 200, `User login returned 200 OK`);
    assert(!!res.data?.token, `JWT token received successfully`);
    assert(res.data?.role === 'User', `User role correctly resolved as 'User'`);
    userToken = res.data?.token;
    userId = res.data?.id;
  } catch (err) {
    assert(false, `User login failed: ${err.message}`);
  }

  // Test 3: Organizer Login
  console.log('\n[Test 3] Organizer Authentication: POST /api/auth/login');
  try {
    const res = await request('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(DEMO_ORGANIZER)
    });
    assert(res.status === 200, `Organizer login returned 200 OK`);
    assert(!!res.data?.token, `Organizer JWT token received`);
    assert(res.data?.role === 'Organizer', `Role correctly resolved as 'Organizer'`);
    organizerToken = res.data?.token;
  } catch (err) {
    assert(false, `Organizer login failed: ${err.message}`);
  }

  // Test 4: 2FA OTP Verification
  console.log('\n[Test 4] Two-Factor Authentication OTP Verification: POST /api/auth/verify-otp');
  try {
    const res = await request('/api/auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        email: DEMO_USER.email,
        code: '123456'
      })
    });
    assert(res.status === 200, `OTP verification endpoint returned 200 OK`);
    assert(res.data?.verified === true, `OTP code accepted and verified`);
  } catch (err) {
    assert(false, `OTP verification failed: ${err.message}`);
  }

  // Test 5: User Saved Events
  console.log('\n[Test 5] Attendee Saved Events: GET /api/users/{userId}/saved-events');
  try {
    const targetUserId = userId || 'bc1543c2-c24d-4e06-9b6e-fb5865acf1e6';
    const res = await request(`/api/users/${targetUserId}/saved-events`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(res.status === 200, `Saved events returned 200 OK`);
    assert(Array.isArray(res.data), `Saved events returned an array (count: ${res.data?.length || 0})`);
  } catch (err) {
    assert(false, `Saved events request failed: ${err.message}`);
  }

  // Test 6: User Tickets
  console.log('\n[Test 6] User Purchased Tickets: GET /api/users/{userId}/tickets');
  try {
    const targetUserId = userId || 'bc1543c2-c24d-4e06-9b6e-fb5865acf1e6';
    const res = await request(`/api/users/${targetUserId}/tickets`, {
      headers: { Authorization: `Bearer ${userToken}` }
    });
    assert(res.status === 200, `User tickets returned 200 OK`);
    assert(Array.isArray(res.data), `Tickets collection returned as array (count: ${res.data?.length || 0})`);
  } catch (err) {
    assert(false, `User tickets request failed: ${err.message}`);
  }

  // Test 7: Event Reviews
  console.log('\n[Test 7] Engagement & Reviews: GET /api/events/{eventId}/reviews');
  try {
    const eventIdToQuery = sampleEventId || 'fa92f1df-0621-4c9a-9a6e-33d5fdb5cdbe';
    const res = await request(`/api/events/${eventIdToQuery}/reviews`);
    assert(res.status === 200, `Reviews endpoint returned 200 OK`);
    assert(typeof res.data?.average === 'number' || Array.isArray(res.data), `Reviews data structure received properly`);
  } catch (err) {
    assert(false, `Event reviews request failed: ${err.message}`);
  }

  // Test 8: Ticket Door Validation (Invalid Code Simulation)
  console.log('\n[Test 8] Organizer Door Validation: POST /api/tickets/validate');
  try {
    const res = await request('/api/tickets/validate', {
      method: 'POST',
      headers: { Authorization: `Bearer ${organizerToken}` },
      body: JSON.stringify({ qrCode: 'INVALID-SAMPLE-TEST-CODE' })
    });
    assert(res.status === 200 || res.status === 400, `Validation endpoint reachable and evaluated code (status: ${res.status})`);
    if (res.status === 200) {
      assert(res.data?.valid === false, `Correctly identified invalid ticket code as invalid`);
    }
  } catch (err) {
    assert(false, `Ticket validation failed: ${err.message}`);
  }

  console.log(`\n======================================================`);
  console.log(` Test Results Summary: \x1b[32m${passed} PASSED\x1b[0m, \x1b[31m${failed} FAILED\x1b[0m`);
  console.log(`======================================================\n`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
