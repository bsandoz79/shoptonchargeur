import type { Chargeur, Telephone } from '../moteur/types';
import chargeurs from './chargeurs.json';
import telephones from './telephones.json';

export const TELEPHONES = telephones as Telephone[];
export const CHARGEURS = chargeurs as Chargeur[];
