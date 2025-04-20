import { writable } from 'svelte/store';

export const messageStore = writable<{ message: string; type: string } | null>(null);