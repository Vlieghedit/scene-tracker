import { useState, useEffect } from 'react';

// Local storage service
const storageService = {
  // Groups with nested episodes and scenes
  getGroups: () => {
    const groups = localStorage.getItem('episodeTracker_groups');
    return groups ? JSON.parse(groups) : [];
  },
  saveGroups: (groups) => {
    localStorage.setItem('episodeTracker_groups', JSON.stringify(groups));
  },

  // Selected group
  getSelectedGroupId: () => {
    return localStorage.getItem('episodeTracker_selectedGroupId');
  },
  saveSelectedGroupId: (groupId) => {
    localStorage.setItem('episodeTracker_selectedGroupId', groupId);
  },

  // Dark mode preference
  getDarkMode: () => {
    return localStorage.getItem('episodeTracker_darkMode') === 'true';
  },
  saveDarkMode: (darkMode) => {
    localStorage.setItem('episodeTracker_darkMode', darkMode.toString());
  }
};

function App() {
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
  const [draggedGroup, setDraggedGroup] = useState(null);
  const [dragOverGroup, setDragOverGroup] = useState(null);
  const [showEpisodeCountInput, setShowEpisodeCountInput] = useState(false);
  const [episodeCount, setEpisodeCount] = useState(1);
  const [startingEpisodeNumber, setStartingEpisodeNumber] = useState(1);
  const [darkMode, setDarkMode] = useState(false);

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedGroups = storageService.getGroups();
    const savedSelectedGroupId = storageService.getSelectedGroupId();
    const savedDarkMode = storageService.getDarkMode();

    setGroups(savedGroups);
    // Convert to number if it's a string
    setSelectedGroupId(savedSelectedGroupId ? parseInt(savedSelectedGroupId) : null);
    setDarkMode(savedDarkMode);

    // If no groups exist, create a default group
    if (savedGroups.length === 0) {
      const defaultGroup = {
        id: Date.now(),
        title: 'Default Group',
        episodes: [],
        created_at: new Date().toISOString()
      };
      setGroups([defaultGroup]);
      setSelectedGroupId(defaultGroup.id);
      storageService.saveGroups([defaultGroup]);
      storageService.saveSelectedGroupId(defaultGroup.id);
    }
  }, []);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    storageService.saveGroups(groups);
  }, [groups]);

  useEffect(() => {
    if (selectedGroupId) {
      storageService.saveSelectedGroupId(selectedGroupId);
    }
  }, [selectedGroupId]);

  useEffect(() => {
    storageService.saveDarkMode(darkMode);
  }, [darkMode]);

  // Focus on number input when Add Scene modal opens
  useEffect(() => {
    if (showSceneCountInput) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const numberInput = document.querySelector('input[type="number"]');
        if (numberInput) {
          numberInput.focus();
          numberInput.select();
        }
      }, 100);
    }
  }, [showSceneCountInput]);

  // Focus on number input when Add Episode modal opens
  useEffect(() => {
    if (showEpisodeCountInput) {
      // Small delay to ensure modal is rendered
      setTimeout(() => {
        const numberInput = document.querySelector('input[type="number"]');
        if (numberInput) {
          numberInput.focus();
          numberInput.select();
        }
      }, 100);
    }
  }, [showEpisodeCountInput]);

  // Drag and drop functions
  const handleDragStart = (e, groupId) => {
    setDraggedGroup(groupId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, groupId) => {
    e.preventDefault();
    if (draggedGroup && draggedGroup !== groupId) {
      setDragOverGroup(groupId);
    }
  };

  const handleDragLeave = () => {
    setDragOverGroup(null);
  };

  const handleDrop = (e, targetGroupId) => {
    e.preventDefault();
    if (draggedGroup && draggedGroup !== targetGroupId) {
      const draggedIndex = groups.findIndex(g => g.id === draggedGroup);
      const targetIndex = groups.findIndex(g => g.id === targetGroupId);
      
      const newGroups = [...groups];
      const [draggedItem] = newGroups.splice(draggedIndex, 1);
      newGroups.splice(targetIndex, 0, draggedItem);
      
      setGroups(newGroups);
    }
    setDraggedGroup(null);
    setDragOverGroup(null);
  };

  const handleDragEnd = () => {
    setDraggedGroup(null);
    setDragOverGroup(null);
  };

  // Group functions
  const createGroup = (title) => {
    const newGroup = {
      id: Date.now(),
      title,
      episodes: [],
      created_at: new Date().toISOString()
    };
    const updatedGroups = [...groups, newGroup];
    setGroups(updatedGroups);
    return newGroup;
  };

  const updateGroup = (id, title) => {
    const updatedGroups = groups.map(group =>
      group.id === id ? { ...group, title } : group
    );
    setGroups(updatedGroups);
  };

  const deleteGroup = (id) => {
    const updatedGroups = groups.filter(group => group.id !== id);
    setGroups(updatedGroups);

    // If deleted group was selected, select first available group
    if (selectedGroupId === id) {
      const newSelectedGroupId = updatedGroups.length > 0 ? updatedGroups[0].id : null;
      setSelectedGroupId(newSelectedGroupId);
    }
  };

  // Episode functions
  const createEpisode = (groupId, episodeNumber) => {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    const title = `Episode ${episodeNumber.toString().padStart(2, '0')}`;

    // Create 16 default scenes
    const defaultScenes = [];
    for (let i = 1; i <= 16; i++) {
      const scene = {
        id: Date.now() + i,
        title: `Scene ${i.toString().padStart(2, '0')}`,
        state: 'not-ready',
        created_at: new Date().toISOString()
      };
      defaultScenes.push(scene);
    }

    const newEpisode = {
      id: Date.now(),
      title,
      scenes: defaultScenes,
      created_at: new Date().toISOString()
    };

    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? { ...group, episodes: [...group.episodes, newEpisode] }
        : group
    );
    setGroups(updatedGroups);
    return newEpisode;
  };

  const createMultipleEpisodes = (groupId, count, startNumber) => {
    console.log('createMultipleEpisodes called', { groupId, count, startNumber });
    console.log('Available groups:', groups.map(g => ({ id: g.id, title: g.title })));
    const group = groups.find(g => g.id === groupId);
    if (!group) {
      console.log('Group not found');
      return;
    }

    const newEpisodes = [];
    
    for (let i = 0; i < count; i++) {
      const episodeNumber = startNumber + i;
      const title = `Episode ${episodeNumber.toString().padStart(2, '0')}`;

      // Create 16 default scenes
      const defaultScenes = [];
      for (let j = 1; j <= 16; j++) {
        const scene = {
          id: Date.now() + (i * 1000) + j, // Ensure unique IDs
          title: `Scene ${j.toString().padStart(2, '0')}`,
          state: 'not-ready',
          created_at: new Date().toISOString()
        };
        defaultScenes.push(scene);
      }

      const newEpisode = {
        id: Date.now() + (i * 1000), // Ensure unique IDs
        title,
        scenes: defaultScenes,
        created_at: new Date().toISOString()
      };
      
      newEpisodes.push(newEpisode);
    }

    console.log('Created episodes:', newEpisodes);

    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? { ...group, episodes: [...group.episodes, ...newEpisodes] }
        : group
    );
    setGroups(updatedGroups);
    
    setShowEpisodeCountInput(false);
    setEpisodeCount(1);
    setStartingEpisodeNumber(1);
    
    return newEpisodes;
  };

  const updateEpisode = (groupId, episodeId, title) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId ? { ...episode, title } : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
  };

  const deleteEpisode = (groupId, episodeId) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.filter(episode => episode.id !== episodeId)
          }
        : group
    );
    setGroups(updatedGroups);
  };

  // Scene functions
  const createScene = (groupId, episodeId, title) => {
    const newScene = {
      id: Date.now(),
      title,
      state: 'not-ready',
      created_at: new Date().toISOString()
    };

    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId
                ? { ...episode, scenes: [...episode.scenes, newScene] }
                : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
    return newScene;
  };

  const createMultipleScenes = (groupId, episodeId, count) => {
    const group = groups.find(g => g.id === groupId);
    const episode = group?.episodes.find(ep => ep.id === episodeId);
    if (!episode) return;

    const startNumber = episode.scenes.length + 1;
    const newScenes = [];
    
    for (let i = 0; i < count; i++) {
      const sceneNumber = startNumber + i;
      const newScene = {
        id: Date.now() + i,
        title: `Scene ${sceneNumber.toString().padStart(2, '0')}`,
        state: 'not-ready',
        created_at: new Date().toISOString()
      };
      newScenes.push(newScene);
    }

    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId
                ? { ...episode, scenes: [...episode.scenes, ...newScenes] }
                : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
    setShowSceneCountInput(false);
    setSceneCount(1);
  };

  const updateSceneState = (groupId, episodeId, sceneId, state) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId
                ? {
                    ...episode,
                    scenes: episode.scenes.map(scene =>
                      scene.id === sceneId ? { ...scene, state } : scene
                    )
                  }
                : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
  };

  const deleteScene = (groupId, episodeId, sceneId) => {
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId
                ? {
                    ...episode,
                    scenes: episode.scenes.filter(scene => scene.id !== sceneId)
                  }
                : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
  };

  // Scene state management
  const changeSceneState = (groupId, episodeId, sceneId) => {
    const group = groups.find(g => g.id === groupId);
    const episode = group?.episodes.find(ep => ep.id === episodeId);
    const scene = episode?.scenes.find(s => s.id === sceneId);
    
    if (!scene) return;

    const states = ['not-ready', 'ready-to-edit', 'in-progress',  'done', 'delayed', 'cancelled'];
    const currentIndex = states.indexOf(scene.state);
    const nextIndex = (currentIndex + 1) % states.length;
    const newState = states[nextIndex];

    updateSceneState(groupId, episodeId, sceneId, newState);
  };

  const advanceAllScenes = (groupId, episodeId) => {
    const group = groups.find(g => g.id === groupId);
    const episode = group?.episodes.find(ep => ep.id === episodeId);
    if (!episode) return;

    const states = ['not-ready', 'ready-to-edit', 'in-progress', 'done', 'delayed', 'cancelled'];
    
    const updatedGroups = groups.map(group =>
      group.id === groupId
        ? {
            ...group,
            episodes: group.episodes.map(episode =>
              episode.id === episodeId
                ? {
                    ...episode,
                    scenes: episode.scenes.map(scene => {
                      const currentIndex = states.indexOf(scene.state);
                      const nextIndex = (currentIndex + 1) % states.length;
                      return { ...scene, state: states[nextIndex] };
                    })
                  }
                : episode
            )
          }
        : group
    );
    setGroups(updatedGroups);
  };

  // Helper functions
  const getSceneStateColor = (state) => {
    switch (state) {
      case 'not-ready': return 'bg-gray-800 text-white';
      case 'ready-to-edit': return 'bg-orange-500 text-white';
      case 'in-progress': return 'bg-yellow-700 text-white';
      case 'done': return 'bg-green-500 text-white';
      case 'delayed': return 'bg-gray-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-800 text-white';
    }
  };

  const getSceneTextColor = (state) => {
    if (darkMode) {
      switch (state) {
        case 'not-ready': return 'text-white';
        case 'ready-to-edit': return 'text-orange-400';
        case 'in-progress': return 'text-yellow-300';
        case 'done': return 'text-green-400';
        case 'delayed': return 'text-gray-300';
        case 'cancelled': return 'text-red-400';
        default: return 'text-white';
      }
    } else {
      switch (state) {
        case 'not-ready': return 'text-gray-700';        
        case 'ready-to-edit': return 'text-orange-600';
        case 'in-progress': return 'text-yellow-700';
        case 'done': return 'text-green-600';
        case 'delayed': return 'text-gray-600';
        case 'cancelled': return 'text-red-600';
        default: return 'text-gray-700';
      }
    }
  };

  const getSceneStateText = (state) => {
    switch (state) {
      case 'not-ready': return 'Not Ready';     
      case 'ready-to-edit': return 'Ready to Edit';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      case 'delayed': return 'Delayed';
      case 'cancelled': return 'Cancelled';
      default: return 'Not Ready';
    }
  };

  // Progress calculation functions
  const getEpisodeProgress = (episode) => {
    if (episode.scenes.length === 0) return 0;
    const activeScenes = episode.scenes.filter(scene => scene.state !== 'cancelled');
    if (activeScenes.length === 0) return 0;
    const doneScenes = activeScenes.filter(scene => scene.state === 'done').length;
    return Math.round((doneScenes / activeScenes.length) * 100);
  };

  const getEpisodeProgressText = (episode) => {
    if (episode.scenes.length === 0) return '0/0';
    const activeScenes = episode.scenes.filter(scene => scene.state !== 'cancelled');
    const doneScenes = activeScenes.filter(scene => scene.state === 'done').length;
    return `${doneScenes}/${activeScenes.length}`;
  };

  const getEpisodeBackgroundColor = (episode) => {
    const progress = getEpisodeProgress(episode);
    
    if (progress === 100 && episode.scenes.length > 0) {
      return 'border-green-200';
    }
    return 'border-gray-200';
  };

  const getEpisodeBackgroundStyle = (episode) => {
    const progress = getEpisodeProgress(episode);
    
    if (progress === 100 && episode.scenes.length > 0) {
      return { backgroundColor: darkMode ? '#064e3b' : '#f0fdf4' }; // Dark/light green for completed episodes
    }
    return { backgroundColor: darkMode ? '#1f2937' : '#ffffff' }; // Dark/light background
  };

  const getSelectedGroup = () => {
    return groups.find(g => g.id === selectedGroupId);
  };

  const getVisibleEpisodes = () => {
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return [];
    
    return selectedGroup.episodes;
  };

  const getTotalProgress = () => {
    if (!selectedGroupId) return 0;
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return 0;
    
    const allScenes = selectedGroup.episodes.flatMap(episode => episode.scenes);
    if (allScenes.length === 0) return 0;
    const activeScenes = allScenes.filter(scene => scene.state !== 'cancelled');
    if (activeScenes.length === 0) return 0;
    const doneScenes = activeScenes.filter(scene => scene.state === 'done').length;
    return Math.round((doneScenes / activeScenes.length) * 100);
  };

  const getTotalProgressText = () => {
    if (!selectedGroupId) return '0/0';
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup) return '0/0';
    
    const allScenes = selectedGroup.episodes.flatMap(episode => episode.scenes);
    if (allScenes.length === 0) return '0/0';
    const activeScenes = allScenes.filter(scene => scene.state !== 'cancelled');
    const doneScenes = activeScenes.filter(scene => scene.state === 'done').length;
    return `${doneScenes}/${activeScenes.length}`;
  };

  const getCompletedEpisodesProgress = () => {
    if (!selectedGroupId) return 0;
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup || selectedGroup.episodes.length === 0) return 0;
    
    const completedEpisodes = selectedGroup.episodes.filter(episode => {
      const activeScenes = episode.scenes.filter(scene => scene.state !== 'cancelled');
      return activeScenes.length > 0 && activeScenes.every(scene => scene.state === 'done');
    }).length;
    return Math.round((completedEpisodes / selectedGroup.episodes.length) * 100);
  };

  const getCompletedEpisodesText = () => {
    if (!selectedGroupId) return '0/0';
    const selectedGroup = getSelectedGroup();
    if (!selectedGroup || selectedGroup.episodes.length === 0) return '0/0';
    
    const completedEpisodes = selectedGroup.episodes.filter(episode => {
      const activeScenes = episode.scenes.filter(scene => scene.state !== 'cancelled');
      return activeScenes.length > 0 && activeScenes.every(scene => scene.state === 'done');
    }).length;
    return `${completedEpisodes}/${selectedGroup.episodes.length}`;
  };

  // Statistics
  const getGlobalStats = () => {
    const totalGroups = groups.length;
    const totalEpisodes = groups.reduce((sum, group) => sum + group.episodes.length, 0);
    const totalScenes = groups.reduce((sum, group) => 
      sum + group.episodes.reduce((epSum, episode) => epSum + episode.scenes.length, 0), 0
    );
    
    const allScenes = groups.flatMap(group => 
      group.episodes.flatMap(episode => episode.scenes)
    );
    
    const notReadyScenes = allScenes.filter(scene => scene.state === 'not-ready').length;
    const inProgressScenes = allScenes.filter(scene => scene.state === 'in-progress').length;
    const readyToEditScenes = allScenes.filter(scene => scene.state === 'ready-to-edit').length;
    const doneScenes = allScenes.filter(scene => scene.state === 'done').length;
    const delayedScenes = allScenes.filter(scene => scene.state === 'delayed').length;
    const cancelledScenes = allScenes.filter(scene => scene.state === 'cancelled').length;
    
    const completedEpisodes = groups.reduce((sum, group) => 
      sum + group.episodes.filter(episode => {
        const activeScenes = episode.scenes.filter(scene => scene.state !== 'cancelled');
        return activeScenes.length > 0 && activeScenes.every(scene => scene.state === 'done');
      }).length, 0
    );
    
    return {
      totalGroups,
      totalEpisodes,
      totalScenes,
      notReadyScenes,
      readyToEditScenes,
      doneScenes,
      inProgressScenes,
      delayedScenes,
      cancelledScenes,
      completedEpisodes
    };
  };

  // Confirmation dialogs
  const confirmDeleteEpisode = (groupId, episodeId, episodeTitle) => {
    if (window.confirm(`Are you sure you want to delete "${episodeTitle}"? This will also delete all scenes in this episode.`)) {
      deleteEpisode(groupId, episodeId);
    }
  };

  const confirmDeleteScene = (groupId, episodeId, sceneId, sceneTitle) => {
    if (window.confirm(`Are you sure you want to delete "${sceneTitle}"?`)) {
      deleteScene(groupId, episodeId, sceneId);
    }
  };

  const confirmDeleteGroup = (groupId, groupTitle) => {
    if (window.confirm(`Are you sure you want to delete "${groupTitle}"? This will also delete all episodes and scenes in this group.`)) {
      deleteGroup(groupId);
    }
  };

  // Event handlers
  const handleAddEpisode = () => {
    console.log('handleAddEpisode called');
    setShowEpisodeCountInput(true);
    console.log('showEpisodeCountInput set to true');
  };

  const handleSaveMultipleEpisodes = () => {
    console.log('handleSaveMultipleEpisodes called', { selectedGroupId, episodeCount, startingEpisodeNumber });
    console.log('selectedGroupId type:', typeof selectedGroupId);
    console.log('selectedGroupId value:', selectedGroupId);
    if (selectedGroupId && episodeCount > 0 && startingEpisodeNumber > 0) {
      createMultipleEpisodes(selectedGroupId, episodeCount, startingEpisodeNumber);
    } else {
      console.log('Validation failed:', { selectedGroupId, episodeCount, startingEpisodeNumber });
    }
  };

  const handleEditEpisode = (episode) => {
    setEditingEpisode(episode.id);
    setEditTitle(episode.title);
  };

  const handleSaveEpisode = () => {
    if (editingEpisode && editTitle.trim() && selectedGroupId) {
      updateEpisode(selectedGroupId, editingEpisode, editTitle.trim());
      setEditingEpisode(null);
      setEditTitle('');
    }
  };

  const handleCancelEditEpisode = () => {
    setEditingEpisode(null);
    setEditTitle('');
  };

  const handleAddScene = (episodeId) => {
    if (selectedGroupId) {
      const group = groups.find(g => g.id === selectedGroupId);
      const episode = group?.episodes.find(ep => ep.id === episodeId);
      if (episode) {
        const sceneNumber = episode.scenes.length + 1;
        const title = `Scene ${sceneNumber.toString().padStart(2, '0')}`;
        createScene(selectedGroupId, episodeId, title);
      }
    }
  };

  const handleAddMultipleScenes = (episodeId) => {
    setSelectedEpisodeForScenes(episodeId);
    setShowSceneCountInput(true);
    // Focus will be set in useEffect when modal opens
  };

  const handleSaveMultipleScenes = () => {
    if (selectedGroupId && selectedEpisodeForScenes && sceneCount > 0) {
      createMultipleScenes(selectedGroupId, selectedEpisodeForScenes, sceneCount);
      setSelectedEpisodeForScenes(null);
    }
  };

  const handleEditGroup = (group) => {
    setEditingGroup(group.id);
    setEditGroupTitle(group.title);
  };

  const handleSaveGroup = () => {
    if (editingGroup && editGroupTitle.trim()) {
      updateGroup(editingGroup, editGroupTitle.trim());
      setEditingGroup(null);
      setEditGroupTitle('');
    }
  };

  const handleCancelEditGroup = () => {
    setEditingGroup(null);
    setEditGroupTitle('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const stats = getGlobalStats();

  return (
    <div className={`min-h-screen py-6 ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <h1 className={`text-3xl font-bold mb-4 text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>
          <span>THUIS!</span> <span className="text-2xl">Episode Tracker</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Left Column - Group Management */}
          <div className="lg:col-span-1">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-3 sticky top-4`}>
              <div className="flex items-center justify-end gap-2 mb-4">
                <button
                  onClick={toggleDarkMode}
                  className={`px-3 py-1.5 rounded text-sm focus:outline-none focus:ring-2 ${
                    darkMode 
                      ? 'bg-yellow-500 text-gray-900 hover:bg-yellow-400 focus:ring-yellow-500' 
                      : 'bg-gray-700 text-white hover:bg-gray-600 focus:ring-gray-500'
                  }`}
                  title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
                <button
                  onClick={() => setShowStats(true)}
                  className="px-4 py-1.5 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Statistics
                </button>
                <button
                  onClick={() => {
                    const title = prompt('Enter group name:');
                    if (title && title.trim()) {
                      createGroup(title.trim());
                    }
                  }}
                  className="px-4 py-1.5 bg-purple-500 text-white text-sm rounded hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Nieuw Blok
                </button>
              </div>
              
              {/* Group Selection */}
              {groups.length > 0 && (
                <div className="space-y-2 mb-3">
                  {groups.map(group => (
                    <div 
                      key={group.id} 
                      draggable
                      onDragStart={(e) => handleDragStart(e, group.id)}
                      onDragOver={(e) => handleDragOver(e, group.id)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, group.id)}
                      onDragEnd={handleDragEnd}
                      className={`rounded-lg p-2 border cursor-move transition-colors ${
                        selectedGroupId === group.id 
                          ? 'border-blue-300' 
                          : darkMode ? 'border-gray-600' : 'border-gray-200'
                      } ${
                        draggedGroup === group.id ? 'opacity-50' : ''
                      } ${
                        dragOverGroup === group.id ? 'border-blue-400' : ''
                      } ${
                        selectedGroupId === group.id 
                          ? darkMode ? 'bg-blue-900' : 'bg-blue-50'
                          : darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      {editingGroup === group.id ? (
                        <div className="flex flex-col gap-2">
                          <input
                            type="text"
                            value={editGroupTitle}
                            onChange={(e) => setEditGroupTitle(e.target.value)}
                            className={`text-sm font-semibold px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                              darkMode 
                                ? 'text-white bg-gray-700 border-gray-600' 
                                : 'text-gray-800 bg-white border-gray-300'
                            }`}
                            onKeyPress={(e) => e.key === 'Enter' && handleSaveGroup()}
                          />
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleSaveGroup()}
                              className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                              Save
                            </button>
                            <button
                              onClick={handleCancelEditGroup}
                              className="px-1.5 py-0.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-center">
                          <div 
                            className="flex-1 cursor-pointer"
                            onClick={() => setSelectedGroupId(group.id)}
                          >
                            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{group.title}</h3>
                            <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{group.episodes.length} episodes</p>
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => handleEditGroup(group)}
                              className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => confirmDeleteGroup(group.id, group.title)}
                              className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Group Progress and Add Episode */}
              {selectedGroupId && (
                <div className={`${darkMode ? 'bg-gray-700' : 'bg-gray-50'} rounded-lg p-3`}>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className={`text-md font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                      {getSelectedGroup()?.title} - Progress
                    </h3>
                    <button
                      onClick={handleAddEpisode}
                      className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      title="Add Episode"
                    >
                      🎬
                    </button>
                  </div>
                  <div className="space-y-3">
                    {/* Scenes Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Scenes Progress</h4>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getTotalProgressText()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getTotalProgress()}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Episodes Progress */}
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <h4 className={`text-sm font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Episodes Progress</h4>
                        <span className={`text-xs font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{getCompletedEpisodesText()}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getCompletedEpisodesProgress()}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Episodes List */}
          <div className="lg:col-span-3">
            {selectedGroupId ? (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-4">
                  {getVisibleEpisodes().map(episode => (
                    <div 
                      key={episode.id} 
                      className={`${getEpisodeBackgroundColor(episode)} rounded-lg shadow-md p-4 border flex flex-col h-full`}
                      style={getEpisodeBackgroundStyle(episode)}
                    >
                      <div className="mb-3">
                        {editingEpisode === episode.id ? (
                          <div className="flex flex-col gap-2">
                            <input
                              type="text"
                              value={editTitle}
                              onChange={(e) => setEditTitle(e.target.value)}
                              className="text-lg font-semibold text-gray-800 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                              onKeyPress={(e) => e.key === 'Enter' && handleSaveEpisode()}
                            />
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleSaveEpisode()}
                                className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                              >
                                Save
                              </button>
                              <button
                                onClick={handleCancelEditEpisode}
                                className="px-1.5 py-0.5 bg-gray-500 text-white text-xs rounded hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <h3 className={`text-lg font-semibold cursor-pointer hover:text-blue-600 ${darkMode ? 'text-white' : 'text-gray-800'}`} onClick={() => handleEditEpisode(episode)}>
                              {episode.title}
                            </h3>
                            <div className="flex gap-1">
                              <button
                                onClick={() => handleAddMultipleScenes(episode.id)}
                                className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                title="Add More Scenes"
                              >
                                +
                              </button>
                              <button
                                onClick={() => confirmDeleteEpisode(selectedGroupId, episode.id, episode.title)}
                                className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      {/* Scenes List */}
                      <div className="flex-1 space-y-0.5">
                        {episode.scenes.length === 0 ? (
                          <p className={`italic text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>No scenes yet</p>
                        ) : (
                          episode.scenes.map(scene => (
                            <div key={scene.id} className="flex justify-between items-center p-1 rounded text-sm">
                              <span className={`font-medium ${getSceneTextColor(scene.state)}`}>{scene.title}</span>
                              <div className="flex gap-0.5">
                                <button
                                  onClick={() => changeSceneState(selectedGroupId, episode.id, scene.id)}
                                  className={`px-1.5 py-0.5 text-xs rounded hover:opacity-80 focus:outline-none focus:ring-1 ${getSceneStateColor(scene.state)}`}
                                >
                                  {getSceneStateText(scene.state)}
                                </button>
                                <button
                                  onClick={() => confirmDeleteScene(selectedGroupId, episode.id, scene.id, scene.title)}
                                  className="px-1.5 py-0.5 bg-red-400 text-white rounded hover:bg-red-500 focus:outline-none focus:ring-1 text-xs"
                                  title="Delete Scene"
                                >
                                  ×
                                </button>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                      
                      {/* Progress Bar */}
                      <div className={`mt-3 pt-2 border-t ${darkMode ? 'border-gray-600' : 'border-gray-200'}`}>
                        <div className="flex justify-between items-center mb-1">
                          <span className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Progress</span>
                          <span className={`text-xs font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{getEpisodeProgressText(episode)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${getEpisodeProgress(episode)}%` }}
                          ></div>
                        </div>
                        {episode.scenes.length > 0 && (
                          <div className="mt-2 flex justify-center">
                            <button
                              onClick={() => advanceAllScenes(selectedGroupId, episode.id)}
                              className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                              title="Advance all scenes to next state"
                            >
                              Advance All Scenes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Scene Count Input Modal */}
                {showSceneCountInput && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Add Multiple Scenes</h2>
                        <button
                          onClick={() => {
                            setShowSceneCountInput(false);
                            setSceneCount(1);
                            setSelectedEpisodeForScenes(null);
                          }}
                          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of scenes to add:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={sceneCount}
                            onChange={(e) => setSceneCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter number of scenes"
                          />
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveMultipleScenes}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Add {sceneCount} Scene{sceneCount !== 1 ? 's' : ''}
                          </button>
                          <button
                            onClick={() => {
                              setShowSceneCountInput(false);
                              setSceneCount(1);
                              setSelectedEpisodeForScenes(null);
                            }}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Episode Count Input Modal */}
                {showEpisodeCountInput && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full mx-4">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-gray-800">Add Multiple Episodes</h2>
                        <button
                          onClick={() => {
                            setShowEpisodeCountInput(false);
                            setEpisodeCount(1);
                            setStartingEpisodeNumber(1);
                          }}
                          className="text-gray-500 hover:text-gray-700 text-xl font-bold"
                        >
                          ×
                        </button>
                      </div>
                      
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Number of episodes to add:
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="50"
                            value={episodeCount}
                            onChange={(e) => setEpisodeCount(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter number of episodes"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Starting episode number:
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={startingEpisodeNumber}
                            onChange={(e) => setStartingEpisodeNumber(Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter starting episode number"
                          />
                        </div>
                        
                        <div className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                          <p>Episodes will be created as:</p>
                          <p className="font-medium">
                            Episode {startingEpisodeNumber.toString().padStart(2, '0')} - Episode {(startingEpisodeNumber + episodeCount - 1).toString().padStart(2, '0')}
                          </p>
                        </div>
                        
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveMultipleEpisodes}
                            className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
                          >
                            Add {episodeCount} Episode{episodeCount !== 1 ? 's' : ''}
                          </button>
                          <button
                            onClick={() => {
                              setShowEpisodeCountInput(false);
                              setEpisodeCount(1);
                              setStartingEpisodeNumber(1);
                            }}
                            className="flex-1 bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}


              </div>
            ) : (
              <div className={`text-center mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-lg">
                  No groups yet. Create your first group to get started!
                </p>
              </div>
            )}

            {selectedGroupId && getSelectedGroup()?.episodes.length === 0 && (
              <div className={`text-center mt-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                <p className="text-lg">
                  No episodes yet. Create your first episode to get started!
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Popup */}
        {showStats && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-xl p-6 max-w-md w-full mx-4`}>
              <div className="flex justify-between items-center mb-4">
                <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Global Statistics</h2>
                <button
                  onClick={() => setShowStats(false)}
                  className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
                >
                  ×
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className={`${darkMode ? 'bg-blue-900' : 'bg-blue-50'} p-3 rounded-lg`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{stats.totalGroups}</div>
                    <div className={`text-sm ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>Total Blocks</div>
                  </div>
                  <div className={`${darkMode ? 'bg-green-900' : 'bg-green-50'} p-3 rounded-lg`}>
                    <div className={`text-2xl font-bold ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.totalEpisodes}</div>
                    <div className={`text-sm ${darkMode ? 'text-green-300' : 'text-green-700'}`}>Total Episodes</div>
                  </div>
                </div>
                
                <div className={`${darkMode ? 'bg-purple-900' : 'bg-purple-50'} p-3 rounded-lg`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>{stats.totalScenes}</div>
                  <div className={`text-sm ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>Total Scenes</div>
                </div>
                
                <div className="space-y-2">
                  <h3 className={`font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>Scene Status Breakdown:</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Not Ready:</span>
                      <span className={`font-medium ${darkMode ? 'text-white' : 'text-gray-800'}`}>{stats.notReadyScenes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>In Progress:</span>
                      <span className={`font-medium ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>{stats.inProgressScenes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Ready to Edit:</span>
                      <span className={`font-medium ${darkMode ? 'text-orange-400' : 'text-orange-600'}`}>{stats.readyToEditScenes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Done:</span>
                      <span className={`font-medium ${darkMode ? 'text-green-400' : 'text-green-600'}`}>{stats.doneScenes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Delayed:</span>
                      <span className={`font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{stats.delayedScenes}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className={darkMode ? 'text-gray-300' : 'text-gray-600'}>Cancelled:</span>
                      <span className={`font-medium ${darkMode ? 'text-red-400' : 'text-red-600'}`}>{stats.cancelledScenes}</span>
                    </div>
                  </div>
                </div>
                
                <div className={`${darkMode ? 'bg-yellow-900' : 'bg-yellow-50'} p-3 rounded-lg`}>
                  <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>{stats.completedEpisodes}</div>
                  <div className={`text-sm ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>Completed Episodes</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
