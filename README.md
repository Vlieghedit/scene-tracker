# THUIS! Episode Tracker

A React-based episode tracking application that runs completely in your browser using localStorage for data persistence.

## ✨ Features

- **Group Management**: Create and manage different groups of episodes
- **Episode Tracking**: Create, edit, and delete episodes within groups
- **Scene Management**: Add, edit, and delete scenes within episodes
- **Scene States**: Track scene progress with 4 states:
  - Not Ready (black)
  - Ready to Edit (orange)
  - Done (green)
  - Cancelled (red)
- **Progress Tracking**: Visual progress bars for episodes and groups
- **Bulk Operations**: Add multiple scenes at once, advance all scenes in an episode
- **Statistics**: View global statistics across all groups
- **Pagination**: Navigate through episodes with 6 episodes per page
- **Local Storage**: All data is saved locally in your browser

## 🚀 Getting Started

### Prerequisites
- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser** and go to `http://localhost:5173`

## 📁 Project Structure

```
CURSOR APP 1.0/
├── src/
│   ├── App.jsx              # Main React component
│   ├── main.jsx             # React entry point
│   └── index.css            # Tailwind CSS styles
├── index.html               # HTML template
├── package.json             # Dependencies and scripts
├── vite.config.js           # Vite configuration
├── tailwind.config.js       # Tailwind CSS configuration
└── postcss.config.js        # PostCSS configuration
```

## 🛠️ Tech Stack

- **React 18** - Frontend framework
- **Vite** - Build tool and development server
- **Tailwind CSS** - Utility-first CSS framework
- **localStorage** - Browser-based data persistence

## 💾 Data Storage

All data is stored locally in your browser's localStorage:
- **Groups**: `episodeTracker_groups`
- **Episodes**: `episodeTracker_episodes`
- **Scenes**: `episodeTracker_scenes`
- **Selected Group**: `episodeTracker_selectedGroupId`

## 🎯 How to Use

1. **Create Groups**: Click "Add Group" to create a new group
2. **Select Group**: Click on a group to select it
3. **Add Episodes**: Click "Add Episode" to create episodes in the selected group
4. **Add Scenes**: Click "Add Scene" or "Add Multiple Scenes" to add scenes to episodes
5. **Track Progress**: Click on scene state buttons to cycle through states
6. **View Statistics**: Click "Statistics" to see global overview

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🌐 Deployment

Since this is a client-side only application, you can deploy it to any static hosting service:

- **Netlify**: Drag and drop the `dist` folder
- **Vercel**: Connect your GitHub repository
- **GitHub Pages**: Use GitHub Actions to build and deploy
- **Any static hosting**: Upload the built files from `dist/`

## 📱 Browser Compatibility

Works in all modern browsers that support:
- ES6+ JavaScript
- localStorage API
- CSS Grid and Flexbox

## 🔒 Data Privacy

- All data is stored locally in your browser
- No data is sent to external servers
- Your data stays private and on your device

## 🆘 Troubleshooting

**Data not saving?**
- Check if localStorage is enabled in your browser
- Try clearing browser cache and reloading

**App not loading?**
- Make sure you're using a modern browser
- Check the browser console for errors

**Build issues?**
- Delete `node_modules` and run `npm install` again
- Make sure you have Node.js version 14 or higher

## 📄 License

This project is open source and available under the MIT License.



