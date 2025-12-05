"use client";

import { useEffect, useState } from "react";
import { InvoiceModal } from "@/components/invoice/InvoiceModal";
import axios from "axios";
// import InvoiceModal from "@/components/invoice/InvoiceModal";

export default function InvoicePage({ params }: any) {
  const { id } = params;

  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    axios
      .get(`/api/payment/${id}`, { withCredentials: true })
      .then((res) => setData(res.data.data))
      .catch(() => setError(true));
  }, [id]);

  if (error)
    return (
      <p className="text-center mt-10 text-red-600">Failed to load invoice</p>
    );

  if (!data)
    return (
      <div className="flex  w-full min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-300 border-t-black" />
          <p className="text-sm text-gray-600">Loading invoice...</p>
        </div>
      </div>
    );

  return <InvoiceModal data={data} onClose={() => {}} />;
}
