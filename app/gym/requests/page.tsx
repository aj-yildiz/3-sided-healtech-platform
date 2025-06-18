"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@/lib/supabase";

export default function GymRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchRequests() {
      setLoading(true);
      setError("");
      const supabase = createClientComponentClient();
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;
      if (!user) return;
      const { data, error } = await supabase
        .from("practitioner_gym_requests")
        .select("id, doctor_id, status, doctors(name)")
        .eq("gym_id", user.id)
        .eq("status", "pending");
      if (error) setError(error.message);
      setRequests(data || []);
      setLoading(false);
    }
    fetchRequests();
  }, []);

  async function handleApprove(id) {
    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("practitioner_gym_requests")
      .update({ status: "approved", approved_at: new Date().toISOString() })
      .eq("id", id);
    if (error) setError(error.message);
    else setSuccess("Request approved!");
    setRequests(requests.filter(r => r.id !== id));
    setLoading(false);
  }

  async function handleDeny(id) {
    setLoading(true);
    setError("");
    setSuccess("");
    const supabase = createClientComponentClient();
    const { error } = await supabase
      .from("practitioner_gym_requests")
      .update({ status: "denied" })
      .eq("id", id);
    if (error) setError(error.message);
    else setSuccess("Request denied.");
    setRequests(requests.filter(r => r.id !== id));
    setLoading(false);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Practitioner Requests</h1>
      {error && <div className="text-red-500 mb-2">{error}</div>}
      {success && <div className="text-green-600 mb-2">{success}</div>}
      {loading && <div>Loading...</div>}
      {requests.length === 0 && !loading && <div>No pending requests.</div>}
      {requests.map(req => (
        <div key={req.id} className="border p-4 mb-2 rounded flex justify-between items-center">
          <div>
            <div className="font-semibold">{req.doctors?.name || req.doctor_id}</div>
            <div className="text-sm text-gray-500">Status: {req.status}</div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => handleApprove(req.id)} variant="success">Approve</Button>
            <Button onClick={() => handleDeny(req.id)} variant="destructive">Deny</Button>
          </div>
        </div>
      ))}
    </div>
  );
} 