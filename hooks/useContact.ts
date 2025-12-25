import { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

export const useContacts = () => {
  const { data: session } = useSession();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = async () => {
    if (!session?.accessToken) return;
    try {
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${session.accessToken}` },
      });
      setContacts(res.data.allContacts);
    } catch (err) {
      toast.error("Failed to load contacts");
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: { name: string; email: string; phoneNumber: string }) => {
    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contacts/add`, contactData, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      toast.success("Contact added!");
      fetchContacts();
    } catch (err) {
      toast.error("Error adding contact");
    }
  };

  const deleteContact = async (id: string) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${session?.accessToken}` },
      });
      toast.success("Contact removed");
      fetchContacts();
    } catch (err) {
      toast.error("Failed to delete");
    }
  };

  useEffect(() => { fetchContacts(); }, [session]);

  return { contacts, loading, addContact, deleteContact };
};