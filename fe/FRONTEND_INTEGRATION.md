# Frontend Integration Guide - CRUD Features

This guide explains how to use the newly implemented CRUD features for Favorites, Alerts, and Notes in the frontend.

## 📌 Favorites

### Hook: `useFavorites`

```jsx
import { useFavorites } from '../hooks/useFavorites';

function MyComponent() {
  const { 
    favorites, 
    isLoading, 
    error,
    addFavorite, 
    removeFavorite, 
    isFavorite,
    getSortedFavorites 
  } = useFavorites();

  // Add a favorite
  const handleAddFavorite = async (locationId) => {
    const success = await addFavorite(locationId);
    if (success) {
      console.log('Added to favorites!');
    }
  };

  // Remove a favorite
  const handleRemove = async (id) => {
    await removeFavorite(id);
  };

  // Check if location is favorite
  const checkFavorite = async (locationId) => {
    const result = await isFavorite(locationId);
    console.log('Is favorite:', result);
  };

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error}</p>}
      
      {favorites.map(fav => (
        <div key={fav.id}>
          <h3>{fav.location?.name}</h3>
          <button onClick={() => handleRemove(fav.id)}>Remove</button>
        </div>
      ))}
    </div>
  );
}
```

### Store: `useFavoritesStore`

```jsx
import { useFavoritesStore } from '../store/favoritesStore';

// Direct store access (if needed)
const store = useFavoritesStore();

// Methods available:
// - fetchFavorites() - Fetch all favorites from backend
// - addFavorite(locationId) - Add favorite
// - removeFavorite(id) - Remove favorite
// - checkFavorite(locationId) - Check if location is favorite
```

---

## 🔔 Alerts

### Hook: `useAlerts`

```jsx
import { useAlerts } from '../hooks/useAlerts';

function AlertsComponent() {
  const { 
    rules, 
    isLoading, 
    error,
    addRuleWithValidation, 
    removeRule, 
    updateRule,
    toggleRule,
    getActiveRules,
    AlertType 
  } = useAlerts();

  // Create an alert rule
  const handleCreateAlert = async () => {
    const newRule = {
      locationId: 1,
      type: AlertType.TEMPERATURE_HIGH,
      threshold: 35,
      description: 'Alert when temperature exceeds 35°C'
    };
    
    const success = await addRuleWithValidation(newRule);
    if (success) {
      console.log('Alert created!');
    }
  };

  // Update an alert
  const handleUpdate = async (id) => {
    await updateRule(id, { 
      threshold: 40,
      isActive: true 
    });
  };

  // Toggle alert on/off
  const handleToggle = async (id) => {
    await toggleRule(id);
  };

  // Delete an alert
  const handleDelete = async (id) => {
    await removeRule(id);
  };

  return (
    <div>
      {rules.map(rule => (
        <div key={rule.id}>
          <h4>{rule.type}</h4>
          <p>Threshold: {rule.threshold}</p>
          <p>Active: {rule.isActive ? 'Yes' : 'No'}</p>
          <button onClick={() => handleToggle(rule.id)}>Toggle</button>
          <button onClick={() => handleDelete(rule.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Alert Types

```jsx
import { AlertType } from '../services/alertsService';

// Available alert types:
AlertType.TEMPERATURE_HIGH  // 'temperature_high'
AlertType.TEMPERATURE_LOW   // 'temperature_low'
AlertType.RAIN              // 'rain'
AlertType.WIND              // 'wind'
AlertType.AQI               // 'aqi'
AlertType.HUMIDITY          // 'humidity'
```

### Store: `useAlertsStore`

```jsx
import { useAlertsStore } from '../store/alertsStore';

// Methods available:
// - fetchAlerts() - Fetch all alerts from backend
// - fetchAlertsByLocation(locationId) - Fetch alerts for specific location
// - addRule(rule) - Create new alert rule
// - updateRule(id, updates) - Update alert rule
// - removeRule(id) - Delete alert rule
// - toggleRule(id) - Toggle alert active status
```

---

## 📝 Notes

### Hook: `useNotes`

```jsx
import { useNotes } from '../hooks/useNotes';

