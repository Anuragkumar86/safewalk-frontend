"use client";

import { useState, useEffect } from "react";
import { useContacts } from "@/hooks/useContact";
import { Trash2, UserPlus, Phone, Mail, User, Lock, ArrowRight, X, ShieldAlert } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { MdEmail } from "react-icons/md";
import { Capacitor } from "@capacitor/core";
import { App } from "@capacitor/app";

export default function ContactsPage() {
  const { contacts = [], loading: contactsLoading, addContact, deleteContact } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phoneNumber: "" });

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

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;
    const backHandler = App.addListener('backButton', () => {
      router.replace('/dashboard');
    });
    return () => {
      backHandler.then(h => h.remove());
    };
  }, [router]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
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

  if (authLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="relative h-16 w-16">
          <div className="absolute inset-0 rounded-full border-2 border-zinc-800 border-t-rose-500 animate-spin"></div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div
        style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 68px)" }}
        className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-zinc-950 text-zinc-100"
      >
        <div className="w-24 h-24 bg-zinc-900 border border-zinc-800 rounded-[2.5rem] shadow-2xl flex items-center justify-center mb-8">
          <Lock className="text-rose-500" size={40} />
        </div>
        <h2 className="text-3xl font-bold mb-4 tracking-tight">Access Restricted</h2>
        <p className="text-zinc-500 max-w-xs mb-10 leading-relaxed">
          Your emergency contacts are encrypted. Please log in to manage your safety network.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="w-full max-w-xs flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-500 active:scale-95 transition-all text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
        >
          Login to Continue <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div
      style={{ paddingTop: "calc(env(safe-area-inset-top, 12px) + 85px)" }}
      className="min-h-screen bg-zinc-950 text-zinc-100 pb-24 px-5"
    >
      <div className="max-w-4xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500/10 rounded-lg">
                <ShieldAlert className="text-rose-500" size={20} />
              </div>
              <span className="text-rose-500 font-bold text-xs uppercase tracking-[0.2em]">Safety Network</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight">Guardians</h1>
            <p className="text-zinc-500 mt-2 font-medium">Trusted people to alert in emergencies.</p>
          </div>

          <button
            onClick={() => setShowForm((s) => !s)}
            className={`inline-flex justify-center items-center text-center gap-2 rounded-2xl px-6 py-4 shadow-lg transition-all font-bold active:scale-95 ${
              showForm ? "bg-zinc-800 text-zinc-300" : "bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/20"
            }`}
          >
            {showForm ? <X size={20} /> : <UserPlus size={20} />}
            <span>{showForm ? "Close Form" : "Add Emergency Contacts"}</span>
          </button>
        </header>

        {/* Add Contact Form Overlay/Section */}
        <div className={`transition-all duration-500 ease-in-out overflow-hidden ${showForm ? "max-h-[500px] mb-10 opacity-100" : "max-h-0 opacity-0"}`}>
          <form onSubmit={handleAdd} className="bg-zinc-900/50 backdrop-blur-xl border border-zinc-800 rounded-[2rem] p-6 shadow-2xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Full Name</label>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-rose-500/50 transition-colors">
                  <User size={18} className="text-zinc-600" />
                  <input
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="Guardian Name"
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium text-zinc-100 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Email Address</label>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-rose-500/50 transition-colors">
                  <Mail size={18} className="text-zinc-600" />
                  <input
                    type="email"
                    value={newContact.email}
                    onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                    placeholder="email@secure.com"
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium text-zinc-100 placeholder:text-zinc-700"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest ml-1">Phone Number</label>
                <div className="flex items-center gap-3 bg-zinc-950 border border-zinc-800 rounded-2xl px-4 py-3 focus-within:border-rose-500/50 transition-colors">
                  <Phone size={18} className="text-zinc-600" />
                  <input
                    value={newContact.phoneNumber}
                    onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                    placeholder="+1 234 567 890"
                    required
                    className="w-full bg-transparent outline-none text-sm font-medium text-zinc-100 placeholder:text-zinc-700"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-4">
               <button type="submit" disabled={creating} className="bg-zinc-100 text-zinc-950 px-10 py-3 rounded-xl font-bold shadow hover:bg-white transition disabled:opacity-50 active:scale-95">
                {creating ? "Saving..." : "Save Guardian"}
              </button>
            </div>
          </form>
        </div>

        {/* Contacts Grid */}
        <div className="space-y-4">
          {contactsLoading ? (
            <div className="py-20 text-center">
                <div className="animate-pulse text-zinc-600 font-bold tracking-widest uppercase text-xs">Synchronizing Network...</div>
            </div>
          ) : contacts.length === 0 ? (
            <div className="rounded-[2.5rem] border-2 border-dashed border-zinc-900 bg-zinc-900/20 p-12 text-center">
              <div className="bg-zinc-900 w-20 h-20 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-zinc-700 border border-zinc-800">
                <User size={32} />
              </div>
              <p className="text-xl font-bold text-zinc-300">No guardians added</p>
              <p className="text-sm text-zinc-500 mt-2 max-w-xs mx-auto">Add a trusted contact so we can notify them if you ever feel unsafe.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contacts.map((contact: any) => (
                <div
                  key={contact.id}
                  className="group flex items-center justify-between bg-zinc-900/40 hover:bg-zinc-900/80 backdrop-blur-md p-5 rounded-[2rem] border border-zinc-800/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-lg group-hover:scale-105 transition-transform">
                      {initials(contact.name)}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-bold text-yellow-400 truncate mb-1 group-hover:text-green-400 transition-colors">{contact.name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium">
                          <Phone size={12} className="text-zinc-300" /> <span className="text-zinc-200">{contact.phoneNumber}</span>
                        </div>
                        <div className="flex items-center gap-2 text-zinc-500 text-xs font-medium truncate">
                          <MdEmail size={12} className="text-zinc-300" /> <span className="truncate text-zinc-200">{contact.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => openDeleteConfirm(contact)}
                    className="w-12 h-12 flex-shrink-0 flex items-center justify-center text-zinc-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-2xl transition-all"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modern Deletion Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md" onClick={() => !deleting && setConfirmOpen(false)} />
          <div className="relative bg-zinc-900 border border-zinc-800 rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl">
            <div className="bg-rose-500/10 w-20 h-20 rounded-[2rem] flex items-center justify-center mb-6 text-rose-500 mx-auto border border-rose-500/20">
              <Trash2 size={32} />
            </div>
            <h3 className="text-2xl font-black text-zinc-100 text-center mb-3">Remove Guardian?</h3>
            <p className="text-zinc-500 text-sm text-center mb-8 leading-relaxed">
              This will remove <span className="font-bold text-zinc-200">{contactToDelete?.name}</span>. They will no longer receive emergency alerts.
            </p>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleConfirmDelete} 
                disabled={deleting} 
                className="w-full bg-rose-600 hover:bg-rose-500 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-900/20 active:scale-95 transition-all"
              >
                {deleting ? "Removing..." : "Yes, Remove Contact"}
              </button>
              <button 
                onClick={() => setConfirmOpen(false)} 
                className="w-full py-4 text-zinc-500 font-bold hover:text-zinc-300 transition-colors"
              >
                Keep Guardian
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}