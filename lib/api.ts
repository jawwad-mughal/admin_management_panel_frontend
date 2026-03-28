// API base URL
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

// const getBaseUrl = () => {
//   if (typeof window !== "undefined") {
//     const hostname = window.location.hostname;

//     // Agar localhost pe open hai (laptop)
//     if (hostname === "localhost") {
//       return "http://localhost:5000/api";
//     }

//     // Agar mobile se open ho raha hai (same WiFi)
//     if (hostname.startsWith("192.168")) {
//       return "http://192.168.3.103:5000/api";
//     }
//   }

//   // fallback (production)
//   return "https://admin-management-panel-backend.vercel.app/api";
// };

// const API_BASE_URL = getBaseUrl();

interface ApiResponse<T> {
  success?: boolean;
  message: string;
  data?: T;
  [key: string]: any;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("accessToken");
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refreshToken");
  }

  /**
   * Store tokens and user data in localStorage
   */
  private storeTokens(accessToken: string, refreshToken: string, user?: any): void {
    if (typeof window === "undefined") return;
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    if (user) {
      localStorage.setItem("userRole", user.role);
      localStorage.setItem("userPermissions", JSON.stringify(user.permissions || []));
      localStorage.setItem("userData", JSON.stringify(user));
      localStorage.setItem("user", JSON.stringify(user)); // ensure dashboard reads up-to-date user
    }
  }

  /**
   * Clear tokens and user data from localStorage
   */
  private clearTokens(): void {
    if (typeof window === "undefined") return;
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userPermissions");
    localStorage.removeItem("userData");
    localStorage.removeItem("user");
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();
      if (!refreshToken) {
        throw new Error("No refresh token available");
      }

      const response = await fetch(`${this.baseUrl}/auth/refresh-token`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
        credentials: "include", // Important: send cookies
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.clearTokens();
          window.location.href = "/login";
        }
        throw new Error("Failed to refresh token");
      }

      const data = await response.json();
      if (data.accessToken) {
        localStorage.setItem("accessToken", data.accessToken);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);
      this.clearTokens();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
      return false;
    }
  }

  /**
   * Main fetch method with automatic token refresh
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = new Headers(options.headers || {});

    // Add authorization header if token exists
    const accessToken = this.getAccessToken();
    if (accessToken) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }

    // Set default content type only for non-FormData requests
    if (!headers.has("Content-Type") && options.body && !(options.body instanceof FormData)) {
      headers.set("Content-Type", "application/json");
    }

    let response = await fetch(url, {
      ...options,
      headers,
      credentials: "include", // Important: send cookies
      cache: "no-store", // Prevent caching
    });

    // If 401, try to refresh token and retry
    if (response.status === 401) {
      const newTokenObtained = await this.refreshAccessToken();

      if (newTokenObtained) {
        // Retry with new token
        const newAccessToken = this.getAccessToken();
        headers.set("Authorization", `Bearer ${newAccessToken}`);

        response = await fetch(url, {
          ...options,
          headers,
          credentials: "include",
        });
      } else {
        // Redirect to login
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
        throw new Error("Session expired. Please login again.");
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        message: response.statusText,
      }));
      throw new Error(error.message || "API request failed");
    }

    return response.json();
  }

  // GET
  async get<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "GET",
    });
  }

  // POST
  async post<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  // PUT
  async put<T = any>(
    endpoint: string,
    body?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    });
  }

  // DELETE
  async delete<T = any>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "DELETE",
    });
  }

  // Auth methods
  async login(email: string, password: string): Promise<any> {
    const response = await this.post("/auth/login", { email, password });
    if (response.accessToken && response.refreshToken) {
      this.storeTokens(response.accessToken, response.refreshToken, response.user);
    }
    return response;
  }

  async logout(): Promise<void> {
    try {
      await this.post("/auth/logout", {});
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  async signup(userData: any): Promise<any> {
    const response = await this.post("/auth/signup", userData);
    if (response.accessToken && response.refreshToken) {
      this.storeTokens(response.accessToken, response.refreshToken, response.user);
    }
    return response;
  }
}

export const apiClient = new ApiClient();
export default apiClient;
