import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { TrainingEntry } from './types';
import Header from './components/Header';
import Stats from './components/Stats';
import EntryForm from './components/EntryForm';
import EntryList from './components/EntryList';
import InstallPWAButton from './components/InstallPWAButton';

interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, onConfirm, onCancel, title, message }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 transition-opacity"
      aria-modal="true"
      role="dialog"
      onClick={onCancel}
    >
      <div 
        className="bg-slate-800 rounded-lg shadow-xl p-6 w-full max-w-sm m-4 border border-slate-700 transform transition-all"
        onClick={e => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="mt-2 text-sm text-slate-300">{message}</p>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-md bg-slate-600 hover:bg-slate-700 text-slate-200 font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
          >
            Cancelar
          </button>
          <button
            autoFocus
            onClick={onConfirm}
            className="px-4 py-2 rounded-md bg-red-600 hover:bg-red-700 text-white font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-red-500"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// Extiende la interfaz Window para incluir nuestra propiedad `deferredPrompt`
declare global {
  interface Window {
    deferredPrompt: any;
  }
}

const App: React.FC = () => {
  const [entries, setEntries] = useState<TrainingEntry[]>(() => {
    try {
      const storedEntries = window.localStorage.getItem('cycling-diary-entries');
      return storedEntries ? JSON.parse(storedEntries) : [];
    } catch (error) {
      console.error("Error al leer desde localStorage", error);
      return [];
    }
  });

  const [editingEntry, setEditingEntry] = useState<TrainingEntry | null>(null);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [canInstall, setCanInstall] = useState(false);
  const [isStandalone, setIsStandalone] = useState(
    () => window.matchMedia('(display-mode: standalone)').matches
  );

  useEffect(() => {
    const handleInstallable = () => {
      console.log('pwa-installable event received by React');
      setCanInstall(true);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    
    // Comprueba también si el prompt ya está disponible cuando el componente se monta
    if (window.deferredPrompt) {
        handleInstallable();
    }

    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
    };
  }, []);
  
  const handleInstallClick = useCallback(async () => {
    const promptEvent = window.deferredPrompt;
    if (!promptEvent) {
      return;
    }
    // Muestra el aviso de instalación.
    promptEvent.prompt();
    // Espera a que el usuario responda.
    const { outcome } = await promptEvent.userChoice;
    console.log(`User response to the install prompt: ${outcome}`);
    // Ya hemos usado el prompt, y no podemos usarlo de nuevo.
    window.deferredPrompt = null;
    // Oculta el botón de instalación.
    setCanInstall(false);
  }, []);


  useEffect(() => {
    try {
      window.localStorage.setItem('cycling-diary-entries', JSON.stringify(entries));
    } catch (error) {
      console.error("Error al guardar en localStorage", error);
    }
  }, [entries]);

  const handleSaveEntry = useCallback((entryData: Omit<TrainingEntry, 'id'>, id?: string) => {
    if (id) {
      // Update
      setEntries(prevEntries =>
        prevEntries.map(e => e.id === id ? { ...entryData, id } : e)
      );
    } else {
      // Add new
      const newEntry: TrainingEntry = {
        id: Date.now().toString(),
        ...entryData,
      };
      setEntries(prevEntries => [newEntry, ...prevEntries]);
    }
    setEditingEntry(null); // Exit editing mode
  }, []);

  const requestDeleteEntry = useCallback((id: string) => {
    setEntryToDelete(id);
  }, []);

  const cancelDeleteEntry = useCallback(() => {
    setEntryToDelete(null);
  }, []);

  const confirmDeleteEntry = useCallback(() => {
    if (!entryToDelete) return;

    if (editingEntry && editingEntry.id === entryToDelete) {
        setEditingEntry(null);
    }
    setEntries(prevEntries => prevEntries.filter(entry => entry.id !== entryToDelete));
    setEntryToDelete(null); // Close modal and reset state
  }, [entryToDelete, editingEntry]);

  const handleSelectEntryToEdit = useCallback((entry: TrainingEntry) => {
    setEditingEntry(entry);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleCancelEdit = useCallback(() => {
    setEditingEntry(null);
  }, []);


  const { todayTotal, weeklyTotal, monthlyTotal, yearlyTotal } = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()); // Today at 00:00:00 local time
    
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6); // Start of the 7-day period (inclusive)

    const todayString = now.toISOString().split('T')[0];
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let todayTotal = 0;
    let weeklyTotal = 0;
    let monthlyTotal = 0;
    let yearlyTotal = 0;

    entries.forEach(entry => {
      const parts = entry.date.split('-').map(p => parseInt(p, 10));
      const entryDate = new Date(parts[0], parts[1] - 1, parts[2]);

      if (entryDate.getFullYear() === currentYear) {
        yearlyTotal += entry.distance;
        if (entryDate.getMonth() === currentMonth) {
          monthlyTotal += entry.distance;
        }
      }

      if (entryDate >= sevenDaysAgo && entryDate <= today) {
        weeklyTotal += entry.distance;
      }

      if (entry.date === todayString) {
        todayTotal += entry.distance;
      }
    });

    return { todayTotal, weeklyTotal, monthlyTotal, yearlyTotal };
  }, [entries]);

  return (
    <div className="min-h-screen bg-slate-900 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          <Stats 
            todayTotal={todayTotal}
            weeklyTotal={weeklyTotal}
            monthlyTotal={monthlyTotal} 
            yearlyTotal={yearlyTotal} 
          />
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <EntryForm 
                onSaveEntry={handleSaveEntry} 
                editingEntry={editingEntry}
                onCancelEdit={handleCancelEdit}
              />
            </div>
            <div className="lg:col-span-3">
              <EntryList 
                entries={entries} 
                onDeleteEntry={requestDeleteEntry} 
                onEditEntry={handleSelectEntryToEdit}
              />
            </div>
          </div>
        </main>
      </div>
      <ConfirmModal
        isOpen={!!entryToDelete}
        onConfirm={confirmDeleteEntry}
        onCancel={cancelDeleteEntry}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que quieres eliminar esta salida? Esta acción no se puede deshacer."
      />
      {!isStandalone && canInstall && <InstallPWAButton onInstallClick={handleInstallClick} />}
    </div>
  );
};

export default App;