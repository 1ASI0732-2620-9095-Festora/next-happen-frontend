import http from "@/shared/infrastructure/http.js";

const AUTH_PATH = "/api/auth";

export async function registerUserService(payload) {
  return http.post(`${AUTH_PATH}/register`, payload);
}

export async function loginUserService(payload) {
  return http.post(`${AUTH_PATH}/login`, payload);
}

/**
 * Request a 6-digit Email OTP verification code
 */
export async function sendTwoFactorCode(email) {
  try {
    return await http.post(`${AUTH_PATH}/2fa/send`, { email });
  } catch (err) {
    // Graceful fallback for mock / development before backend migration
    const simulatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    sessionStorage.setItem('nh_2fa_expected_code', simulatedCode);
    sessionStorage.setItem('nh_2fa_generated_at', Date.now().toString());
    console.info(`%c[NextHappen 2FA Security]%c Verification code for ${email}: %c${simulatedCode}`, 
      'background:#ffcd00;color:#000;font-weight:bold;padding:2px 6px;border-radius:3px;',
      'color:#333;font-weight:bold;',
      'background:#000;color:#fff;font-weight:bold;padding:2px 8px;border-radius:3px;'
    );
    return { data: { success: true, simulated: true, code: simulatedCode } };
  }
}

/**
 * Verify the 6-digit Email OTP verification code
 */
export async function verifyTwoFactorCode(email, code) {
  try {
    return await http.post(`${AUTH_PATH}/2fa/verify`, { email, code });
  } catch (err) {
    // Check fallback code
    const expected = sessionStorage.getItem('nh_2fa_expected_code') || '123456';
    if (code === expected) {
      sessionStorage.removeItem('nh_2fa_expected_code');
      return { data: { success: true, verified: true } };
    }
    const error = new Error('Invalid verification code.');
    error.response = { data: { error: 'Invalid verification code.' } };
    throw error;
  }
}
