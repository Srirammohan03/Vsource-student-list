import axios from "axios";

export const paymentService = {
  list: () =>
    axios
      .get("/api/payments", {
        withCredentials: true,
      })
      .then((res) => res.data.data),
  getById: (id: string) =>
    axios
      .get(`/api/payments/${id}`, {
        withCredentials: true,
      })
      .then((res) => res.data.data),
  create: (data: any) =>
    axios
      .post("/api/payments", data, {
        withCredentials: true,
      })
      .then((res) => res.data.data),
  update: (id: string, data: any) =>
    axios
      .put(`/api/payments/${id}`, data, {
        withCredentials: true,
      })
      .then((res) => res.data.data),
  delete: (id: string) =>
    axios
      .delete(`/api/payments/${id}`, {
        withCredentials: true,
      })
      .then((res) => res.data.data),
};
