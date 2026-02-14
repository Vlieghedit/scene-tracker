import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  doc, 
  setDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';

// --- STAP 1: PLAK HIER JOUW FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "JOUW_API_KEY",
  authDomain: "jouw-project.firebaseapp.com",
  projectId: "jouw-project",
  storageBucket: "jouw-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123def"
};

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const DOC_ID = "global_tracker_data";

// Helper voor unieke ID's
const generateId = () => (typeof crypto.randomUUID === 'function' 
  ? crypto.randomUUID() 
  : Math.floor(Math.random() * 1000000000));

function App() {
  // Auth states
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  // App states
  const [groups, setGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [editingEpisode, setEditingEpisode] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editingGroup, setEditingGroup] = useState(null);
  const [editGroupTitle, setEditGroupTitle] = useState('');
  const [showStats, setShowStats] = useState(false);
  const [sceneCount, setSceneCount] = useState(1);
  const [showSceneCountInput, setShowSceneCountInput] = useState(false);
  const [selectedEpisodeForScenes, setSelectedEpisodeForScenes] = useState(null);
  const [showEpisodeCountInput, setShowEpisodeCountInput] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(1);
  const [startingEpisodeNumber, setStartingEpisodeNumber] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  // --- AUTHENTICATIE CHECK ---
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  // --- CLOUD DATA LADEN ---
  useEffect(() => {
    if (!user) return;

    const unsubData = onSnapshot(doc(db, "appData", DOC_ID), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setGroups(data.groups || []);
      } else {
        // Eerste keer ooit? Maak een leeg document aan
        saveToCloud([]);
      }
    });
    return () => unsubData();
  }, [user]);

  // --- DATA OPSLAAN NAAR CLOUD ---
  const saveToCloud = async (newGroups) => {
    if (!user) return;
    try {
      await setDoc(doc(db, "appData", DOC_ID), { groups: newGroups });
    } catch (e) {
      console.error("Fout bij opslaan: ", e);
    }
  };

  // --- AUTH ACTIES ---
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoginError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setLoginError('Inloggen mislukt. Controleer e-mail en wachtwoord.');
    }
  };

  const handleLogout = () => signOut(auth);

  // --- GROUP FUNCTIES ---
  const createGroup = (title) => {
    const newGroup = {
      id: generateId(),
      title,
      episodes: [],
      created_at: new Date().toISOString()
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
  };

  const updateGroup = (id, title) => {
    const updatedGroups = groups.map(group =>
      group.id === id ? { ...group, title } : group
    );
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
  };

  const deleteGroup = (id) => {
    const updatedGroups = groups.filter(group => group.id !== id);
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
    if (selectedGroupId === id) setSelectedGroupId(null);
  };

  // --- EPISODE FUNCTIES ---
  const createMultipleEpisodes = (groupId, count, startNumber) => {
    const updatedGroups = groups.map(group => {
      if (group.id === groupId) {
        const newEpisodes = [];
        for (let i = 0; i < count; i++) {
          const epNum = parseInt(startNumber) + i;
          const defaultScenes = Array.from({ length: 16 }, (_, j) => ({
            id: generateId(),
            title: `Scene ${(j + 1).toString().padStart(2, '0')}`,
            state: 'not-ready',
            created_at: new Date().toISOString()
          }));
          newEpisodes.push({
            id: generateId(),
            title: `Episode ${epNum.toString().padStart(2, '0')}`,
            scenes: defaultScenes,
            created_at: new Date().toISOString()
          });
        }
        return { ...group, episodes: [...group.episodes, ...newEpisodes] };
      }
      return group;
    });
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
    setShowEpisodeCountInput(false);
  };

  const updateEpisode = (groupId, episodeId, title) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId ? {
        ...group,
        episodes: group.episodes.map(ep => ep.id === episodeId ? { ...ep, title } : ep)
      } : group
    );
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
  };

  // --- SCENE FUNCTIES ---
  const changeSceneState = (groupId, episodeId, sceneId) => {
    const states = ['not-ready', 'ready-to-edit', 'in-progress', 'done', 'delayed', 'cancelled'];
    const updatedGroups = groups.map(group =>
      group.id === groupId ? {
        ...group,
        episodes: group.episodes.map(ep => 
          ep.id === episodeId ? {
            ...ep,
            scenes: ep.scenes.map(s => {
              if (s.id === sceneId) {
                const nextIdx = (states.indexOf(s.state) + 1) % states.length;
                return { ...s, state: states[nextIdx] };
              }
              return s;
            })
          } : ep
        )
      } : group
    );
    setGroups(updatedGroups);
    saveToCloud(updatedGroups);
  };

  // --- HELPERS VOOR UI ---
  const getSelectedGroup = () => groups.find(g => g.id === selectedGroupId);
  const getEpisodeProgress = (ep) => {
    const active = ep.scenes.filter(s => s.state !== 'cancelled');
    if (active.length === 0) return 0;
    return Math.round((active.filter(s => s.state === 'done').length / active.length) * 100);
  };

  const getSceneTextColor = (state) => {
    const colors = {
      'not-ready': darkMode ? 'text-white' : 'text-gray-700',
      'ready-to-edit': 'text-orange-500',
      'in-progress': 'text-yellow-500',
      'done': 'text-green-500',
      'delayed': 'text-gray-400',
      'cancelled': 'text-red-500'
    };
    return colors[state] || 'text-white';
  };

  // --- LOADING SCHERM ---
  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Authenticatie controleren...</div>;

  // --- LOGIN SCHERM ---
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
          <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">THUIS! Tracker</h2>
          {loginError && <p className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">{loginError}</p>}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">E-mail</label>
            <input type="email" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={email} onChange={(e)=>setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Wachtwoord</label>
            <input type="password" className="w-full p-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={password} onChange={(e)=>setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">Inloggen</button>
        </form>
      </div>
    );
  }

  // --- HOOFDSCHERM (JSX) ---
  return (
    <div className={`min-h-screen py-6 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">THUIS! <span className="text-blue-500 text-xl tracking-widest uppercase">Episode Tracker</span></h1>
          <div className="flex gap-4 items-center">
            <button onClick={() => setDarkMode(!darkMode)} className="p-2 bg-gray-700 rounded-full">{darkMode ? '☀️' : '🌙'}</button>
            <button onClick={handleLogout} className="text-sm bg-red-500 hover:bg-red-600 px-4 py-2 rounded-lg text-white">Uitloggen</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar: Groepen */}
          <div className="lg:col-span-1 space-y-4">
            <button onClick={() => {
              const t = prompt('Nieuw Blok Naam:');
              if(t) createGroup(t);
            }} className="w-full bg-purple-600 py-2 rounded-lg text-white font-bold hover:bg-purple-700">+ Nieuw Blok</button>
            
            <div className="space-y-2">
              {groups.map(group => (
                <div key={group.id} onClick={() => setSelectedGroupId(group.id)} 
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedGroupId === group.id ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 bg-gray-800/50'}`}>
                  <h3 className="font-bold">{group.title}</h3>
                  <p className="text-xs opacity-60">{group.episodes.length} episodes</p>
                </div>
              ))}
            </div>
          </div>

          {/* Main: Episodes & Scènes */}
          <div className="lg:col-span-3">
            {selectedGroupId ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-bold">{getSelectedGroup()?.title}</h2>
                  <button onClick={() => setShowEpisodeCountInput(true)} className="bg-blue-600 px-4 py-2 rounded-lg text-white">+ Episodes Toevoegen</button>
                </div>

                {/* Grid van Episodes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSelectedGroup()?.episodes.map(ep => (
                    <div key={ep.id} className={`p-4 rounded-xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                      <div className="flex justify-between mb-3">
                        <h4 className="font-bold">{ep.title}</h4>
                        <span className="text-xs font-mono">{getEpisodeProgress(ep)}%</span>
                      </div>
                      <div className="grid grid-cols-8 gap-1">
                        {ep.scenes.map(scene => (
                          <div 
                            key={scene.id} 
                            onClick={() => changeSceneState(getSelectedGroup().id, ep.id, scene.id)}
                            title={scene.title}
                            className={`h-8 rounded cursor-pointer transition-colors flex items-center justify-center text-[10px] font-bold border border-black/10
                              ${scene.state === 'not-ready' ? 'bg-gray-700' : 
                                scene.state === 'ready-to-edit' ? 'bg-orange-500' : 
                                scene.state === 'in-progress' ? 'bg-yellow-600' : 
                                scene.state === 'done' ? 'bg-green-600' : 
                                scene.state === 'delayed' ? 'bg-gray-400' : 'bg-red-600'}`}
                          >
                            {scene.title.split(' ')[1]}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center opacity-40 italic">Selecteer een blok aan de linkerkant</div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL: EPISODES TOEVOEGEN */}
      {showEpisodeCountInput && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 p-6 rounded-xl w-full max-w-sm">
            <h3 className="text-xl font-bold mb-4">Meerdere episodes aanmaken</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Aantal episodes:</label>
                <input type="number" value={episodeCount} onChange={(e)=>setEpisodeCount(e.target.value)} className="w-full p-2 bg-gray-700 rounded" />
              </div>
              <div>
                <label className="block text-sm mb-1">Start nummering bij:</label>
                <input type="number" value={startingEpisodeNumber} onChange={(e)=>setStartingEpisodeNumber(e.target.value)} className="w-full p-2 bg-gray-700 rounded" />
              </div>
              <div className="flex gap-2">
                <button onClick={() => createMultipleEpisodes(selectedGroupId, episodeCount, startingEpisodeNumber)} className="flex-1 bg-green-600 py-2 rounded font-bold">Start</button>
                <button onClick={() => setShowEpisodeCountInput(false)} className="flex-1 bg-gray-600 py-2 rounded">Annuleer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
