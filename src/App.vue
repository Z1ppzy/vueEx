<template>
  <div class="min-h-screen bg-background">
    <div class="container mx-auto px-4 py-8 max-w-7xl">
      <Card class="w-full">
        <CardHeader>
          <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle class="text-2xl font-bold">
                Управление учетными записями
              </CardTitle>
              <CardDescription class="mt-2">
                Создание и управление учетными записями пользователей
              </CardDescription>
            </div>
            <Button @click="addNewAccount" size="lg" class="w-full sm:w-auto">
              <Plus class="w-4 h-4 mr-2" />
              Добавить запись
            </Button>
          </div>
        </CardHeader>

        <CardContent class="space-y-6">
          <Alert>
            <Info class="h-4 w-4" />
            <AlertTitle>Подсказка для поля "Метка"</AlertTitle>
            <AlertDescription>
              В поле "Метка" вводятся текстовые метки, разделенные знаком ";".
              Максимальная длина поля: 50 символов. Поле необязательно для заполнения.
            </AlertDescription>
          </Alert>

          <Alert v-if="showSuccessAlert" class="border-green-200 bg-green-50">
            <CheckCircle class="h-4 w-4 text-green-600" />
            <AlertTitle class="text-green-800">Успешно!</AlertTitle>
            <AlertDescription class="text-green-700">
              {{ successMessage }}
            </AlertDescription>
          </Alert>

          <div v-if="!accountsStore.isLoaded" class="text-center py-8">
            <div class="text-muted-foreground">Загрузка...</div>
          </div>

          <div v-else-if="accountsStore.accounts.length === 0" class="text-center py-12">
            <div class="flex flex-col items-center space-y-4">
              <div class="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                <Users class="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h3 class="text-lg font-semibold text-foreground">
                  Нет учетных записей
                </h3>
                <p class="text-muted-foreground mt-1">
                  Нажмите кнопку "Добавить запись" чтобы создать первую учетную запись
                </p>
              </div>
              <Button @click="addNewAccount" variant="outline">
                <Plus class="w-4 h-4 mr-2" />
                Создать первую запись
              </Button>
            </div>
          </div>

          <div v-else class="space-y-4">
            <div class="flex justify-between items-center">
              <div class="text-sm text-muted-foreground">
                Всего записей: {{ accountsStore.accounts.length }}
              </div>
              <Button @click="showClearDialog = true" variant="outline" size="sm">
                <Trash2 class="w-4 h-4 mr-2" />
                Очистить все данные
              </Button>
            </div>
            <TransitionGroup
                name="list"
                tag="div"
                class="space-y-4"
            >
              <AccountItem
                  v-for="account in accountsStore.accounts"
                  :key="account.id"
                  :account="account"
                  @delete="showDeleteDialog(account.id)"
              />
            </TransitionGroup>
          </div>
        </CardContent>
      </Card>
    </div>

    <AlertDialog :open="showDeleteAccountDialog" @update:open="showDeleteAccountDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-500" />
            Подтверждение удаления
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить эту учетную запись?
            Это действие нельзя будет отменить.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="cancelDelete">Отмена</AlertDialogCancel>
          <AlertDialogAction @click="confirmDeleteAccount" class="bg-red-600 hover:bg-red-700">
            <Trash2 class="w-4 h-4 mr-2" />
            Удалить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>

    <AlertDialog :open="showClearDialog" @update:open="showClearDialog = $event">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle class="flex items-center gap-2">
            <AlertTriangle class="w-5 h-5 text-red-500" />
            Очистить все данные
          </AlertDialogTitle>
          <AlertDialogDescription>
            Вы действительно хотите удалить все учетные записи?
            Все данные будут безвозвратно потеряны.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel @click="showClearDialog = false">Отмена</AlertDialogCancel>
          <AlertDialogAction @click="confirmClearAll" class="bg-red-600 hover:bg-red-700">
            <Trash2 class="w-4 h-4 mr-2" />
            Очистить все
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useAccountsStore } from '@/stores/accounts';
import AccountItem from '@/components/AccountItem.vue';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Users, Info, CheckCircle, Trash2, AlertTriangle } from 'lucide-vue-next';

interface Account {
  id: string;
  [key: string]: any;
}

const accountsStore = useAccountsStore();

const showDeleteAccountDialog = ref(false);
const showClearDialog = ref(false);
const showSuccessAlert = ref(false);
const successMessage = ref('');
const accountToDelete = ref<string | null>(null);

const addNewAccount = () => {
  accountsStore.addAccount();
  showSuccessNotification('Новая учетная запись добавлена');
};

const showDeleteDialog = (id: string) => {
  accountToDelete.value = id;
  showDeleteAccountDialog.value = true;
};

const confirmDeleteAccount = () => {
  if (accountToDelete.value) {
    accountsStore.deleteAccount(accountToDelete.value);
    showSuccessNotification('Учетная запись успешно удалена');
    cancelDelete();
  }
};

const cancelDelete = () => {
  showDeleteAccountDialog.value = false;
  accountToDelete.value = null;
};

const confirmClearAll = () => {
  const count = accountsStore.accounts.length;
  accountsStore.accounts = [];
  showClearDialog.value = false;
  showSuccessNotification(`Удалено ${count} учетных записей`);
};

const showSuccessNotification = (message: string) => {
  successMessage.value = message;
  showSuccessAlert.value = true;

  setTimeout(() => {
    showSuccessAlert.value = false;
  }, 3000);
};

onMounted(() => {
  accountsStore.loadAccounts();
});
</script>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}

.list-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.list-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

.list-move {
  transition: transform 0.3s ease;
}
</style>