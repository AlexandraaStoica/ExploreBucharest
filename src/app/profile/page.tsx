"use client";
import { useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import jsPDF from "jspdf";
import QRCode from "qrcode";

interface Ticket {
  id: string;
  eventId: string;
  quantity: number;
  event: {
    id: string;
    title: string;
    startDatetime: string;
    endDatetime: string;
    imageUrl: string | null;
  };
}

export default function ProfilePage() {
  const { user, isSignedIn, isLoaded } = useUser();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTickets() {
      setLoadingTickets(true);
      try {
        const res = await fetch("/api/tickets");
        if (res.ok) {
          const data = await res.json();
          setTickets(data);
        } else {
          setTickets([]);
        }
      } catch {
        setTickets([]);
      } finally {
        setLoadingTickets(false);
      }
    }
    if (isSignedIn) fetchTickets();
  }, [isSignedIn]);

  async function handleDownloadPDF(ticket: Ticket) {
    setDownloading(ticket.id);
    try {
      const doc = new jsPDF();
      const eventDate = new Date(ticket.event.startDatetime).toLocaleDateString();
      const userName = user?.fullName || user?.username || "User";
      // Ticket info
      doc.setFontSize(18);
      doc.text("Event Ticket", 20, 20);
      doc.setFontSize(14);
      doc.text(`Event: ${ticket.event.title}`, 20, 40);
      doc.text(`Date: ${eventDate}`, 20, 50);
      doc.text(`Name: ${userName}`, 20, 60);
      doc.text(`Ticket ID: ${ticket.id}`, 20, 70);
      // QR code data
      const qrData = JSON.stringify({ ticketId: ticket.id, user: userName });
      const qrUrl = await QRCode.toDataURL(qrData, { width: 128, margin: 1 });
      doc.addImage(qrUrl, "PNG", 20, 80, 50, 50);
      doc.save(`${ticket.event.title.replace(/[^a-z0-9]/gi, "_")}_ticket.pdf`);
    } catch (err) {
      alert("Failed to generate PDF");
    } finally {
      setDownloading(null);
    }
  }

  if (!isLoaded) return <div className="min-h-screen flex items-center justify-center text-burgundy text-xl">Loading...</div>;
  if (!isSignedIn) return <div className="min-h-screen flex items-center justify-center text-burgundy text-xl">You must be signed in to view your profile.</div>;

  return (
    <div className="min-h-screen bg-cream px-6 py-12">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8 flex flex-col items-center mb-12">
        <img
          src={user.imageUrl}
          alt={user.fullName || user.username || "User"}
          className="w-32 h-32 rounded-full object-cover mb-6 border-4 border-burgundy"
        />
        <h1 className="text-3xl font-bold text-burgundy font-display mb-2">{user.fullName || user.username}</h1>
        <p className="text-lg text-gray-700 mb-1">{user.primaryEmailAddress?.emailAddress}</p>
        <p className="text-gray-500 mb-6">Member since {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "-"}</p>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow p-8">
        <h2 className="text-2xl font-bold text-burgundy font-display mb-6">My Tickets</h2>
        {loadingTickets ? (
          <div className="text-burgundy text-lg">Loading tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="text-burgundy/70">You have not purchased any tickets yet.</div>
        ) : (
          <ul className="space-y-6">
            {tickets.map(ticket => (
              <li key={ticket.id} className="flex items-center gap-4 bg-cream rounded-lg p-4">
                {ticket.event.imageUrl && (
                  <img src={ticket.event.imageUrl} alt={ticket.event.title} className="w-24 h-24 object-cover rounded-lg" />
                )}
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-burgundy mb-1">{ticket.event.title}</h3>
                  <div className="text-gray-700 mb-1">
                    <span className="font-semibold">Date:</span> {new Date(ticket.event.startDatetime).toLocaleDateString()}
                  </div>
                  <div className="text-gray-700 mb-1">
                    <span className="font-semibold">Quantity:</span> {ticket.quantity}
                  </div>
                </div>
                <button
                  className="bg-burgundy text-white px-4 py-2 rounded font-semibold"
                  onClick={() => handleDownloadPDF(ticket)}
                  disabled={downloading === ticket.id}
                >
                  {downloading === ticket.id ? "Generating..." : "Download PDF"}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
} 