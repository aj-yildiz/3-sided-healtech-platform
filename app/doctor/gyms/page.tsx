"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { createClientComponentClient } from "@/lib/supabase";

interface Gym { id: string; name: string; }
interface Request { gym_id: string; status: string; }

export default function DoctorGyms() {
  const [gyms, setGyms] = useState<Gym[]>([]);
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchGyms() {
      setLoading(true);
      setError(null);
      try {
        const supabase = createClientComponentClient();
        const { data: sessionData } = await supabase.auth.getSession();
        const user = sessionData.session?.user;
        if (!user) throw new Error("No user session");
        const { data: gymsData, error: gymsError } = await supabase.from("gyms").select("id, name");
        if (gymsError) throw gymsError;
        const { data: reqs, error: reqsError } = await supabase
          .from("practitioner_gym_requests")
          .select("gym_id, status")
          .eq("doctor_id", user.id);
        if (reqsError) throw reqsError;
        setGyms((gymsData as Gym[]) || []);
        setRequests((reqs as Request[]) || []);
        setLoading(false);
        console.log("Loaded gyms:", gymsData, "Loaded requests:", reqs);
      } catch (err: any) {
        setError(err.message || "Failed to load gyms");
        setLoading(false);
        console.error("Error loading gyms/requests:", err);
      }
    }
    fetchGyms();
  }, []);

  async function requestToJoin(gymId) {
    const supabase = createClientComponentClient();
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData.session?.user;
    if (!user) return;
    await supabase.from("practitioner_gym_requests").insert({
      doctor_id: user.id,
      gym_id: gymId,
      status: "pending",
    });
    setRequests([...requests, { gym_id: gymId, status: "pending" }]);
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">My Gyms</h1>
      {error && (
        <div className="text-red-500 text-center py-4">{error}</div>
      )}
      {loading && (
        <div className="text-center py-10">Loading gyms...</div>
      )}
      <div className="space-y-4">
        {gyms.map(gym => {
          const req = requests.find(r => r.gym_id === gym.id);
          return (
            <div key={gym.id} className="border p-4 rounded flex justify-between items-center">
              <div>{gym.name}</div>
              {req ? (
                <span className="text-sm text-gray-500">{req.status}</span>
              ) : (
                <Button onClick={() => requestToJoin(gym.id)}>Request to Join</Button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
} 