function NotesComponent() {
  const { 
    notes, 
    isLoading, 
    error,
    saveNote, 
    deleteNote,
    getNotesGroupedByDate,
    getNotesByLocation,
    autoSaveDraft 
  } = useNotes();

  // Save a note
  const handleSaveNote = async () => {
    const success = await saveNote(
      1, // locationId
      '2025-12-20', // date (YYYY-MM-DD)
      'Weather Observation', // title
      'It was very hot today with clear skies' // content
    );
    
    if (success) {
      console.log('Note saved!');
    }
  };

  // Delete a note
  const handleDelete = async (id) => {
    await deleteNote(id);
  };

  // Get notes for a location
  const handleGetLocationNotes = async (locationId) => {
    const locationNotes = await getNotesByLocation(locationId);
    console.log('Location notes:', locationNotes);
  };

  // Auto-save draft (debounced)
  const handleContentChange = (content) => {
    autoSaveDraft(content, 1, '2025-12-20');
  };

  return (
    <div>
      {notes.map(note => (
        <div key={note.id}>
          <h3>{note.title}</h3>
          <p>{note.content}</p>
          <small>Date: {note.date}</small>
          <button onClick={() => handleDelete(note.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
}
```

### Store: `useNotesStore`

```jsx
import { useNotesStore } from '../store/notesStore';

// Methods available:
// - fetchNotes() - Fetch all notes from backend
// - fetchNotesByLocation(locationId) - Fetch notes for location
// - fetchNotesByDateRange(startDate, endDate) - Fetch notes in date range
// - addNote(note) - Create new note
// - updateNote(id, updates) - Update note
// - deleteNote(id) - Delete note
// - saveDraft(draft) - Save draft for auto-save
// - clearDraft() - Clear saved draft
```

---

## 🔄 Real-time Updates

### Automatic Data Fetching

All hooks automatically fetch data on component mount:

```jsx
// Favorites are fetched automatically
const { favorites } = useFavorites();

// Alerts are fetched automatically
const { rules } = useAlerts();

// Notes are fetched automatically
const { notes } = useNotes();
```

### Manual Refresh

If you need to manually refresh data:

```jsx
const store = useFavoritesStore();
await store.fetchFavorites();

const alertsStore = useAlertsStore();
await alertsStore.fetchAlerts();

const notesStore = useNotesStore();
await notesStore.fetchNotes();
```

---

## 🎨 Example: Complete Component

```jsx
import { useFavorites } from '../hooks/useFavorites';
import { useAlerts } from '../hooks/useAlerts';
import { useNotes } from '../hooks/useNotes';

function WeatherDashboard() {
  const favorites = useFavorites();
  const alerts = useAlerts();
  const notes = useNotes();

  const handleAddFavorite = async (locationId) => {
    await favorites.addFavorite(locationId);
  };

  const handleCreateAlert = async (locationId) => {
    await alerts.addRuleWithValidation({
      locationId,
      type: alerts.AlertType.RAIN,
      threshold: 10,
      description: 'Heavy rain alert'
    });
  };

  const handleSaveNote = async (locationId) => {
    await notes.saveNote(
      locationId,
      new Date().toISOString().split('T')[0],
      'Weather Note',
      'Today was sunny and warm'
    );
  };

  return (
    <div>
      <section>
        <h2>Favorites ({favorites.favorites.length})</h2>
        {favorites.isLoading && <p>Loading...</p>}
        {/* Render favorites */}
      </section>

      <section>
        <h2>Alerts ({alerts.rules.length})</h2>
        {alerts.isLoading && <p>Loading...</p>}
        {/* Render alerts */}
      </section>

      <section>
        <h2>Notes ({notes.notes.length})</h2>
        {notes.isLoading && <p>Loading...</p>}
        {/* Render notes */}
      </section>
    </div>
  );
}
```

---

## 🛠️ Error Handling

All operations include error handling:

```jsx
const { error, clearError } = useFavorites();

useEffect(() => {
  if (error) {
    // Display error to user
    toast.error(error);
    
    // Clear error after displaying
    setTimeout(() => clearError(), 3000);
  }
}, [error]);
```

---

## 📊 Loading States

All operations provide loading states:

```jsx
const { isLoading } = useFavorites();

if (isLoading) {
  return <LoadingSpinner />;
}
```

---

## 💾 Persistence

Data is persisted using Zustand's persist middleware:
- Favorites are cached locally
- Alerts are cached locally
- Notes are cached locally
- Draft notes are auto-saved

Data syncs with backend on:
- Component mount
- Create/Update/Delete operations
- Manual refresh

---

## 🔐 Authentication

All API calls automatically include the authentication token from localStorage:
- Token key: `auth_token` or `access_token`
- Automatic 401 handling (redirect to login if needed)

Make sure users are logged in before using these features!
