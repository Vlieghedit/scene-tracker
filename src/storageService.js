import { dbService } from './supabase.js'

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
}

// Hybrid storage service that uses Supabase when available, localStorage as fallback
export const storageService = {
  // Groups with nested episodes and scenes
  async getGroups() {
    if (isSupabaseConfigured()) {
      try {
        return await dbService.getGroups()
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
        return this.getGroupsFromLocalStorage()
      }
    }
    return this.getGroupsFromLocalStorage()
  },

  async saveGroups(groups) {
    if (isSupabaseConfigured()) {
      try {
        const success = await dbService.saveGroups(groups)
        if (success) {
          // Also save to localStorage as backup
          this.saveGroupsToLocalStorage(groups)
          return true
        }
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
      }
    }
    return this.saveGroupsToLocalStorage(groups)
  },

  // Selected group
  async getSelectedGroupId() {
    if (isSupabaseConfigured()) {
      try {
        return await dbService.getSelectedGroupId()
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
        return this.getSelectedGroupIdFromLocalStorage()
      }
    }
    return this.getSelectedGroupIdFromLocalStorage()
  },

  async saveSelectedGroupId(groupId) {
    if (isSupabaseConfigured()) {
      try {
        const success = await dbService.saveSelectedGroupId(groupId)
        if (success) {
          // Also save to localStorage as backup
          this.saveSelectedGroupIdToLocalStorage(groupId)
          return true
        }
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
      }
    }
    return this.saveSelectedGroupIdToLocalStorage(groupId)
  },

  // Dark mode preference
  async getDarkMode() {
    if (isSupabaseConfigured()) {
      try {
        return await dbService.getDarkMode()
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
        return this.getDarkModeFromLocalStorage()
      }
    }
    return this.getDarkModeFromLocalStorage()
  },

  async saveDarkMode(darkMode) {
    if (isSupabaseConfigured()) {
      try {
        const success = await dbService.saveDarkMode(darkMode)
        if (success) {
          // Also save to localStorage as backup
          this.saveDarkModeToLocalStorage(darkMode)
          return true
        }
      } catch (error) {
        console.warn('Supabase failed, falling back to localStorage:', error)
      }
    }
    return this.saveDarkModeToLocalStorage(darkMode)
  },

  // LocalStorage fallback methods
  getGroupsFromLocalStorage() {
    const groups = localStorage.getItem('episodeTracker_groups')
    return groups ? JSON.parse(groups) : []
  },

  saveGroupsToLocalStorage(groups) {
    localStorage.setItem('episodeTracker_groups', JSON.stringify(groups))
    return true
  },

  getSelectedGroupIdFromLocalStorage() {
    return localStorage.getItem('episodeTracker_selectedGroupId')
  },

  saveSelectedGroupIdToLocalStorage(groupId) {
    localStorage.setItem('episodeTracker_selectedGroupId', groupId)
    return true
  },

  getDarkModeFromLocalStorage() {
    return localStorage.getItem('episodeTracker_darkMode') === 'true'
  },

  saveDarkModeToLocalStorage(darkMode) {
    localStorage.setItem('episodeTracker_darkMode', darkMode.toString())
    return true
  }
}
