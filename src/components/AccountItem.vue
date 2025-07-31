<template>
  <Card class="w-full">
    <CardContent class="p-6">
      <div class="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div class="space-y-2">
          <Label for="tags">Метка</Label>
          <Input
              id="tags"
              v-model="formData.tags"
              @blur="handleTagsBlur"
              placeholder="Введите метки через ;"
              :maxlength="50"
          />
        </div>

        <div class="space-y-2">
          <Label for="type">Тип записи *</Label>
          <Select v-model="formData.type" @update:model-value="handleTypeChange">
            <SelectTrigger>
              <SelectValue placeholder="Выберите тип" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Локальная">Локальная</SelectItem>
              <SelectItem value="LDAP">LDAP</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div class="space-y-2">
          <Label for="login">Логин *</Label>
          <Input
              id="login"
              v-model="formData.login"
              @blur="handleLoginBlur"
              placeholder="Введите логин"
              :maxlength="100"
              :class="loginError ? 'border-destructive focus-visible:ring-destructive' : ''"
          />
        </div>

        <div v-if="formData.type === 'Локальная'" class="space-y-2">
          <Label for="password">Пароль *</Label>
          <Input
              id="password"
              v-model="formData.password"
              @blur="handlePasswordBlur"
              type="password"
              placeholder="Введите пароль"
              :maxlength="100"
              :class="passwordError ? 'border-destructive focus-visible:ring-destructive' : ''"
          />
        </div>

        <div v-else class="space-y-2">
          <div class="h-6"></div>
          <div class="h-10"></div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <Button
            variant="destructive"
            size="sm"
            @click="handleDelete"
        >
          <Trash2 class="w-4 h-4 mr-2" />
          Удалить
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import type { Account } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2 } from 'lucide-vue-next';

interface Props {
  account: Account;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  delete: [];
}>();

const accountsStore = useAccountsStore();

const formData = reactive({
  tags: props.account.tags.map(tag => tag.text).join(';'),
  type: props.account.type,
  login: props.account.login,
  password: props.account.password || ''
});

const loginError = ref(false);
const passwordError = ref(false);

const validateAndUpdate = () => {
  const tags = accountsStore.parseTagsFromString(formData.tags);
  const password = formData.type === 'LDAP' ? null : formData.password;

  const updatedAccount: Account = {
    ...props.account,
    tags,
    type: formData.type,
    login: formData.login,
    password
  };

  loginError.value = !formData.login.trim();
  passwordError.value = formData.type === 'Локальная' && !formData.password.trim();

  if (accountsStore.validateAccount(updatedAccount)) {
    accountsStore.updateAccount(props.account.id, {
      tags,
      type: formData.type,
      login: formData.login,
      password
    });
  }
};

const handleTagsBlur = () => {
  validateAndUpdate();
};

const handleLoginBlur = () => {
  validateAndUpdate();
};

const handlePasswordBlur = () => {
  validateAndUpdate();
};

const handleTypeChange = () => {
  if (formData.type === 'LDAP') {
    formData.password = '';
    passwordError.value = false;
  }
  validateAndUpdate();
};

const handleDelete = () => {
  emit('delete');
};

watch(() => props.account.type, (newType) => {
  if (newType !== formData.type) {
    formData.type = newType;
  }
});
</script>