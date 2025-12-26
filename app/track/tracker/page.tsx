
"use client";


import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import axios from "axios";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import { AlertCircle, MapPin, Phone, ExternalLink } from "lucide-react";
import L from 'leaflet';

// Dynamically import the Map to prevent SSR errors
const MapContainer = dynamic(() => import("react-leaflet").then((mod) => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then((mod) => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then((mod) => mod.Marker), { ssr: false });

export default function PublicTracker() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id"); // Get id from URL query string
  
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!id) return; // Wait until ID is available

    const fetchData = async () => {
      try {
        const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/walk/public/${id}`);
        setData(res.data);
      } catch (err) {
        console.error("Link invalid");
      }
    };
    
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [id]);


// Inside useEffect
useEffect(() => {
    // Fix leaflet marker icon issue
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
}, []);

  if (!data) return <div className="p-10 text-center">Locating signal...</div>;

  const position: [number, number] = [data.lastKnownLat || 0, data.lastKnownLng || 0];

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Emergency Header */}
      <div className="bg-rose-600 p-6 text-white shadow-lg">
        <div className="max-w-xl mx-auto flex items-center gap-4">
          <div className="bg-white/20 p-3 rounded-full animate-pulse">
            <AlertCircle size={30} />
          </div>
          <div>
            <h1 className="text-xl font-black uppercase tracking-wider">Emergency Alert</h1>
            <p className="text-rose-100 text-sm">Last known location for <b>{data.user.name}</b></p>
          </div>
        </div>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4">
        {/* The Map Component */}
        <div className="h-[400px] w-full bg-gray-200 rounded-[2.5rem] overflow-hidden shadow-inner border-4 border-white relative z-10">
          {typeof window !== "undefined" && (
            <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={position} />
            </MapContainer>
          )}
        </div>

        {/* Action Info */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
           <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Status</span>
              <span className="bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold">
                {data.status}
              </span>
           </div>
           
           <div className="flex items-center gap-3 text-gray-700 font-medium mb-6">
              <MapPin className="text-rose-600" />
              <span>{data.lastKnownLat.toFixed(4)}, {data.lastKnownLng.toFixed(4)}</span>
           </div>

           <div className="grid grid-cols-2 gap-3">
              <a 
                href={`https://www.google.com/maps?q=${data.lastKnownLat},${data.lastKnownLng}`}
                target="_blank"
                className="flex items-center justify-center gap-2 bg-blue-600 text-white py-4 rounded-2xl font-bold text-sm shadow-md"
              >
                <ExternalLink size={18} /> Directions
              </a>
              <button className="flex items-center justify-center gap-2 bg-gray-900 text-white py-4 rounded-2xl font-bold text-sm shadow-md">
                <Phone size={18} /> Call Police
              </button>
           </div>
        </div>
      </div>
    </div>
  );
}