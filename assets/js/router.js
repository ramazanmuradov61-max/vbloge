const normalizePath = (path) => {
  const clean = String(path || "").replace(/^#/, "").replace(/^\/?/, "/");
  return clean === "/" ? "/home" : clean.replace(/\/$/, "") || "/home";
};

const matchRoute = (pattern, path) => {
  const patternParts = normalizePath(pattern).split("/").filter(Boolean);
  const pathParts = normalizePath(path).split("/").filter(Boolean);

  if (patternParts.length !== pathParts.length) {
    return null;
  }

  const params = {};
  for (let i = 0; i < patternParts.length; i += 1) {
    const patternPart = patternParts[i];
    const pathPart = pathParts[i];

    if (patternPart.startsWith(":")) {
      params[patternPart.slice(1)] = decodeURIComponent(pathPart);
    } else if (patternPart !== pathPart) {
      return null;
    }
  }

  return params;
};

export const getCurrentPath = () => normalizePath(window.location.hash || "/home");

export const createRouter = ({ routes, fallback, onRoute, getStartPath = () => "/home" }) => {
  let currentPath = null;

  const resolve = () => {
    const path = getCurrentPath();
    const route = routes.find((candidate) => matchRoute(candidate.path, path));
    const params = route ? matchRoute(route.path, path) : {};
    currentPath = path;

    onRoute({
      path,
      params,
      route: route || fallback,
    });
  };

  window.addEventListener("hashchange", resolve);

  return {
    start() {
      if (!window.location.hash) {
        this.replace(getStartPath());
        return;
      }
      resolve();
    },
    go(path) {
      const normalized = normalizePath(path);
      if (normalized === currentPath) {
        resolve();
        return;
      }
      window.location.hash = `#${normalized}`;
    },
    replace(path) {
      const normalized = normalizePath(path);
      if (`#${normalized}` === window.location.hash) {
        resolve();
        return;
      }
      window.location.replace(`${window.location.pathname}${window.location.search}#${normalized}`);
    },
    current() {
      return currentPath || getCurrentPath();
    },
  };
};
