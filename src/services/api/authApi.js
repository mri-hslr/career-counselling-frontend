import { apiClient } from "./apiClient";
import { decodeJWT } from "../../utils/jwt";

/**
 * Login — OAuth2 password flow (x-www-form-urlencoded)
 * JWT payload: { sub, role, user_id, exp }
 */
export const loginUser = async ({ email, password }) => {
  const form = new FormData();
  form.append("username", email);
  form.append("password", password);

  const data = await apiClient.post("/api/v1/auth/login", form);
  const payload = decodeJWT(data.access_token);

  return {
    token: data.access_token,
    role: payload?.role || "student",
    userId: payload?.user_id || null,
  };
};

/**
 * Register — JSON body
 * Returns: { id, email, role }
 */
export const registerUser = async ({ email, password, full_name, role = "student" }) => {
  return apiClient.post("/api/v1/auth/register", { email, password, full_name, role });
};
