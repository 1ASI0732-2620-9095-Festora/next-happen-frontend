import http from "@/shared/infrastructure/http.js";

const AUTH_PATH = "/api/auth";

export async function registerUserService(payload) {
  return http.post(`${AUTH_PATH}/register`, payload);
}

export async function loginUserService(payload) {
  return http.post(`${AUTH_PATH}/login`, payload);
}
