import { defineStore } from 'pinia';
import { ref } from 'vue';

export interface Toast {
    id: string;
    type: 'success' | 'error' | 'info';
    title: string;
    message?: string;
    duration?: number;
}

export const useToastStore = defineStore('toast', () => {
    const toasts = ref<Toast[]>([]);

    const addToast = (toast: Omit<Toast, 'id'>) => {
        const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
        const duration = toast.duration ?? 3000;

        const newToast: Toast = {
            id,
            ...toast
        };

        toasts.value.push(newToast);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }

        return id;
    };

    const removeToast = (id: string) => {
        const index = toasts.value.findIndex(t => t.id === id);
        if (index !== -1) {
            toasts.value.splice(index, 1);
        }
    };

    const clearAll = () => {
        toasts.value = [];
    };

    const success = (title: string, message?: string, duration?: number) => {
        return addToast({ type: 'success', title, message, duration });
    };

    const error = (title: string, message?: string, duration?: number) => {
        return addToast({ type: 'error', title, message, duration });
    };

    const info = (title: string, message?: string, duration?: number) => {
        return addToast({ type: 'info', title, message, duration });
    };

    return {
        toasts,
        addToast,
        removeToast,
        clearAll,
        success,
        error,
        info
    };
});