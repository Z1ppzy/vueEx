import { defineStore } from 'pinia';
import { ref, watch, computed } from 'vue';
import type { Account, Tag } from '@/types';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'vue-accounts-data';

export const useAccountsStore = defineStore('accounts', () => {
    const _accounts = ref<Account[]>([]);
    const isLoaded = ref(false);

    const accounts = computed({
        get: () => _accounts.value,
        set: (value: Account[]) => {
            _accounts.value = value;
        }
    });

    const loadAccounts = () => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                if (Array.isArray(parsed)) {
                    _accounts.value = parsed;
                }
            }
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            _accounts.value = [];
        }
        isLoaded.value = true;
    };

    const saveAccounts = () => {
        if (!isLoaded.value) return;

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(_accounts.value));
        } catch (error) {
            console.error('Ошибка сохранения данных:', error);
        }
    };

    watch(
        _accounts,
        () => {
            saveAccounts();
        },
        { deep: true }
    );

    const parseTagsFromString = (tagsString: string): Tag[] => {
        if (!tagsString.trim()) return [];
        return tagsString
            .split(';')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)
            .map(tag => ({ text: tag }));
    };

    const addAccount = () => {
        const newAccount: Account = {
            id: uuidv4(),
            tags: [],
            type: 'Локальная',
            login: '',
            password: ''
        };
        _accounts.value.push(newAccount);
        return newAccount.id;
    };

    const updateAccount = (id: string, updates: Partial<Account>) => {
        const index = _accounts.value.findIndex(acc => acc.id === id);
        if (index !== -1) {
            _accounts.value[index] = { ..._accounts.value[index], ...updates };
        }
    };

    const deleteAccount = (id: string) => {
        _accounts.value = _accounts.value.filter(acc => acc.id !== id);
    };

    const validateAccount = (account: Account): boolean => {
        if (!account.login.trim()) return false;
        if (account.type === 'Локальная' && !account.password?.trim()) return false;
        return true;
    };

    return {
        accounts,
        isLoaded,
        loadAccounts,
        parseTagsFromString,
        addAccount,
        updateAccount,
        deleteAccount,
        validateAccount
    };
});