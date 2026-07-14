/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { X, Calendar, User, Home, MapPin, Mail, AlignLeft } from 'lucide-react';
import { Project } from '../types';

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (projectData: {
    name: string;
    street: string;
    zipCity: string;
    email: string;
    date: string;
    description: string;
  }) => void;
  project?: Project | null; // If provided, we are editing
}

export const ProjectDetailsModal: React.FC<ProjectDetailsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  project,
}) => {
  const [name, setName] = useState('');
  const [street, setStreet] = useState('');
  const [zipCity, setZipCity] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');

  // Update form values if editing a project
  useEffect(() => {
    if (project) {
      setName(project.name);
      setStreet(project.street || '');
      setZipCity(project.zipCity || '');
      setEmail(project.email || '');
      setDate(project.date);
      setDescription(project.description);
    } else {
      // Defaults for new project
      setName('');
      setStreet('');
      setZipCity('');
      setEmail('');
      setDate(new Date().toISOString().split('T')[0]);
      setDescription('');
    }
  }, [project, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      name: name.trim(),
      street: street.trim(),
      zipCity: zipCity.trim(),
      email: email.trim(),
      date,
      description: description.trim(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#141414]/40 backdrop-blur-xs animate-fade-in" id="project-modal">
      <div className="bg-white w-full max-w-md rounded-3xl border border-[#141414]/5 shadow-xl flex flex-col overflow-hidden animate-slide-up">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 bg-gray-50 border-b border-[#141414]/5">
          <h3 className="font-bold text-[#141414] text-base font-sans">
            {project ? 'Projekt bearbeiten' : 'Neues Projekt anlegen'}
          </h3>
          <button
            id="btn-close-project-modal"
            onClick={onClose}
            className="p-1.5 hover:bg-gray-200 rounded-lg text-[#141414]/40 hover:text-[#141414]/80 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex-1 space-y-5">
          {/* Customer Name */}
          <div>
            <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
              <User className="w-3.5 h-3.5 text-brand-accent1" /> Name
            </label>
            <input
              id="input-project-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="z. B. Max Müller"
              className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all font-sans"
            />
          </div>

          {/* Street */}
          <div>
            <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
              <Home className="w-3.5 h-3.5 text-brand-accent1" /> Straße
            </label>
            <input
              id="input-project-street"
              type="text"
              required
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              placeholder="z. B. Musterstraße 12"
              className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all font-sans"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* ZIP / City */}
            <div>
              <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                <MapPin className="w-3.5 h-3.5 text-brand-accent1" /> PLZ / Ort
              </label>
              <input
                id="input-project-zipcity"
                type="text"
                required
                value={zipCity}
                onChange={(e) => setZipCity(e.target.value)}
                placeholder="z. B. 12345 Musterstadt"
                className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all font-sans"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                <Mail className="w-3.5 h-3.5 text-brand-accent1" /> E-Mail
              </label>
              <input
                id="input-project-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="z. B. max.mueller@example.com"
                className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all font-sans"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Date */}
            <div>
              <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
                <Calendar className="w-3.5 h-3.5 text-brand-accent1" /> Datum
              </label>
              <input
                id="input-project-date"
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[11px] font-bold text-[#141414]/60 uppercase tracking-wider mb-2 flex items-center gap-1.5 font-sans">
              <AlignLeft className="w-3.5 h-3.5 text-brand-accent1" /> Kurzbeschreibung (optional)
            </label>
            <textarea
              id="input-project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="z. B. Renovierungsarbeiten Erdgeschoss, Spachtelarbeiten und Vliestapezierung"
              className="w-full p-3 bg-gray-100 rounded-xl border-none text-sm font-sans focus:outline-none focus:ring-2 focus:ring-brand-accent1/20 transition-all resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-2.5 text-sm pt-4 border-t border-[#141414]/5">
            <button
              id="btn-project-modal-cancel"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-200 text-gray-750 font-bold rounded-xl cursor-pointer hover:bg-gray-300 transition-colors"
            >
              Abbrechen
            </button>
            <button
              id="btn-project-modal-save"
              type="submit"
              className="px-5 py-2.5 bg-brand-accent2 hover:bg-brand-accent2/90 text-white font-bold rounded-xl cursor-pointer transition-colors"
            >
              Speichern
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
