/**
 * Estado compartido de la aplicación.
 * Este archivo centraliza la sesión actual y las referencias del DOM.
 */
import { Banco } from './services/Banco.js';

export const banco = new Banco();

export let actual = null;
export let selectedId = null;
export let authMode = 'login';
export let toastTimer;

export function setActual(cliente) {
    actual = cliente;
}

export function setSelectedId(id) {
    selectedId = id;
}

export function setAuthMode(mode) {
    authMode = mode;
}

// Referencias principales del DOM.
export const $ = selector => document.querySelector(selector);
export const $$ = selector => document.querySelectorAll(selector);
export const landing = $('#landing');
export const auth = $('#auth');
export const app = $('#app');
export const authContent = $('#auth-content');
export const appContent = $('#app-content');

export function setToastTimer(timer) {
    toastTimer = timer;
}
