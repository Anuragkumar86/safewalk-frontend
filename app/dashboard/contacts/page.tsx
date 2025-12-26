"use client";

import { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContact";
import { Trash2, UserPlus, Phone, Mail, User, Lock, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MdEmail } from "react-icons/md";

export default function ContactsPage() {
  const { contacts = [], loading: contactsLoading, addContact, deleteContact } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phoneNumber: "" });

  // Authentication State
  const [user, setUser] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setAuthLoading(false);
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // Keep hook logic same — hook likely shows toast; do not double show
      await addContact(newContact);
      setShowForm(false);
      setNewContact({ name: "", email: "", phoneNumber: "" });
    } catch (err: any) {
      toast.error(err?.message || "Failed to add contact");
    } finally {
      setCreating(false);
    }
  };

  const openDeleteConfirm = (contact: any) => {
    setContactToDelete(contact);
    setConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!contactToDelete) return;
    setDeleting(true);
    try {
      await deleteContact(contactToDelete.id);
      // keep one toast for deletion
      toast.success("Contact removed");
    } catch (err: any) {
      toast.error(err?.message || "Failed to delete contact");
    } finally {
      setDeleting(false);
      setConfirmOpen(false);
      setContactToDelete(null);
    }
  };

  const initials = (name = "") => {
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "U";
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[1][0]).toUpperCase();
  };

  // 1. Loading State
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  // 2. Access Denied (Not Logged In)
  if (!user) {
    return (
      <div
        // safe area + nav offset
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
        className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center"
      >
        <div className="w-24 h-24 bg-slate-100 rounded-xl flex items-center justify-center mb-6 text-slate-400">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-extrabold text-slate-800 mb-4">Private Contacts</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">
          Your emergency contacts are encrypted and private. Please log in to manage your safety network.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 bg-rose-600 text-white px-10 py-3 rounded-2xl font-bold hover:bg-rose-700 shadow-md transition"
        >
          Login to View <ArrowRight size={18} />
        </button>
      </div>
    );
  }

  return (
    <div
      // safe area + nav offset
      style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
      className="max-w-5xl mx-auto p-4 md:p-6 mb-20"
    >
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">Emergency Contacts</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">Add trusted guardians who will be alerted in an emergency.</p>
        </div>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center gap-2 rounded-full bg-rose-600 hover:bg-rose-700 text-white px-5 py-3 shadow-md transition font-bold"
        >
          <UserPlus size={18} />
          <span>Add Guardian</span>
        </button>
      </div>

      {/* Add form */}
      <div className={`transition-all duration-300 ${showForm ? "block" : "hidden"}`}>
        <form onSubmit={handleAdd} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Full name</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <User size={18} className="text-slate-400" />
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                  className="w-full bg-transparent outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Email</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <Mail size={18} className="text-slate-400" />
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="jane@example.com"
                  required
                  className="w-full bg-transparent outline-none text-sm font-medium"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 block">Phone</label>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                <Phone size={18} className="text-slate-400" />
                <input
                  value={newContact.phoneNumber}
                  onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                  placeholder="+1 555 000 0000"
                  required
                  className="w-full bg-transparent outline-none text-sm font-medium"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button type="submit" disabled={creating} className="bg-slate-900 text-white px-6 py-2 rounded-full font-bold shadow hover:bg-black transition disabled:opacity-50">
              {creating ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-slate-500 font-bold px-4 py-2 rounded-full hover:bg-slate-50 transition">
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {contactsLoading ? (
          <div className="py-12 text-center text-slate-400 font-medium">Loading your guardians...</div>
        ) : contacts.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-slate-100 p-8 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <User size={30} />
            </div>
            <p className="text-slate-500 font-bold">No guardians added yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">Add someone you trust to keep you safe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-50 shadow-sm hover:shadow-md transition"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-50 to-rose-100 text-rose-600 flex items-center justify-center font-extrabold text-lg flex-shrink-0">
                    {initials(contact.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-800 truncate">{contact.name}</h3>
                    <div className="flex flex-col text-xs text-slate-500 mt-1">
                      <div className="flex items-center gap-2 truncate">
                        <Phone size={12} /> <span className="truncate">{contact.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 truncate mt-1">
                        <MdEmail size={12} /> <span className="truncate">{contact.email}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => openDeleteConfirm(contact)}
                  className="w-10 h-10 flex-shrink-0 ml-3 flex items-center justify-center text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                  aria-label={`Delete ${contact.name}`}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !deleting && setConfirmOpen(false)} />
          <div className="relative bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <div className="bg-rose-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-rose-600 mx-auto">
              <Trash2 size={26} />
            </div>
            <h3 className="text-xl font-extrabold text-slate-900 text-center mb-2">Remove Guardian?</h3>
            <p className="text-slate-500 text-sm text-center mb-6">This will remove <span className="font-bold text-slate-800">{contactToDelete?.name}</span> from your safety network.</p>

            <div className="flex flex-col gap-3">
              <button onClick={handleConfirmDelete} disabled={deleting} className="w-full bg-rose-600 text-white py-3 rounded-lg font-bold shadow">
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>
              <button onClick={() => setConfirmOpen(false)} className="w-full py-3 text-slate-500 font-bold rounded-lg">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}