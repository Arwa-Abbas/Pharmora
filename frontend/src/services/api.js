// services/api.js
const API_BASE_URL = "http://localhost:5000";

class ApiService {
  constructor() {
    this.baseUrl = API_BASE_URL;
  }

  async get(endpoint) {
    try {
      console.log(`🔵 GET Request to: ${this.baseUrl}${endpoint}`);
      const response = await fetch(`${this.baseUrl}${endpoint}`);
      
      console.log(`🔵 Response status:`, response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`🔴 GET Error:`, error);
        throw new Error(error.error || `API Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`🟢 GET Success:`, data);
      return data;
    } catch (error) {
      console.error(`🔴 GET Failed:`, error);
      throw error;
    }
  }

  async post(endpoint, data) {
    try {
      console.log(`🟡 POST Request to: ${this.baseUrl}${endpoint}`);
      console.log(`🟡 Request Data:`, data);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      console.log(`🟡 Response status:`, response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`🔴 POST Error:`, error);
        throw new Error(error.error || `API Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`🟢 POST Success:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`🔴 POST Failed:`, error);
      throw error;
    }
  }

  async put(endpoint, data) {
    try {
      console.log(`🟡 PUT Request to: ${this.baseUrl}${endpoint}`);
      console.log(`🟡 Request Data:`, data);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      console.log(`🟡 Response status:`, response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`🔴 PUT Error:`, error);
        throw new Error(error.error || `API Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`🟢 PUT Success:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`🔴 PUT Failed:`, error);
      throw error;
    }
  }

  async delete(endpoint) {
    try {
      console.log(`🔴 DELETE Request to: ${this.baseUrl}${endpoint}`);
      
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: "DELETE",
      });
      
      console.log(`🔴 Response status:`, response.status);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        console.error(`🔴 DELETE Error:`, error);
        throw new Error(error.error || `API Error: ${response.status}`);
      }
      
      const responseData = await response.json();
      console.log(`🟢 DELETE Success:`, responseData);
      return responseData;
    } catch (error) {
      console.error(`🔴 DELETE Failed:`, error);
      throw error;
    }
  }
}

export default new ApiService();