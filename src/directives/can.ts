import { DirectiveBinding } from "vue";
import { usePermissionStore } from "@/store";

export default {
  mounted(el: HTMLElement, binding: DirectiveBinding<string>) {
    const permission = binding.value;

    if (!permission) return;

    const permissionStore = usePermissionStore();

    if (!permissionStore.userPermissions.includes(permission)) {
      el.style.display = "none";
    }
  },
};
