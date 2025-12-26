
import React, { useState } from 'react';
import { User, Role } from '../types';
import { Plus, Trash2, Edit, X, UserCheck, Shield, User as UserIcon, Lock } from 'lucide-react';

interface UserManagementProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
  t: any;
  isRtl: boolean;
}

const UserManagement: React.FC<UserManagementProps> = ({ users, setUsers, t, isRtl }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUser?.id) {
      setUsers(prev => prev.map(u => u.id === editingUser.id ? (editingUser as User) : u));
    } else {
      const newUser: User = {
        ...editingUser as User,
        id: Math.random().toString(36).substr(2, 9),
      };
      setUsers(prev => [...prev, newUser]);
    }
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const deleteUser = (id: string) => {
    if (users.length === 1) {
      alert("At least one user must remain in the system.");
      return;
    }
    if (confirm("Are you sure you want to delete this user?")) {
      setUsers(prev => prev.filter(u => u.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-800">{t.users}</h3>
          <p className="text-gray-500">Configure login access and system permissions.</p>
        </div>
        <button 
          onClick={() => { setEditingUser({ role: 'STAFF' }); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl transition-all shadow-md active:scale-95"
        >
          <Plus className="w-5 h-5" />
          <span>{t.addUser}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <div key={user.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-xl ${user.role === 'ADMIN' ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-50 text-gray-600'}`}>
                {user.role === 'ADMIN' ? <Shield className="w-8 h-8" /> : <UserIcon className="w-8 h-8" />}
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditingUser(user); setIsModalOpen(true); }} className="p-2 text-gray-400 hover:text-blue-600 rounded-lg">
                  <Edit className="w-4 h-4" />
                </button>
                <button onClick={() => deleteUser(user.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-lg">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-gray-900">{user.name}</h4>
              <p className="text-sm text-gray-500 font-mono">@{user.username}</p>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-50 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{t.role}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${user.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-400">{t.pin}</span>
                <div className="flex items-center gap-1 font-mono text-gray-900 font-bold">
                  <Lock className="w-3 h-3 opacity-30" />
                  ****
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
              <h3 className="text-xl font-bold">{editingUser?.id ? 'Update User' : t.addUser}</h3>
              <button onClick={() => setIsModalOpen(false)}><X className="w-6 h-6" /></button>
            </div>
            <form onSubmit={handleSaveUser} className="p-8 space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t.name}</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingUser?.name || ''}
                  onChange={(e) => setEditingUser(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-gray-700">{t.username}</label>
                <input 
                  type="text" 
                  required 
                  className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={editingUser?.username || ''}
                  onChange={(e) => setEditingUser(p => ({ ...p, username: e.target.value.toLowerCase() }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t.role}</label>
                  <select 
                    className="w-full p-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                    value={editingUser?.role}
                    onChange={(e) => setEditingUser(p => ({ ...p, role: e.target.value as Role }))}
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="STAFF">STAFF</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">{t.pin}</label>
                  <input 
                    type="password" 
                    maxLength={4}
                    required 
                    className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-center font-mono tracking-widest"
                    value={editingUser?.pin || ''}
                    onChange={(e) => setEditingUser(p => ({ ...p, pin: e.target.value }))}
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all">{t.cancel}</button>
                <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg">{t.save}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
