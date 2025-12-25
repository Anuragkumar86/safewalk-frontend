"use client";
import { useState } from "react";
import { useContacts } from "@/hooks/useContact";
import { Trash2, UserPlus, Phone, Mail, User, X, Check } from "lucide-react";
import toast from "react-hot-toast";

export default function ContactsPage() {
  const { contacts = [], loading, addContact, deleteContact } = useContacts();
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newContact, setNewContact] = useState({ name: "", email: "", phoneNumber: "" });

  // For delete confirmation
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      // assuming addContact can be async
      await addContact(newContact);
      toast.success("Contact added");
      setShowForm(false);
      setNewContact({ name: "", email: "", phoneNumber: "" });
    } catch (err: any) {
      console.error(err);
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
      console.error(err);
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

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 py-13">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-800">Emergency Contacts</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add trusted guardians who will be alerted in case of an emergency.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowForm((s) => !s)}
            className="inline-flex items-center gap-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 shadow-md transition"
            aria-expanded={showForm}
          >
            <UserPlus className="w-4 h-4" />
            <span className="font-medium">Add Guardian</span>
          </button>
        </div>
      </div>

      {/* Add form */}
      <div
        className={`transform transition-all duration-300 ${
          showForm ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2 pointer-events-none"
        }`}
      >
        <form
          onSubmit={handleAdd}
          className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm mb-6"
          aria-hidden={!showForm}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 mb-1">Full name</span>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-300">
                <User className="w-4 h-4 text-gray-400" />
                <input
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Jane Doe"
                  required
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>

            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 mb-1">Email</span>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-300">
                <Mail className="w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="jane@example.com"
                  required
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>

            <label className="flex flex-col">
              <span className="text-xs font-medium text-gray-600 mb-1">Phone number</span>
              <div className="flex items-center gap-2 border rounded-lg px-3 py-2 focus-within:ring-2 focus-within:ring-rose-300">
                <Phone className="w-4 h-4 text-gray-400" />
                <input
                  value={newContact.phoneNumber}
                  onChange={(e) => setNewContact({ ...newContact, phoneNumber: e.target.value })}
                  placeholder="+1 555 555 5555"
                  required
                  className="w-full outline-none text-sm"
                />
              </div>
            </label>
          </div>

          <div className="mt-4 flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="inline-flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg shadow hover:bg-black transition disabled:opacity-60"
            >
              {creating ? "Saving..." : "Save Contact"}
            </button>

            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setNewContact({ name: "", email: "", phoneNumber: "" });
              }}
              className="inline-flex items-center gap-2 border px-4 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>

      {/* Contacts grid */}
      <div>
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <svg
              className="animate-spin h-8 w-8 text-rose-600"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
          </div>
        ) : contacts.length === 0 ? (
          <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center text-gray-500">
            <User className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No guardians added yet.</p>
            <p className="text-xs mt-2">Add someone you trust so they can be notified in emergencies.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {contacts.map((contact: any) => (
              <div
                key={contact.id}
                className="flex items-center justify-between bg-white p-4 rounded-2xl shadow-sm border border-gray-50 hover:shadow-md transition"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center font-semibold text-sm">
                    {initials(contact.name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 font-semibold text-gray-800">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{contact.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{contact.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{contact.phoneNumber}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openDeleteConfirm(contact)}
                    className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition"
                    aria-label={`Delete ${contact.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirmOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" onClick={() => !deleting && setConfirmOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 z-10">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 bg-rose-50 rounded-full p-3">
                <Trash2 className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 id="confirm-title" className="text-lg font-semibold text-gray-800">
                  Delete guardian
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  Are you sure you want to remove{" "}
                  <span className="font-medium text-gray-700">{contactToDelete?.name}</span> from your guardians?
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  if (!deleting) {
                    setConfirmOpen(false);
                    setContactToDelete(null);
                  }
                }}
                className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition"
                disabled={deleting}
              >
                <X className="w-4 h-4" />
                Cancel
              </button>

              <button
                onClick={handleConfirmDelete}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 text-white rounded-lg text-sm hover:bg-rose-700 transition disabled:opacity-60"
                disabled={deleting}
              >
                {deleting ? (
                  <>
                    <svg
                      className="animate-spin h-4 w-4"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}