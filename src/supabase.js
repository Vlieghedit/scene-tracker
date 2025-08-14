import { createClient } from '@supabase/supabase-js'

// Replace these with your actual Supabase credentials
// You'll get these from your Supabase project dashboard
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database service functions
export const dbService = {
  // Groups
  async getGroups() {
    const { data, error } = await supabase
      .from('groups')
      .select('*')
      .order('created_at', { ascending: true })
    
    if (error) {
      console.error('Error fetching groups:', error)
      return []
    }
    return data || []
  },

  async saveGroups(groups) {
    // First, delete all existing groups
    const { error: deleteError } = await supabase
      .from('groups')
      .delete()
      .neq('id', 0) // Delete all records
    
    if (deleteError) {
      console.error('Error deleting groups:', deleteError)
      return false
    }

    // Then insert all groups
    if (groups.length > 0) {
      const { error: insertError } = await supabase
        .from('groups')
        .insert(groups)
      
      if (insertError) {
        console.error('Error inserting groups:', insertError)
        return false
      }
    }
    
    return true
  },

  // Selected group ID
  async getSelectedGroupId() {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('selected_group_id')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching selected group ID:', error)
      return null
    }
    return data?.selected_group_id || null
  },

  async saveSelectedGroupId(groupId) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ 
        id: 1, // Single row for user preferences
        selected_group_id: groupId 
      })
    
    if (error) {
      console.error('Error saving selected group ID:', error)
      return false
    }
    return true
  },

  // Dark mode preference
  async getDarkMode() {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('dark_mode')
      .single()
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching dark mode preference:', error)
      return false
    }
    return data?.dark_mode || false
  },

  async saveDarkMode(darkMode) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({ 
        id: 1, // Single row for user preferences
        dark_mode: darkMode 
      })
    
    if (error) {
      console.error('Error saving dark mode preference:', error)
      return false
    }
    return true
  }
}
