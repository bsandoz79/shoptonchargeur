import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/base.css';
import { surveillerApparitions } from './effets';

const racine = document.getElementById('root')!;
surveillerApparitions(racine);
createRoot(racine).render(<StrictMode><App /></StrictMode>);
