"use client";
import { useState, useEffect } from "react"; // Added useEffect
import { useContacts } from "@/hooks/useContact";
import { Trash2, UserPlus, Phone, Mail, User, X, Check, Lock, ArrowRight } from "lucide-react";
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

  // REPLACE useSession: Check localStorage on mount
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
      await addContact(newContact);
      toast.success("Contact added");
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
      <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center">
        <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-400">
          <Lock size={40} />
        </div>
        <h2 className="text-3xl font-black text-slate-800 mb-4">Private Contacts</h2>
        <p className="text-slate-500 max-w-sm mb-8 font-medium">
          Your emergency contacts are encrypted and private. Please log in to manage your safety network.
        </p>
        <button
          onClick={() => router.push("/login")}
          className="flex items-center gap-2 bg-rose-600 text-white px-10 py-4 rounded-2xl font-bold hover:bg-rose-700 transition-all shadow-lg shadow-rose-200"
        >
          Login to View <ArrowRight size={20} />
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 mb-20 pt-15">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8 pt-15">
        <div>
          <h1 className="text-3xl font-black text-slate-900">Emergency Contacts</h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Add trusted guardians who will be alerted in an emergency.
          </p>
        </div>

        <button
          onClick={() => setShowForm((s) => !s)}
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 shadow-lg shadow-rose-100 transition font-bold"
        >
          <UserPlus size={18} />
          <span>Add Guardian</span>
        </button>
      </div>

      {/* Add form - Mobile Optimized */}
      <div className={`transition-all duration-300 ${showForm ? "block" : "hidden"}`}>
        <form onSubmit={handleAdd} className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Full name</span>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-rose-200">
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

            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Email</span>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-rose-200">
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

            <div className="flex flex-col">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone number</span>
              <div className="flex items-center gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-4 py-3 focus-within:ring-2 focus-within:ring-rose-200">
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

          <div className="mt-6 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-bold shadow-lg hover:bg-black transition disabled:opacity-50"
            >
              {creating ? "Saving..." : "Save Contact"}
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-slate-500 font-bold px-6 py-3 hover:bg-slate-50 rounded-2xl transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Contacts List */}
      <div className="space-y-4">
        {contactsLoading ? (
          <div className="py-20 text-center text-slate-400 font-medium">Loading your guardians...</div>
        ) : contacts.length === 0 ? (
          <div className="rounded-[2.5rem] border-2 border-dashed border-slate-100 p-12 text-center">
            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <User size={30} />
            </div>
            <p className="text-slate-500 font-bold">No guardians added yet</p>
            <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Add someone you trust to keep you safe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="flex items-center justify-between bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black text-lg">
                    {initials(contact.name)}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">{contact.name}</h3>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      <span className="flex items-center gap-1"><Phone size={12}/> {contact.phoneNumber}</span>
                      
                    </div>
                    <div className="flex items-center gap-3 text-xs text-slate-400 font-bold mt-1 uppercase tracking-tighter">
                      
                      <span className="flex items-center gap-1"><MdEmail size={12}/> {(contact.email)}</span>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => openDeleteConfirm(contact)}
                  className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Modal - Mobile Friendly */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => !deleting && setConfirmOpen(false)} />
          <div className="relative bg-white rounded-[2.5rem] w-full max-w-sm p-8 shadow-2xl animate-in slide-in-from-bottom-10">
            <div className="bg-rose-50 w-16 h-16 rounded-3xl flex items-center justify-center mb-6 text-rose-600">
              <Trash2 size={28} />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">Remove Guardian?</h3>
            <p className="text-slate-500 text-sm font-medium mb-8">
              This will remove <span className="text-slate-900 font-bold">{contactToDelete?.name}</span> from your safety network.
            </p>
            <div className="flex flex-col gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="w-full bg-rose-600 text-white py-4 rounded-2xl font-bold shadow-lg shadow-rose-100 disabled:opacity-50"
              >
                {deleting ? "Removing..." : "Yes, Remove"}
              </button>
              <button
                onClick={() => setConfirmOpen(false)}
                className="w-full py-4 text-slate-400 font-bold"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}