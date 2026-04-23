type DebugEntry = {
  ts: string;
  type: string;
  payload?: unknown;
};

type DebugWindow = Window & {
  __PP_DOM_DEBUG_EVENTS__?: DebugEntry[];
  __PP_DOM_DEBUG_INSTALLED__?: boolean;
};

const MAX_EVENTS = 200;

function getDebugWindow(): DebugWindow {
  return window as DebugWindow;
}

function safeDescribeNode(node: Node | null | undefined): string {
  if (!node) return "null";
  if (node instanceof Element) {
    const id = node.id ? `#${node.id}` : "";
    const className = node.className && typeof node.className === "string"
      ? "." + node.className.trim().split(/\s+/).slice(0, 3).join(".")
      : "";
    return `<${node.tagName.toLowerCase()}${id}${className}>`;
  }
  return node.nodeName;
}

function pushEvent(type: string, payload?: unknown): void {
  const w = getDebugWindow();
  const list = w.__PP_DOM_DEBUG_EVENTS__ ?? [];
  list.push({
    ts: new Date().toISOString(),
    type,
    payload,
  });
  if (list.length > MAX_EVENTS) {
    list.splice(0, list.length - MAX_EVENTS);
  }
  w.__PP_DOM_DEBUG_EVENTS__ = list;
}

function isEnabled(): boolean {
  try {
    const byStorage = window.localStorage.getItem("pp_dom_debug") === "1";
    const byQuery = new URLSearchParams(window.location.search).get("domDebug") === "1";
    return byStorage || byQuery;
  } catch {
    return false;
  }
}

export function setupDomDebugging(): void {
  if (typeof window === "undefined" || !isEnabled()) return;

  const w = getDebugWindow();
  if (w.__PP_DOM_DEBUG_INSTALLED__) return;
  w.__PP_DOM_DEBUG_INSTALLED__ = true;

  pushEvent("dom-debug:enabled", {
    href: window.location.href,
    ua: navigator.userAgent,
  });

  const nativeInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function patchedInsertBefore<T extends Node>(
    newChild: T,
    refChild: Node | null
  ): T {
    try {
      return nativeInsertBefore.call(this, newChild, refChild) as T;
    } catch (error) {
      pushEvent("dom:insertBefore:error", {
        error: error instanceof Error ? error.message : String(error),
        parent: safeDescribeNode(this),
        newChild: safeDescribeNode(newChild),
        refChild: safeDescribeNode(refChild),
        parentContainsRef: !!(refChild && this.contains(refChild)),
      });
      throw error;
    }
  };

  const nativeRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function patchedRemoveChild<T extends Node>(child: T): T {
    try {
      return nativeRemoveChild.call(this, child) as T;
    } catch (error) {
      pushEvent("dom:removeChild:error", {
        error: error instanceof Error ? error.message : String(error),
        parent: safeDescribeNode(this),
        child: safeDescribeNode(child),
        parentContainsChild: this.contains(child),
      });
      throw error;
    }
  };

  window.addEventListener("error", (event) => {
    pushEvent("window:error", {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    pushEvent("window:unhandledrejection", {
      reason:
        event.reason instanceof Error
          ? { message: event.reason.message, stack: event.reason.stack }
          : String(event.reason),
    });
  });

  console.info("[PP DOM debug] active. Disable: localStorage.removeItem('pp_dom_debug')");
}

export function pushDomDebugEvent(type: string, payload?: unknown): void {
  if (typeof window === "undefined") return;
  const w = getDebugWindow();
  if (!w.__PP_DOM_DEBUG_INSTALLED__) return;
  pushEvent(type, payload);
}

