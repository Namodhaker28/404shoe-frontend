import Cookies from "js-cookie";
import { API_URL, STRAPI_API_TOKEN } from "./config";
import axios from "axios";

// const at =Cookies.get("404Token")
export const fetchDataFromApi = async (endpoint) => {
  try {
    const options = {
      method: "GET",
      headers: {
        // ccontentType: "application/json",
        authorization: "Bearer " + Cookies.get("404Token"),
      },
    };

    const res = await axios(`${API_URL}${endpoint}`, options);

    return res?.data;
  } catch (error) {
    console.log("error", error);
   
  }
};

export const updateDataFromApi = async (endpoint, body) => {
  try {
    const options = {
      method: "PUT",
      headers: {
        contentType: "application/json",
        authorization: "Bearer " + Cookies.get("404Token"),
      },
      data: body,
    };
    const res = await axios(`${API_URL}${endpoint}`, options);
    return res?.data;
  } catch (error) {
   
  }
};

export const addDataFromApi = async (endpoint, body) => {
  const options = {
    method: "POST",
    headers: {
      ccontentType: "application/json",
      authorization: "Bearer " + Cookies.get("404Token"),
    },
    data: body,
  };

  try {
    const res = await axios(`${API_URL}${endpoint}`, options);
    return res?.data;
  } catch (error) {
   
    return error?.response?.data;
  }
};

/**
 * Delete data from API
 * @param {string} endpoint - API endpoint
 * @returns {Promise} - Response data
 */
export const deleteDataFromApi = async (endpoint) => {
  try {
    const options = {
      method: "DELETE",
      headers: {
        contentType: "application/json",
        authorization: "Bearer " + Cookies.get("404Token"),
      },
    };
    const res = await axios(`${API_URL}${endpoint}`, options);
    return res?.data;
  } catch (error) {
    console.log("error", error);
    return error?.response?.data;
  }
};

// export const makePaymentRequest = async (endpoint, payload) => {
//     const res = await fetch(`${API_URL}${endpoint}`, {
//         method: "POST",
//         headers: {
//             Authorization: "Bearer " + STRAPI_API_TOKEN,
//             "Content-Type": "application/json",
//         },
//         body: JSON.stringify(payload),
//     });
//     const data = await res.json();
//     return data;
// };
