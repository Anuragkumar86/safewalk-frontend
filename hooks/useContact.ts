"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export const useContacts = () => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // 1. Grab token from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) {
      setToken(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchContacts = async () => {
    // Only fetch if we have a token
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) return;

    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/contacts`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      setContacts(res.data.allContacts || []);
    } catch (err) {
      console.error("Fetch contacts error:", err);
      // toast.error("Failed to load contacts"); // Keep quiet on initial load if preferred
    } finally {
      setLoading(false);
    }
  };

  const addContact = async (contactData: { name: string; email: string; phoneNumber: string }) => {
    const currentToken = token || localStorage.getItem("token");
    if (!currentToken) {
      toast.error("Session expired. Please login again.");
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/contacts/add`, contactData, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Contact added!");
      await fetchContacts(); // Refresh list
    } catch (err) {
      toast.error("Error adding contact");
    }
  };

  const deleteContact = async (id: string) => {
    const currentToken = token || localStorage.getItem("token");
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/contacts/${id}`, {
        headers: { Authorization: `Bearer ${currentToken}` },
      });
      toast.success("Contact removed");
      await fetchContacts(); // Refresh list
    } catch (err) {
      toast.error("Failed to delete contact");
    }
  };

  // Trigger fetch when token is set
  useEffect(() => {
    if (token) {
      fetchContacts();
    }
  }, [token]);

  return { contacts, loading, addContact, deleteContact, refreshContacts: fetchContacts };
};