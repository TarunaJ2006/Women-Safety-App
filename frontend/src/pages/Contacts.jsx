import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui-card';
import { UserPlus, Trash2, User, Phone, Mail, Users } from 'lucide-react';
import api from '@/services/api';

export default function Contacts() {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', phone_number: '', email: '', is_active: true });
  const [loading, setLoading] = useState(false);

  const fetchContacts = async () => {
    try {
      const res = await api.get('/contacts/');
      setContacts(res.data);
    } catch (e) {
      console.error("Failed to fetch contacts", e);
    }
  };

  useEffect(() => {
    fetchContacts();
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/contacts/', newContact);
      setNewContact({ name: '', phone_number: '', email: '', is_active: true });
      fetchContacts();
    } catch (e) {
      console.error("Failed to add contact", e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/contacts/${id}`);
      fetchContacts();
    } catch (e) {
      console.error("Failed to delete contact", e);
    }
  };

  return (
    <div className="space-y-8 text-white">
      <header>
        <h1 className="text-3xl font-bold tracking-tight">Emergency Contacts</h1>
        <p className="text-zinc-400 mt-1">Manage who gets notified in case of a high-threat event.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-1 h-fit bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <UserPlus className="h-5 w-5 text-rose-500" />
              Add New Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Full Name</label>
                <input
                  required
                  type="text"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  placeholder="Jane Doe"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Phone Number</label>
                <input
                  required
                  type="tel"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase">Email (Optional)</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  className="w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-rose-500/50"
                  placeholder="jane@example.com"
                />
              </div>
              <button
                disabled={loading}
                type="submit"
                className="w-full bg-rose-500 hover:bg-rose-600 text-white font-bold py-2 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? 'Adding...' : 'Add Contact'}
              </button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {contacts.length === 0 ? (
            <div className="text-center py-20 bg-zinc-900/30 rounded-xl border border-dashed border-zinc-800">
               <Users className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
               <p className="text-zinc-500">No emergency contacts added yet.</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <Card key={contact.id} className="group hover:border-zinc-700 transition-colors bg-zinc-900 border-zinc-800">
                <CardContent className="flex items-center justify-between py-6">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-zinc-800 flex items-center justify-center text-rose-500">
                       <User className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{contact.name}</h3>
                      <div className="flex items-center gap-4 mt-1">
                        <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                          <Phone className="h-3 w-3" /> {contact.phone}
                        </span>
                        {contact.email && (
                          <span className="flex items-center gap-1.5 text-sm text-zinc-400">
                            <Mail className="h-3 w-3" /> {contact.email}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(contact.id)}
                    className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-rose-500/10 rounded-full transition-all"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
