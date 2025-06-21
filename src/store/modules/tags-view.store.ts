export const useTagsViewStore = defineStore("tagsView", () => {
  const visitedViews = useStorage<TagView[]>("visitedViews", []);
  const cachedViews = useStorage<string[]>("cachedViews", []);
  const router = useRouter();
  const route = useRoute();

  /**
   * 添加已访问视图到已访问视图列表中
   */
  function addVisitedView(view: TagView) {
    if (
      view.path.startsWith("/redirect") ||
      view.path.startsWith("/dashboard") ||
      view.path === "/"
    ) {
      return;
    }

    const index = visitedViews.value.findIndex((v) => v.fullPath === view.fullPath);

    if (index > -1) {
      visitedViews.value[index] = { ...visitedViews.value[index], ...view };
    } else {
      visitedViews.value.push(view);
    }
  }

  function forceAddVisitedView(view: TagView) {
    if (view.path.startsWith("/redirect")) return;
    if (visitedViews.value.some((v) => v.fullPath === view.fullPath)) return;

    visitedViews.value.push(view);
  }

  /**
   * 添加缓存视图到缓存视图列表中
   */
  function addCachedView(view: TagView) {
    const cacheKey = view.fullPath; // ✅ 改用 fullPath 做唯一鍵
    if (cachedViews.value.includes(cacheKey)) return;
    if (view.keepAlive) {
      cachedViews.value.push(cacheKey);
    }
  }

  /**
   * 从已访问视图列表中删除指定的视图
   */
  function delVisitedView(view: TagView) {
    return new Promise((resolve) => {
      for (const [i, v] of visitedViews.value.entries()) {
        if (v.fullPath === view.fullPath) {
          visitedViews.value.splice(i, 1);
          break;
        }
      }
      resolve([...visitedViews.value]);
    });
  }

  function delCachedView(view: TagView) {
    const cacheKey = view.fullPath;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(cacheKey);
      if (index > -1) {
        cachedViews.value.splice(index, 1);
      }
      resolve([...cachedViews.value]);
    });
  }

  function delOtherVisitedViews(view: TagView) {
    return new Promise((resolve) => {
      visitedViews.value = visitedViews.value.filter((v) => {
        return v?.affix || v.path === view.path;
      });
      resolve([...visitedViews.value]);
    });
  }

  function delOtherCachedViews(view: TagView) {
    const viewName = view.name as string;
    return new Promise((resolve) => {
      const index = cachedViews.value.indexOf(viewName);
      if (index > -1) {
        cachedViews.value = cachedViews.value.slice(index, index + 1);
      } else {
        // if index = -1, there is no cached tags
        cachedViews.value = [];
      }
      resolve([...cachedViews.value]);
    });
  }

  function updateVisitedView(view: TagView) {
    if (visitedViews.value.flatMap((e) => e.fullPath).includes(view.fullPath)) return;

    for (let v of visitedViews.value) {
      if (v.fullPath === selectedFullPath.value) {
        Object.assign(v, view);
        break;
      }
    }
  }

  function addView(view: TagView) {
    addVisitedView(view);
    addCachedView(view);
  }

  function delView(view: TagView) {
    return new Promise((resolve) => {
      delVisitedView(view);
      delCachedView(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delOtherViews(view: TagView) {
    return new Promise((resolve) => {
      delOtherVisitedViews(view);
      delOtherCachedViews(view);
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delLeftViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index >= currIndex || item?.affix) {
          return true;
        }

        const cacheIndex = cachedViews.value.indexOf(item.name);
        if (cacheIndex > -1) {
          cachedViews.value.splice(cacheIndex, 1);
        }
        return false;
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delRightViews(view: TagView) {
    return new Promise((resolve) => {
      const currIndex = visitedViews.value.findIndex((v) => v.path === view.path);
      if (currIndex === -1) {
        return;
      }
      visitedViews.value = visitedViews.value.filter((item, index) => {
        if (index <= currIndex || item?.affix) {
          return true;
        }
      });
      resolve({
        visitedViews: [...visitedViews.value],
      });
    });
  }

  function delAllViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      cachedViews.value = [];
      resolve({
        visitedViews: [...visitedViews.value],
        cachedViews: [...cachedViews.value],
      });
    });
  }

  function delAllVisitedViews() {
    return new Promise((resolve) => {
      const affixTags = visitedViews.value.filter((tag) => tag?.affix);
      visitedViews.value = affixTags;
      resolve([...visitedViews.value]);
    });
  }

  function delAllCachedViews() {
    return new Promise((resolve) => {
      cachedViews.value = [];
      resolve([...cachedViews.value]);
    });
  }

  /**
   * 关闭当前tagView
   */
  function closeCurrentView() {
    const tags: TagView = {
      name: route.name as string,
      title: route.meta.title as string,
      path: route.path,
      fullPath: route.fullPath,
      affix: route.meta?.affix,
      keepAlive: route.meta?.keepAlive,
      query: route.query,
    };
    delView(tags).then((res: any) => {
      if (isActive(tags)) {
        toLastView(res.visitedViews);
      }
    });
  }

  function isActive(tag: TagView) {
    return tag.fullPath === route.fullPath;
  }

  const selectedFullPath = ref("");
  watch(
    () => route.fullPath,
    (newFullPath, oldFullRoute) => {
      selectedFullPath.value = oldFullRoute ?? "";
    },
    {
      immediate: true,
    }
  );

  function toLastView(visitedViews: TagView[]) {
    const latestView = visitedViews.slice(-1)[0];
    if (latestView && latestView.fullPath) {
      router.push(latestView.fullPath);
    } else {
      router.push("/dashboard");
    }
  }

  watch(
    () => visitedViews.value.length,
    (newLen) => {
      if (newLen === 0) {
        router.push("/dashboard");
      }
    }
  );

  return {
    visitedViews,
    cachedViews,
    addVisitedView,
    addCachedView,
    delVisitedView,
    delCachedView,
    delOtherVisitedViews,
    delOtherCachedViews,
    updateVisitedView,
    addView,
    delView,
    delOtherViews,
    delLeftViews,
    delRightViews,
    delAllViews,
    delAllVisitedViews,
    delAllCachedViews,
    closeCurrentView,
    isActive,
    toLastView,
    forceAddVisitedView,
  };
});
