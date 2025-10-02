import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

// Lấy danh sách Dependencies
export const fetchDependencies = async (type, params) => {
  try {
    const endpoint =
      type === "url" ? "/url/dependencies" : "/config/dependencies";
    const response = await axios.post(`${API_URL}${endpoint}`, params);
    return response.data;
  } catch (error) {
    console.error("Error fetching dependencies:", error);
    throw error;
  }
};

// Crawl dữ liệu
export const crawlData = async (type, data) => {
  try {
    const endpoint = type === "url" ? "/url/crawl" : "/config/crawl";
    const response = await axios.post(`${API_URL}${endpoint}`, data);
    return response.data;
  } catch (error) {
    console.error("Error crawling data:", error);
    throw error;
  }
};

// Lấy thông tin chi tiết của Dependency
export const getDependencyDetails = async (type, name) => {
  try {
    const endpoint =
      type === "url" ? "/url/dependency/details" : "/config/dependency/details";
    const response = await axios.get(`${API_URL}${endpoint}`, {
      params: { name },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching dependency details:", error);
    throw error;
  }
};
