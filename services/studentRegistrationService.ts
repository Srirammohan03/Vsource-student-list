import axios from "axios";

export const studentRegistrationService = {
  create: (data: any) =>
    axios.post("/api/student-registration", data, {
      withCredentials: true,
    }),

  list: () =>
    axios.get("/api/student-registration", {
      withCredentials: true,
    }),

  getById: (id: string) =>
    axios.get(`/api/student-registration/${id}`, {
      withCredentials: true,
    }),

  update: (id: string, data: any) =>
    axios.put(`/api/student-registration/${id}`, data, {
      withCredentials: true,
    }),

  delete: (id: string) =>
    axios.delete(`/api/student-registration/${id}`, {
      withCredentials: true,
    }),
};
