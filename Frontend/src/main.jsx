import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { copy } from './content'
import AppProviders from './providers/AppProviders.jsx'

document.title = copy.app.title;

createRoot(document.getElementById('root')).render(
    <AppProviders>
        <App />
    </AppProviders>,
)
