<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <TransitionGroup
          name="toast"
          tag="div"
          class="space-y-2"
      >
        <div
            v-for="toast in toasts"
            :key="toast.id"
            class="bg-card border shadow-lg rounded-lg p-4 min-w-80 max-w-md"
        >
          <div class="flex items-start gap-3">
            <div class="flex-shrink-0">
              <CheckCircle v-if="toast.type === 'success'" class="w-5 h-5 text-green-600" />
              <AlertTriangle v-else-if="toast.type === 'error'" class="w-5 h-5 text-red-600" />
              <Info v-else class="w-5 h-5 text-blue-600" />
            </div>

            <div class="flex-1 min-w-0">
              <div class="text-sm font-medium text-foreground">
                {{ toast.title }}
              </div>
              <div v-if="toast.message" class="text-sm text-muted-foreground mt-1">
                {{ toast.message }}
              </div>
            </div>

            <button
                @click="removeToast(toast.id)"
                class="flex-shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X class="w-4 h-4" />
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { CheckCircle, AlertTriangle, Info, X } from 'lucide-vue-next';
import { useToastStore } from '@/stores/toats.ts';

const toastStore = useToastStore();
const { toasts, removeToast } = toastStore;
</script>

<style scoped>
.toast-enter-active {
  transition: all 0.3s ease-out;
}

.toast-leave-active {
  transition: all 0.3s ease-in;
}

.toast-enter-from {
  opacity: 0;
  transform: translateX(100%);
}

.toast-leave-to {
  opacity: 0;
  transform: translateX(100%);
}

.toast-move {
  transition: transform 0.3s ease;
}
</style>