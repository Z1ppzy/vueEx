export interface Tag {
    text: string;
}

export interface Account {
    id: string;
    tags: Tag[];
    type: 'LDAP' | 'Локальная';
    login: string;
    password: string | null;
}

export interface AccountForm {
    id: string;
    tags: string;
    type: 'LDAP' | 'Локальная';
    login: string;
    password: string;
}