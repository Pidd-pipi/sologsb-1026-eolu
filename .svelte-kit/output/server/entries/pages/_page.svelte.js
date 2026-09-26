import { a as sanitize_props, b as rest_props, e as element, c as bind_props, s as slot, d as attributes, f as spread_props, g as attr, h as attr_class, j as sanitize_slots, k as store_get, l as attr_style, u as unsubscribe_stores, m as ensure_array_like, n as stringify } from "../../chunks/index2.js";
import { a1 as fallback, a2 as invalid_default_snippet, e as escape_html, g as getContext, a0 as setContext } from "../../chunks/context.js";
import { w as writable, g as get, r as readable } from "../../chunks/index.js";
import "clsx";
async function tick() {
}
function uniqueId(prefix = "ccs") {
  return `${prefix}-${Math.random().toString(36).slice(2)}`;
}
function floatingPosition({
  anchorRect: rect,
  floatingRect,
  viewport,
  direction,
  lockedDirection,
  useFixedPosition = false,
  intrinsicWidth = false,
  intrinsicAlign = "center",
  gapTop = 0,
  gapBottom = 0,
  horizontalGapLeft = 0,
  horizontalGapRight = 0,
  verticalAlignOffsetLeft = 0,
  verticalAlignOffsetRight = 0
}) {
  const scrollYOffset = useFixedPosition ? 0 : viewport.scrollY;
  const scrollXOffset = useFixedPosition ? 0 : viewport.scrollX;
  const isVertical = direction === "top" || direction === "bottom";
  let actualDirection = direction;
  if (lockedDirection) {
    actualDirection = lockedDirection;
  } else if (isVertical) {
    const spaceBelow = viewport.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    if (direction === "bottom" && spaceBelow < floatingRect.height && spaceAbove > spaceBelow) {
      actualDirection = "top";
    } else if (direction === "top" && spaceAbove < floatingRect.height && spaceBelow > spaceAbove) {
      actualDirection = "bottom";
    }
  } else {
    const spaceRight = viewport.innerWidth - rect.right;
    const spaceLeft = rect.left;
    if (direction === "right" && spaceRight < floatingRect.width + horizontalGapRight && spaceLeft > spaceRight) {
      actualDirection = "left";
    } else if (direction === "left" && spaceLeft < floatingRect.width + horizontalGapLeft && spaceRight > spaceLeft) {
      actualDirection = "right";
    }
  }
  let top;
  let left;
  let width;
  if (actualDirection === "bottom") {
    top = rect.bottom + scrollYOffset + gapBottom;
    left = rect.left + scrollXOffset;
    width = rect.width;
  } else if (actualDirection === "top") {
    top = rect.top + scrollYOffset - floatingRect.height - gapTop;
    left = rect.left + scrollXOffset;
    width = rect.width;
  } else if (actualDirection === "right") {
    if (intrinsicWidth) {
      if (intrinsicAlign === "start") {
        top = rect.top + scrollYOffset + verticalAlignOffsetRight;
      } else if (intrinsicAlign === "end") {
        top = rect.bottom + scrollYOffset - floatingRect.height + verticalAlignOffsetRight;
      } else {
        top = rect.top + scrollYOffset + rect.height / 2 - floatingRect.height / 2 + verticalAlignOffsetRight;
      }
    } else {
      top = rect.top + scrollYOffset + rect.height / 2 - floatingRect.height / 2 + verticalAlignOffsetRight;
    }
    left = rect.right + scrollXOffset + horizontalGapRight;
  } else {
    if (intrinsicWidth) {
      if (intrinsicAlign === "start") {
        top = rect.top + scrollYOffset + verticalAlignOffsetLeft;
      } else if (intrinsicAlign === "end") {
        top = rect.bottom + scrollYOffset - floatingRect.height + verticalAlignOffsetLeft;
      } else {
        top = rect.top + scrollYOffset + rect.height / 2 - floatingRect.height / 2 + verticalAlignOffsetLeft;
      }
    } else {
      top = rect.top + scrollYOffset + rect.height / 2 - floatingRect.height / 2 + verticalAlignOffsetLeft;
    }
    left = rect.left + scrollXOffset - floatingRect.width - horizontalGapLeft;
  }
  let posLeft = left;
  let posWidth = width;
  if (intrinsicWidth && (actualDirection === "top" || actualDirection === "bottom")) {
    if (intrinsicAlign === "center") {
      posLeft = rect.left + scrollXOffset + rect.width / 2;
    } else if (intrinsicAlign === "start") {
      posLeft = rect.left + scrollXOffset;
    } else {
      posLeft = rect.right + scrollXOffset;
    }
    posWidth = void 0;
  }
  let caretNudgePx;
  if (intrinsicWidth && (actualDirection === "top" || actualDirection === "bottom") && (intrinsicAlign === "start" || intrinsicAlign === "end")) {
    caretNudgePx = rect.width / 2;
  }
  return {
    top,
    left: posLeft,
    ...posWidth !== void 0 && { width: posWidth },
    actualDirection,
    caretNudgePx
  };
}
const SCROLLABLE_OVERFLOW_REGEX = /(auto|scroll)/;
function getScrollableAncestors(node) {
  const result = [];
  let current = node.parentElement;
  while (current) {
    const { overflow, overflowX, overflowY } = getComputedStyle(current);
    if (SCROLLABLE_OVERFLOW_REGEX.test(overflow + overflowY + overflowX)) {
      result.push(current);
    }
    current = current.parentElement;
  }
  return result;
}
function rafThrottle(fn) {
  let rafId = null;
  let pendingArgs;
  function throttled(...args) {
    pendingArgs = args;
    if (rafId !== null) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const args2 = pendingArgs;
      pendingArgs = void 0;
      if (args2) fn(...args2);
    });
  }
  throttled.cancel = () => {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
    pendingArgs = void 0;
  };
  return throttled;
}
const pools = /* @__PURE__ */ new Map();
function poolKey(type, options) {
  let capture = false;
  let passive = false;
  let once = false;
  if (typeof options === "boolean") {
    capture = options;
  } else if (options) {
    capture = !!options.capture;
    passive = !!options.passive;
    once = !!options.once;
  }
  return `${type} ${capture ? 1 : 0}${passive ? 1 : 0}${once ? 1 : 0}`;
}
function registerConsumer(spec) {
  const key = poolKey(spec.type, spec.options);
  let pool = pools.get(key);
  if (!pool) {
    const consumers = (
      /** @type {Set<Consumer>} */
      /* @__PURE__ */ new Set()
    );
    const listener = (event) => {
      for (const consumer2 of [...consumers]) {
        if (consumers.has(consumer2)) consumer2.handler(event);
      }
    };
    pool = { type: spec.type, options: spec.options, listener, consumers };
    pools.set(key, pool);
    window.addEventListener(spec.type, listener, spec.options);
  }
  const consumer = { handler: spec.handler };
  pool.consumers.add(consumer);
  return { key, pool, consumer };
}
function unregisterConsumer({ key, pool, consumer }) {
  pool.consumers.delete(consumer);
  if (pool.consumers.size === 0) {
    window.removeEventListener(pool.type, pool.listener, pool.options);
    pools.delete(key);
  }
}
function addPooledListener(type, handler, options) {
  const entry = registerConsumer({ type, handler, options });
  return () => unregisterConsumer(entry);
}
function Portal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["tag", "target", "ref"]);
  $$renderer.component(($$renderer2) => {
    let tag = fallback($$props["tag"], "div");
    let target = fallback($$props["target"], null);
    let ref = fallback($$props["ref"], null);
    element(
      $$renderer2,
      tag,
      () => {
        $$renderer2.push(`${attributes({ "data-portal": true, ...$$restProps })}`);
      },
      () => {
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", {}, null);
        $$renderer2.push(`<!--]-->`);
      }
    );
    bind_props($$props, { tag, target, ref });
  });
}
function FloatingPortal($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "anchor",
    "direction",
    "open",
    "gapTop",
    "gapBottom",
    "horizontalGapLeft",
    "horizontalGapRight",
    "verticalAlignOffsetLeft",
    "verticalAlignOffsetRight",
    "zIndex",
    "intrinsicWidth",
    "intrinsicAlign",
    "lockDirection",
    "ref",
    "target"
  ]);
  $$renderer.component(($$renderer2) => {
    let effectiveTarget, useFixedPosition, actualDirection, useIntrinsicWidthVertical, intrinsicTranslateX, portalStyle;
    let anchor = $$props["anchor"];
    let direction = fallback($$props["direction"], "bottom");
    let open = fallback($$props["open"], false);
    let gapTop = fallback($$props["gapTop"], 0);
    let gapBottom = fallback($$props["gapBottom"], 0);
    let horizontalGapLeft = fallback($$props["horizontalGapLeft"], 0);
    let horizontalGapRight = fallback($$props["horizontalGapRight"], 0);
    let verticalAlignOffsetLeft = fallback($$props["verticalAlignOffsetLeft"], 0);
    let verticalAlignOffsetRight = fallback($$props["verticalAlignOffsetRight"], 0);
    let zIndex = fallback($$props["zIndex"], 9200);
    let intrinsicWidth = fallback($$props["intrinsicWidth"], false);
    let intrinsicAlign = fallback($$props["intrinsicAlign"], "center");
    let lockDirection = fallback($$props["lockDirection"], "none");
    let ref = fallback($$props["ref"], null);
    let target = fallback($$props["target"], null);
    let scrollableAncestors = [];
    function addScrollListeners() {
      for (const el of scrollableAncestors) {
        el.addEventListener("scroll", scheduleUpdate, { passive: true });
      }
    }
    function removeScrollListeners() {
      for (const el of scrollableAncestors) {
        el.removeEventListener("scroll", scheduleUpdate);
      }
    }
    let unlistenWindowScroll = null;
    let unlistenWindowResize = null;
    function addWindowListeners() {
      if (!unlistenWindowScroll) {
        unlistenWindowScroll = addPooledListener("scroll", scheduleUpdate, { passive: true });
      }
      if (!unlistenWindowResize) {
        unlistenWindowResize = addPooledListener("resize", scheduleUpdate, { passive: true });
      }
    }
    function removeWindowListeners() {
      unlistenWindowScroll?.();
      unlistenWindowScroll = null;
      unlistenWindowResize?.();
      unlistenWindowResize = null;
    }
    let pos = {
      top: 0,
      left: 0,
      width: 0,
      actualDirection: direction,
      caretNudgePx: void 0
    };
    let anchorObserver = null;
    function observeAnchor() {
      if (!anchor || anchorObserver) return;
      anchorObserver = new MutationObserver(scheduleUpdate);
      anchorObserver.observe(anchor, {
        attributes: true,
        attributeFilter: ["style", "class"],
        childList: false,
        subtree: false
      });
    }
    function unobserveAnchor() {
      if (anchorObserver && anchor) {
        anchorObserver.disconnect();
        anchorObserver = null;
      }
    }
    let floatingObserver = null;
    function observeFloating() {
      if (!ref || floatingObserver || typeof ResizeObserver === "undefined") {
        return;
      }
      floatingObserver = new ResizeObserver(() => updatePosition());
      floatingObserver.observe(ref);
    }
    function unobserveFloating() {
      if (floatingObserver) {
        floatingObserver.disconnect();
        floatingObserver = null;
      }
    }
    let lockedDirection = null;
    function updatePosition() {
      if (!anchor || !ref) return;
      pos = floatingPosition({
        anchorRect: anchor.getBoundingClientRect(),
        floatingRect: ref.getBoundingClientRect(),
        viewport: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight,
          scrollX: window.scrollX,
          scrollY: window.scrollY
        },
        direction,
        lockedDirection: lockedDirection ?? void 0,
        useFixedPosition,
        intrinsicWidth,
        intrinsicAlign,
        gapTop,
        gapBottom,
        horizontalGapLeft,
        horizontalGapRight,
        verticalAlignOffsetLeft,
        verticalAlignOffsetRight
      });
      if (lockDirection === "after-flip" && lockedDirection === null && pos.actualDirection !== direction) {
        lockedDirection = pos.actualDirection;
      }
    }
    function lockAfterSettling() {
      if (lockDirection === "always" && lockedDirection === null) {
        lockedDirection = pos.actualDirection;
      }
    }
    const scheduleUpdate = rafThrottle(updatePosition);
    effectiveTarget = target ?? anchor?.closest("dialog,[popover]") ?? null;
    useFixedPosition = effectiveTarget != null && typeof document !== "undefined" && effectiveTarget !== document.body;
    actualDirection = pos.actualDirection;
    useIntrinsicWidthVertical = intrinsicWidth && (actualDirection === "top" || actualDirection === "bottom");
    intrinsicTranslateX = useIntrinsicWidthVertical ? intrinsicAlign === "center" ? "transform: translateX(-50%)" : intrinsicAlign === "end" ? "transform: translateX(-100%)" : null : null;
    portalStyle = [
      useFixedPosition ? "position: fixed" : "position: absolute",
      `top: ${pos.top}px`,
      `left: ${pos.left}px`,
      intrinsicTranslateX,
      !useIntrinsicWidthVertical && pos.width != null ? `width: ${pos.width}px` : null,
      `z-index: ${zIndex}`,
      pos.caretNudgePx == null ? null : `--ccs-tooltip-caret-nudge: ${pos.caretNudgePx}px`
    ].filter(Boolean).join("; ");
    if (open) {
      addWindowListeners();
    } else {
      removeWindowListeners();
      unobserveAnchor();
      unobserveFloating();
      removeScrollListeners();
      scrollableAncestors = [];
      scheduleUpdate.cancel();
      lockedDirection = null;
    }
    if (open && anchor && ref) {
      unobserveAnchor();
      unobserveFloating();
      removeScrollListeners();
      scrollableAncestors = getScrollableAncestors(anchor);
      addScrollListeners();
      observeAnchor();
      observeFloating();
      tick().then(() => {
        updatePosition();
        const needsSecondLayoutPass = direction === "left" || direction === "right" || intrinsicWidth && (direction === "top" || direction === "bottom");
        if (needsSecondLayoutPass) {
          requestAnimationFrame(() => {
            updatePosition();
            lockAfterSettling();
          });
        } else {
          lockAfterSettling();
        }
      });
    }
    let $$settled = true;
    let $$inner_renderer;
    function $$render_inner($$renderer3) {
      if (open) {
        $$renderer3.push("<!--[-->");
        Portal($$renderer3, spread_props([
          { target: effectiveTarget },
          $$restProps,
          {
            "data-floating-portal": true,
            "data-floating-direction": pos.actualDirection,
            "data-floating-intrinsic-align": intrinsicWidth ? intrinsicAlign : void 0,
            style: portalStyle,
            get ref() {
              return ref;
            },
            set ref($$value) {
              ref = $$value;
              $$settled = false;
            },
            children: ($$renderer4) => {
              $$renderer4.push(`<!--[-->`);
              slot($$renderer4, $$props, "default", { direction: actualDirection }, null);
              $$renderer4.push(`<!--]-->`);
            },
            $$slots: { default: true }
          }
        ]));
      } else {
        $$renderer3.push("<!--[!-->");
      }
      $$renderer3.push(`<!--]-->`);
    }
    do {
      $$settled = true;
      $$inner_renderer = $$renderer2.copy();
      $$render_inner($$inner_renderer);
    } while (!$$settled);
    $$renderer2.subsume($$inner_renderer);
    bind_props($$props, {
      anchor,
      direction,
      open,
      gapTop,
      gapBottom,
      horizontalGapLeft,
      horizontalGapRight,
      verticalAlignOffsetLeft,
      verticalAlignOffsetRight,
      zIndex,
      intrinsicWidth,
      intrinsicAlign,
      lockDirection,
      ref,
      target
    });
  });
}
function PortalTooltip($$renderer, $$props) {
  let anchor = fallback($$props["anchor"], null);
  let direction = fallback($$props["direction"], "top");
  let open = fallback($$props["open"], false);
  let text = fallback($$props["text"], "");
  let tooltipType = fallback($$props["tooltipType"], void 0);
  let id = fallback($$props["id"], void 0);
  let horizontalGapLeft = fallback($$props["horizontalGapLeft"], 0);
  let horizontalGapRight = fallback($$props["horizontalGapRight"], 0);
  let gapTop = fallback($$props["gapTop"], 0);
  let gapBottom = fallback($$props["gapBottom"], 0);
  let verticalAlignOffsetLeft = fallback($$props["verticalAlignOffsetLeft"], 0);
  let verticalAlignOffsetRight = fallback($$props["verticalAlignOffsetRight"], 0);
  let intrinsicAlign = fallback($$props["intrinsicAlign"], "center");
  FloatingPortal($$renderer, {
    anchor,
    direction,
    open,
    horizontalGapLeft,
    horizontalGapRight,
    gapTop,
    gapBottom,
    verticalAlignOffsetLeft,
    verticalAlignOffsetRight,
    intrinsicAlign,
    intrinsicWidth: true,
    lockDirection: "after-flip",
    children: invalid_default_snippet,
    $$slots: {
      default: ($$renderer2, { direction: actualDirection }) => {
        $$renderer2.push(`<div${attr("data-direction", actualDirection ?? direction)}${attr("data-tooltip-type", tooltipType)}${attr_class("", void 0, { "bx--tooltip-portal": true })}><span${attr_class("", void 0, { "bx--tooltip-portal__caret": true })}></span> <span${attr("role", id ? "tooltip" : void 0)}${attr("id", id)}${attr_class("", void 0, {
          "bx--tooltip-portal__content": true,
          "bx--assistive-text": Boolean(tooltipType)
        })}><!--[-->`);
        slot($$renderer2, $$props, "default", {}, () => {
          $$renderer2.push(`${escape_html(text)}`);
        });
        $$renderer2.push(`<!--]--></span></div>`);
      }
    }
  });
  bind_props($$props, {
    anchor,
    direction,
    open,
    text,
    tooltipType,
    id,
    horizontalGapLeft,
    horizontalGapRight,
    gapTop,
    gapBottom,
    verticalAlignOffsetLeft,
    verticalAlignOffsetRight,
    intrinsicAlign
  });
}
function observeModalClose(element2, onClose) {
  const modal = element2.closest(".bx--modal");
  if (!modal) return () => {
  };
  const observer = new MutationObserver(() => {
    if (!modal.classList.contains("is-visible")) {
      onClose();
    }
  });
  observer.observe(modal, {
    attributes: true,
    attributeFilter: ["class"]
  });
  return () => observer.disconnect();
}
function ButtonSkeleton($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["href", "size"]);
  $$renderer.component(($$renderer2) => {
    let href = fallback($$props["href"], void 0);
    let size = fallback($$props["size"], "default");
    if (href) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<a${attributes(
        {
          href,
          rel: $$restProps.target === "_blank" ? "noopener noreferrer" : void 0,
          role: "button",
          ...$$restProps
        },
        void 0,
        {
          "bx--skeleton": true,
          "bx--btn": true,
          "bx--btn--field": size === "field",
          "bx--btn--sm": size === "small",
          "bx--btn--lg": size === "lg",
          "bx--btn--xl": size === "xl"
        }
      )}></a>`);
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...$$restProps }, void 0, {
        "bx--skeleton": true,
        "bx--btn": true,
        "bx--btn--field": size === "field",
        "bx--btn--sm": size === "small",
        "bx--btn--lg": size === "lg",
        "bx--btn--xl": size === "xl"
      })}></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, { href, size });
  });
}
const activeButtonTooltip = writable(null);
function Button($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "kind",
    "size",
    "expressive",
    "isSelected",
    "icon",
    "iconDescription",
    "tooltipAlignment",
    "tooltipPosition",
    "hideTooltip",
    "as",
    "skeleton",
    "disabled",
    "href",
    "tabindex",
    "type",
    "ref",
    "portalTooltip"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let hasIconOnly, hasTooltipContent, effectivePortalTooltip, usePortal, hasTooltip, portalOpen, tooltipHidden, portalHorizontalGapLeft, portalHorizontalGapRight, portalGapTop, portalGapBottom, portalVerticalAlignOffsetLeft, portalVerticalAlignOffsetRight, isDisabled, effectiveSize, iconProps, buttonProps;
    let kind = fallback($$props["kind"], "primary");
    let size = fallback($$props["size"], void 0);
    let expressive = fallback($$props["expressive"], false);
    let isSelected = fallback($$props["isSelected"], false);
    let icon = fallback($$props["icon"], void 0);
    let iconDescription = fallback($$props["iconDescription"], void 0);
    let tooltipAlignment = fallback($$props["tooltipAlignment"], "center");
    let tooltipPosition = fallback($$props["tooltipPosition"], "bottom");
    let hideTooltip = fallback($$props["hideTooltip"], false);
    let as = fallback($$props["as"], false);
    let skeleton = fallback($$props["skeleton"], false);
    let disabled = fallback($$props["disabled"], false);
    let href = fallback($$props["href"], void 0);
    let tabindex = fallback($$props["tabindex"], "0");
    let type = fallback($$props["type"], "button");
    let ref = fallback($$props["ref"], null);
    let portalTooltip = fallback($$props["portalTooltip"], void 0);
    const ctx = getContext("carbon:ComposedModal");
    const insideModal = getContext("carbon:Modal");
    const actionSetSize = getContext("carbon:ActionSet")?.size;
    const tooltipId = {};
    let hovered = false;
    let focused = false;
    let portalTimeout;
    function releaseActiveTooltip() {
      if (get(activeButtonTooltip) === tooltipId) {
        activeButtonTooltip.set(null);
      }
    }
    function dismissPortalTooltip() {
      clearTimeout(portalTimeout);
      hovered = false;
      focused = false;
      releaseActiveTooltip();
    }
    let disconnectModalObserver = () => {
    };
    const PORTAL_HORIZONTAL_GAP_LEFT_PX = 2;
    const PORTAL_HORIZONTAL_GAP_RIGHT_PX = 2;
    const PORTAL_VERTICAL_GAP_TOP_PX = 1;
    const PORTAL_VERTICAL_GAP_BOTTOM_PX = 1;
    const PORTAL_VERTICAL_ALIGN_OFFSET_LEFT_START_PX = -3;
    const PORTAL_VERTICAL_ALIGN_OFFSET_RIGHT_END_PX = 1;
    if (ctx && ref) {
      ctx.declareRef(ref);
    }
    hasIconOnly = (icon || $$slots.icon) && !$$slots.default;
    hasTooltipContent = hasIconOnly && Boolean(iconDescription);
    effectivePortalTooltip = portalTooltip === void 0 ? !!insideModal : portalTooltip;
    usePortal = hasTooltipContent && !hideTooltip && effectivePortalTooltip;
    hasTooltip = hasTooltipContent && !hideTooltip && !usePortal;
    portalOpen = usePortal && !disabled && (hovered || focused) && store_get($$store_subs ??= {}, "$activeButtonTooltip", activeButtonTooltip) === tooltipId;
    {
      disconnectModalObserver();
      disconnectModalObserver = usePortal && ref ? observeModalClose(ref, dismissPortalTooltip) : () => {
      };
    }
    tooltipHidden = hasTooltipContent && !hideTooltip && store_get($$store_subs ??= {}, "$activeButtonTooltip", activeButtonTooltip) !== null && store_get($$store_subs ??= {}, "$activeButtonTooltip", activeButtonTooltip) !== tooltipId;
    portalHorizontalGapLeft = tooltipPosition === "left" || tooltipPosition === "right" ? PORTAL_HORIZONTAL_GAP_LEFT_PX : 0;
    portalHorizontalGapRight = tooltipPosition === "left" || tooltipPosition === "right" ? PORTAL_HORIZONTAL_GAP_RIGHT_PX : 0;
    portalGapTop = tooltipPosition === "top" || tooltipPosition === "bottom" ? PORTAL_VERTICAL_GAP_TOP_PX : 0;
    portalGapBottom = tooltipPosition === "top" || tooltipPosition === "bottom" ? PORTAL_VERTICAL_GAP_BOTTOM_PX : 0;
    portalVerticalAlignOffsetLeft = tooltipPosition === "left" && tooltipAlignment === "start" ? PORTAL_VERTICAL_ALIGN_OFFSET_LEFT_START_PX : 0;
    portalVerticalAlignOffsetRight = tooltipPosition === "right" && tooltipAlignment === "end" ? PORTAL_VERTICAL_ALIGN_OFFSET_RIGHT_END_PX : 0;
    isDisabled = Boolean(disabled);
    effectiveSize = $$slots.badge ? "lg" : size ?? store_get($$store_subs ??= {}, "$actionSetSize", actionSetSize) ?? "default";
    iconProps = { "aria-hidden": "true", class: "bx--btn__icon" };
    buttonProps = {
      type: href && !isDisabled ? void 0 : type,
      tabindex,
      disabled: isDisabled ? true : void 0,
      href: href && !isDisabled ? href : void 0,
      rel: href && !isDisabled && $$restProps.target === "_blank" ? "noopener noreferrer" : void 0,
      "aria-pressed": hasIconOnly && kind === "ghost" && !href ? isSelected : void 0,
      ...$$restProps,
      class: [
        "bx--btn",
        expressive && "bx--btn--expressive",
        effectiveSize === "small" && "bx--btn--sm",
        effectiveSize === "field" && "bx--btn--field",
        effectiveSize === "lg" && "bx--btn--lg",
        effectiveSize === "xl" && "bx--btn--xl",
        kind && `bx--btn--${kind}`,
        isDisabled && "bx--btn--disabled",
        hasIconOnly && "bx--btn--icon-only",
        hasTooltip && "bx--tooltip__trigger",
        hasTooltip && "bx--tooltip--a11y",
        hasTooltip && tooltipPosition && `bx--btn--icon-only--${tooltipPosition}`,
        hasTooltip && tooltipAlignment && `bx--tooltip--align-${tooltipAlignment}`,
        hasTooltip && tooltipHidden && "bx--tooltip--hidden",
        hasIconOnly && isSelected && kind === "ghost" && "bx--btn--selected",
        $$restProps.class
      ].filter(Boolean).join(" ")
    };
    if (skeleton) {
      $$renderer2.push("<!--[-->");
      ButtonSkeleton($$renderer2, spread_props([
        { href, size },
        $$restProps,
        { style: hasIconOnly && "width: 3rem;" }
      ]));
    } else {
      $$renderer2.push("<!--[!-->");
      if (as) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<!--[-->`);
        slot($$renderer2, $$props, "default", { props: buttonProps }, null);
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (href && !isDisabled) {
          $$renderer2.push("<!--[-->");
          if ($$slots.badge) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="bx--btn__badge-wrapper"><a${attributes({ ...buttonProps })}>`);
            if (hasIconOnly && iconDescription) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span${attr_class("", void 0, { "bx--assistive-text": true })}${attr_style("", { "pointer-events": "none" })}>${escape_html(iconDescription)}</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <!--[-->`);
            slot($$renderer2, $$props, "default", {}, null);
            $$renderer2.push(`<!--]--> `);
            if ($$slots.icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<!--[-->`);
              slot(
                $$renderer2,
                $$props,
                "icon",
                spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]),
                null
              );
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (icon) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]));
                $$renderer2.push(`<!---->`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></a> <!--[-->`);
            slot($$renderer2, $$props, "badge", {}, null);
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<a${attributes({ ...buttonProps })}>`);
            if (hasIconOnly && iconDescription) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span${attr_class("", void 0, { "bx--assistive-text": true })}${attr_style("", { "pointer-events": "none" })}>${escape_html(iconDescription)}</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <!--[-->`);
            slot($$renderer2, $$props, "default", {}, null);
            $$renderer2.push(`<!--]--> `);
            if ($$slots.icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<!--[-->`);
              slot(
                $$renderer2,
                $$props,
                "icon",
                spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]),
                null
              );
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (icon) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]));
                $$renderer2.push(`<!---->`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></a>`);
          }
          $$renderer2.push(`<!--]-->`);
        } else {
          $$renderer2.push("<!--[!-->");
          if ($$slots.badge) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div class="bx--btn__badge-wrapper"><button${attributes({ type: "button", ...buttonProps })}>`);
            if (hasIconOnly && iconDescription) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span${attr_class("", void 0, { "bx--assistive-text": true })}${attr_style("", { "pointer-events": "none" })}>${escape_html(iconDescription)}</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <!--[-->`);
            slot($$renderer2, $$props, "default", {}, null);
            $$renderer2.push(`<!--]--> `);
            if ($$slots.icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<!--[-->`);
              slot(
                $$renderer2,
                $$props,
                "icon",
                spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]),
                null
              );
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (icon) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]));
                $$renderer2.push(`<!---->`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></button> <!--[-->`);
            slot($$renderer2, $$props, "badge", {}, null);
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<button${attributes({ type: "button", ...buttonProps })}>`);
            if (hasIconOnly && iconDescription) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<span${attr_class("", void 0, { "bx--assistive-text": true })}${attr_style("", { "pointer-events": "none" })}>${escape_html(iconDescription)}</span>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <!--[-->`);
            slot($$renderer2, $$props, "default", {}, null);
            $$renderer2.push(`<!--]--> `);
            if ($$slots.icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<!--[-->`);
              slot(
                $$renderer2,
                $$props,
                "icon",
                spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]),
                null
              );
              $$renderer2.push(`<!--]-->`);
            } else {
              $$renderer2.push("<!--[!-->");
              if (icon) {
                $$renderer2.push("<!--[-->");
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, spread_props([
                  { style: hasIconOnly ? "margin-left: 0" : void 0 },
                  iconProps
                ]));
                $$renderer2.push(`<!---->`);
              } else {
                $$renderer2.push("<!--[!-->");
              }
              $$renderer2.push(`<!--]-->`);
            }
            $$renderer2.push(`<!--]--></button>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> `);
    if (usePortal) {
      $$renderer2.push("<!--[-->");
      PortalTooltip($$renderer2, {
        anchor: ref,
        direction: tooltipPosition,
        open: portalOpen,
        text: iconDescription,
        tooltipType: "icon",
        intrinsicAlign: tooltipAlignment,
        horizontalGapLeft: portalHorizontalGapLeft,
        horizontalGapRight: portalHorizontalGapRight,
        gapTop: portalGapTop,
        gapBottom: portalGapBottom,
        verticalAlignOffsetLeft: portalVerticalAlignOffsetLeft,
        verticalAlignOffsetRight: portalVerticalAlignOffsetRight
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      kind,
      size,
      expressive,
      isSelected,
      icon,
      iconDescription,
      tooltipAlignment,
      tooltipPosition,
      hideTooltip,
      as,
      skeleton,
      disabled,
      href,
      tabindex,
      type,
      ref,
      portalTooltip
    });
  });
}
function WarningAltFilled($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size", "title"]);
  $$renderer.component(($$renderer2) => {
    let labelled, attributes$1;
    let size = fallback($$props["size"], 16);
    let title = fallback($$props["title"], void 0);
    labelled = $$sanitized_props["aria-label"] || $$sanitized_props["aria-labelledby"] || title;
    attributes$1 = {
      "aria-hidden": labelled ? void 0 : true,
      role: labelled ? "img" : void 0,
      focusable: Number($$sanitized_props.tabindex) === 0 ? true : void 0
    };
    $$renderer2.push(`<svg${attributes(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        preserveAspectRatio: "xMidYMid meet",
        width: size,
        height: size,
        ...attributes$1,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      3
    )}>`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<title>${escape_html(title)}</title>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><path fill="none" d="M16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Zm-1.125-5h2.25V12h-2.25Z" data-icon-path="inner-path"></path><path d="M16.002,6.1714h-.004L4.6487,27.9966,4.6506,28H27.3494l.0019-.0034ZM14.875,12h2.25v9h-2.25ZM16,26a1.5,1.5,0,1,1,1.5-1.5A1.5,1.5,0,0,1,16,26Z"></path><path d="M29,30H3a1,1,0,0,1-.8872-1.4614l13-25a1,1,0,0,1,1.7744,0l13,25A1,1,0,0,1,29,30ZM4.6507,28H27.3493l.002-.0033L16.002,6.1714h-.004L4.6487,27.9967Z"></path></svg>`);
    bind_props($$props, { size, title });
  });
}
function WarningFilled($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size", "title"]);
  $$renderer.component(($$renderer2) => {
    let labelled, attributes$1;
    let size = fallback($$props["size"], 16);
    let title = fallback($$props["title"], void 0);
    labelled = $$sanitized_props["aria-label"] || $$sanitized_props["aria-labelledby"] || title;
    attributes$1 = {
      "aria-hidden": labelled ? void 0 : true,
      role: labelled ? "img" : void 0,
      focusable: Number($$sanitized_props.tabindex) === 0 ? true : void 0
    };
    $$renderer2.push(`<svg${attributes(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        preserveAspectRatio: "xMidYMid meet",
        width: size,
        height: size,
        ...attributes$1,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      3
    )}>`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<title>${escape_html(title)}</title>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><path d="M16,2C8.3,2,2,8.3,2,16s6.3,14,14,14s14-6.3,14-14C30,8.3,23.7,2,16,2z M14.9,8h2.2v11h-2.2V8z M16,25	c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22c0.8,0,1.5,0.7,1.5,1.5S16.8,25,16,25z"></path><path fill="none" d="M17.5,23.5c0,0.8-0.7,1.5-1.5,1.5c-0.8,0-1.5-0.7-1.5-1.5S15.2,22,16,22	C16.8,22,17.5,22.7,17.5,23.5z M17.1,8h-2.2v11h2.2V8z" data-icon-path="inner-path" opacity="0"></path></svg>`);
    bind_props($$props, { size, title });
  });
}
function CheckboxSkeleton($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, []);
  $$renderer.push(`<div${attributes({ ...$$restProps }, void 0, {
    "bx--form-item": true,
    "bx--checkbox-wrapper": true,
    "bx--checkbox-label": true
  })}><span${attr_class("", void 0, { "bx--checkbox-label-text": true, "bx--skeleton": true })}></span></div>`);
}
function Checkbox($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "value",
    "checked",
    "group",
    "indeterminate",
    "skeleton",
    "required",
    "readonly",
    "disabled",
    "labelText",
    "hideLabel",
    "helperText",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "name",
    "title",
    "id",
    "tabindex",
    "decorative",
    "ref"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let useGroup, effectiveName, effectiveRequired, effectiveReadonly, effectiveInvalid, effectiveWarn, showInvalid, showWarn, helperId, errorId, warnId;
    let value = fallback($$props["value"], "");
    let checked = fallback($$props["checked"], false);
    let group = fallback($$props["group"], void 0);
    let indeterminate = fallback($$props["indeterminate"], false);
    let skeleton = fallback($$props["skeleton"], false);
    let required = fallback($$props["required"], false);
    let readonly = fallback($$props["readonly"], false);
    let disabled = fallback($$props["disabled"], false);
    let labelText = fallback($$props["labelText"], "");
    let hideLabel = fallback($$props["hideLabel"], false);
    let helperText = fallback($$props["helperText"], "");
    let invalid = fallback($$props["invalid"], false);
    let invalidText = fallback($$props["invalidText"], "");
    let warn = fallback($$props["warn"], false);
    let warnText = fallback($$props["warnText"], "");
    let name = fallback($$props["name"], "");
    let title = fallback($$props["title"], void 0);
    let id = fallback($$props["id"], uniqueId, true);
    let tabindex = fallback($$props["tabindex"], void 0);
    let decorative = fallback($$props["decorative"], false);
    let ref = fallback($$props["ref"], null);
    const ctx = getContext("carbon:CheckboxGroup");
    const {
      selectedValues,
      groupName,
      groupRequired,
      readonly: groupReadonly,
      invalid: groupInvalid,
      warn: groupWarn,
      update: ctxUpdate
    } = ctx ?? {
      selectedValues: readable([]),
      groupName: readable(void 0),
      groupRequired: readable(void 0),
      readonly: readable(false),
      invalid: readable(false),
      warn: readable(false)
    };
    useGroup = !ctx && Array.isArray(group);
    if (ctx) checked = store_get($$store_subs ??= {}, "$selectedValues", selectedValues).includes(value);
    if (useGroup) checked = group.includes(value);
    effectiveName = ctx ? store_get($$store_subs ??= {}, "$groupName", groupName) ?? name : name;
    effectiveRequired = ctx ? store_get($$store_subs ??= {}, "$groupRequired", groupRequired) ?? required : required;
    effectiveReadonly = store_get($$store_subs ??= {}, "$groupReadonly", groupReadonly) || readonly;
    effectiveInvalid = store_get($$store_subs ??= {}, "$groupInvalid", groupInvalid) || invalid;
    effectiveWarn = store_get($$store_subs ??= {}, "$groupWarn", groupWarn) || warn;
    showInvalid = effectiveInvalid && !disabled && !effectiveReadonly;
    showWarn = effectiveWarn && !effectiveInvalid && !disabled && !effectiveReadonly;
    helperId = `helper-${id}`;
    errorId = `error-${id}`;
    warnId = `warn-${id}`;
    if (skeleton) {
      $$renderer2.push("<!--[-->");
      CheckboxSkeleton($$renderer2, spread_props([$$restProps]));
    } else {
      $$renderer2.push("<!--[!-->");
      $$renderer2.push(`<div${attributes({ ...$$restProps }, void 0, {
        "bx--form-item": true,
        "bx--checkbox-wrapper": true,
        "bx--checkbox-wrapper--readonly": effectiveReadonly,
        "bx--checkbox-wrapper--invalid": showInvalid,
        "bx--checkbox-wrapper--warning": showWarn
      })}><input type="checkbox"${attr("value", value)}${attr("checked", checked, true)}${attr("disabled", disabled, true)}${attr("id", id)}${attr("tabindex", tabindex)}${attr("name", effectiveName)}${attr("required", effectiveRequired, true)}${attr("aria-readonly", effectiveReadonly || void 0)}${attr("aria-invalid", showInvalid || void 0)}${attr("data-invalid", showInvalid || void 0)}${attr("aria-describedby", showInvalid ? errorId : showWarn ? warnId : helperText ? helperId : void 0)}${attr_class("", void 0, { "bx--checkbox": true })}${attr_style("", { display: decorative ? "none" : void 0 })}/> <label${attr("for", id)}${attr_class("", void 0, { "bx--checkbox-label": true })}><span${attr_class("", void 0, {
        "bx--checkbox-label-text": true,
        "bx--visually-hidden": hideLabel
      })}><!--[-->`);
      slot($$renderer2, $$props, "labelChildren", {}, () => {
        $$renderer2.push(`${escape_html(labelText)}`);
      });
      $$renderer2.push(`<!--]--></span></label> <div${attr_class("", void 0, { "bx--checkbox__validation-msg": true })}>`);
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        WarningFilled($$renderer2, { class: "bx--checkbox__invalid-icon" });
        $$renderer2.push(`<!----> <div${attr("id", errorId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (showWarn) {
          $$renderer2.push("<!--[-->");
          WarningAltFilled($$renderer2, {
            class: "bx--checkbox__invalid-icon bx--checkbox__invalid-icon--warning"
          });
          $$renderer2.push(`<!----> <div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]--></div> `);
      if (helperText && !showInvalid && !showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", helperId)}${attr_class("", void 0, {
          "bx--form__helper-text": true,
          "bx--form__helper-text--disabled": disabled
        })}>${escape_html(helperText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      value,
      checked,
      group,
      indeterminate,
      skeleton,
      required,
      readonly,
      disabled,
      labelText,
      hideLabel,
      helperText,
      invalid,
      invalidText,
      warn,
      warnText,
      name,
      title,
      id,
      tabindex,
      decorative,
      ref
    });
  });
}
function ChevronDown($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size", "title"]);
  $$renderer.component(($$renderer2) => {
    let labelled, attributes$1;
    let size = fallback($$props["size"], 16);
    let title = fallback($$props["title"], void 0);
    labelled = $$sanitized_props["aria-label"] || $$sanitized_props["aria-labelledby"] || title;
    attributes$1 = {
      "aria-hidden": labelled ? void 0 : true,
      role: labelled ? "img" : void 0,
      focusable: Number($$sanitized_props.tabindex) === 0 ? true : void 0
    };
    $$renderer2.push(`<svg${attributes(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        preserveAspectRatio: "xMidYMid meet",
        width: size,
        height: size,
        ...attributes$1,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      3
    )}>`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<title>${escape_html(title)}</title>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><path d="M16 22L6 12 7.4 10.6 16 19.2 24.6 10.6 26 12z"></path></svg>`);
    bind_props($$props, { size, title });
  });
}
function Close($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size", "title"]);
  $$renderer.component(($$renderer2) => {
    let labelled, attributes$1;
    let size = fallback($$props["size"], 16);
    let title = fallback($$props["title"], void 0);
    labelled = $$sanitized_props["aria-label"] || $$sanitized_props["aria-labelledby"] || title;
    attributes$1 = {
      "aria-hidden": labelled ? void 0 : true,
      role: labelled ? "img" : void 0,
      focusable: Number($$sanitized_props.tabindex) === 0 ? true : void 0
    };
    $$renderer2.push(`<svg${attributes(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        preserveAspectRatio: "xMidYMid meet",
        width: size,
        height: size,
        ...attributes$1,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      3
    )}>`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<title>${escape_html(title)}</title>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><path d="M24 9.4L22.6 8 16 14.6 9.4 8 8 9.4 14.6 16 8 22.6 9.4 24 16 17.4 22.6 24 24 22.6 17.4 16 24 9.4z"></path></svg>`);
    bind_props($$props, { size, title });
  });
}
function EditOff($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size", "title"]);
  $$renderer.component(($$renderer2) => {
    let labelled, attributes$1;
    let size = fallback($$props["size"], 16);
    let title = fallback($$props["title"], void 0);
    labelled = $$sanitized_props["aria-label"] || $$sanitized_props["aria-labelledby"] || title;
    attributes$1 = {
      "aria-hidden": labelled ? void 0 : true,
      role: labelled ? "img" : void 0,
      focusable: Number($$sanitized_props.tabindex) === 0 ? true : void 0
    };
    $$renderer2.push(`<svg${attributes(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 32 32",
        fill: "currentColor",
        preserveAspectRatio: "xMidYMid meet",
        width: size,
        height: size,
        ...attributes$1,
        ...$$restProps
      },
      void 0,
      void 0,
      void 0,
      3
    )}>`);
    if (title) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<title>${escape_html(title)}</title>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--><path d="M30 28.6L3.4 2 2 3.4l10.1 10.1L4 21.6V28h6.4l8.1-8.1L28.6 30 30 28.6zM9.6 26H6v-3.6l7.5-7.5 3.6 3.6L9.6 26zM29.4 6.2L29.4 6.2l-3.6-3.6c-.8-.8-2-.8-2.8 0l0 0 0 0-8 8 1.4 1.4L20 8.4l3.6 3.6L20 15.6l1.4 1.4 8-8C30.2 8.2 30.2 7 29.4 6.2L29.4 6.2zM25 10.6L21.4 7l3-3L28 7.6 25 10.6z"></path></svg>`);
    bind_props($$props, { size, title });
  });
}
function Select($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "selected",
    "size",
    "inline",
    "light",
    "disabled",
    "id",
    "name",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "helperText",
    "noLabel",
    "labelText",
    "hideLabel",
    "ref",
    "required",
    "readonly",
    "fluid"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let errorId, warnId, helperId, showInvalid, showWarn, isFluid;
    let selected = fallback($$props["selected"], void 0);
    let size = fallback($$props["size"], void 0);
    let inline = fallback($$props["inline"], false);
    let light = fallback($$props["light"], false);
    let disabled = fallback($$props["disabled"], false);
    let id = fallback($$props["id"], uniqueId, true);
    let name = fallback($$props["name"], void 0);
    let invalid = fallback($$props["invalid"], false);
    let invalidText = fallback($$props["invalidText"], "");
    let warn = fallback($$props["warn"], false);
    let warnText = fallback($$props["warnText"], "");
    let helperText = fallback($$props["helperText"], "");
    let noLabel = fallback($$props["noLabel"], false);
    let labelText = fallback($$props["labelText"], "");
    let hideLabel = fallback($$props["hideLabel"], false);
    let ref = fallback($$props["ref"], null);
    let required = fallback($$props["required"], false);
    let readonly = fallback($$props["readonly"], false);
    let fluid = fallback($$props["fluid"], false);
    const formContext = getContext("carbon:Form");
    const selectedValue = writable(selected);
    const defaultSelectId = writable(null);
    const defaultValue = writable(null);
    const itemTypesByValue = writable({});
    function setDefaultValue(id2, value) {
      if (store_get($$store_subs ??= {}, "$defaultValue", defaultValue) === null) {
        defaultSelectId.set(id2);
        defaultValue.set(value);
      } else {
        if (store_get($$store_subs ??= {}, "$defaultSelectId", defaultSelectId) === id2) {
          selectedValue.set(value);
        }
      }
      itemTypesByValue.update((types) => ({ ...types, [value]: typeof value }));
    }
    setContext("carbon:Select", { selectedValue, setDefaultValue, syncNativeSelectValue });
    function syncNativeSelectValue() {
      tick().then(() => {
        if (!ref) return;
        const nextValue = store_get($$store_subs ??= {}, "$selectedValue", selectedValue) == null ? "" : String(store_get($$store_subs ??= {}, "$selectedValue", selectedValue));
        if (ref.selectedIndex === -1 || ref.value !== nextValue) {
          ref.value = nextValue;
        }
      });
    }
    errorId = `error-${id}`;
    warnId = `warn-${id}`;
    helperId = `helper-${id}`;
    {
      selectedValue.set(selected ?? store_get($$store_subs ??= {}, "$defaultValue", defaultValue));
      syncNativeSelectValue();
    }
    showInvalid = invalid && !disabled && !readonly;
    showWarn = warn && !invalid && !disabled && !readonly;
    isFluid = !inline && (fluid || !!formContext?.isFluid);
    $$renderer2.push(`<div${attr_class("", void 0, { "bx--form-item": true, "bx--select--fluid": isFluid })}><div${attr_class("", void 0, {
      "bx--select": true,
      "bx--select--inline": inline,
      "bx--select--light": light,
      "bx--select--invalid": showInvalid,
      "bx--select--disabled": disabled,
      "bx--select--warning": showWarn,
      "bx--select--readonly": readonly
    })}>`);
    if (!noLabel && (labelText || $$slots.labelChildren)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<label${attr("for", id)}${attr_class("", void 0, {
        "bx--label": true,
        "bx--visually-hidden": hideLabel,
        "bx--label--disabled": disabled,
        "bx--label--slotted": isFluid && $$slots.labelChildren
      })}><!--[-->`);
      slot($$renderer2, $$props, "labelChildren", {}, () => {
        $$renderer2.push(`${escape_html(labelText)}`);
      });
      $$renderer2.push(`<!--]--></label>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (inline) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("", void 0, { "bx--select-input--inline__wrapper": true })}><div${attr("data-invalid", showInvalid || void 0)}${attr_class("", void 0, { "bx--select-input__wrapper": true })}>`);
      $$renderer2.select(
        {
          this: ref,
          "aria-describedby": showInvalid ? errorId : showWarn ? warnId : helperText ? helperId : void 0,
          "aria-invalid": showInvalid || void 0,
          "aria-readonly": readonly || void 0,
          disabled: disabled || void 0,
          required: required || void 0,
          id,
          name,
          ...$$restProps
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          slot($$renderer3, $$props, "default", {}, null);
          $$renderer3.push(`<!--]-->`);
        },
        void 0,
        {
          "bx--select-input": true,
          "bx--select-input--xs": size === "xs",
          "bx--select-input--sm": size === "sm",
          "bx--select-input--xl": size === "xl"
        },
        void 0,
        void 0,
        true
      );
      $$renderer2.push(` `);
      ChevronDown($$renderer2, { class: "bx--select__arrow" });
      $$renderer2.push(`<!----> `);
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        WarningFilled($$renderer2, { class: "bx--select__invalid-icon" });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showWarn) {
        $$renderer2.push("<!--[-->");
        WarningAltFilled($$renderer2, {
          class: "bx--select__invalid-icon bx--select__invalid-icon--warning"
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", errorId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (helperText && !showInvalid && !showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", helperId)}${attr_class("", void 0, {
          "bx--form__helper-text": true,
          "bx--form__helper-text--disabled": disabled
        })}>${escape_html(helperText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!inline) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("data-invalid", showInvalid || void 0)}${attr_class("", void 0, { "bx--select-input__wrapper": true })}>`);
      $$renderer2.select(
        {
          this: ref,
          id,
          name,
          "aria-describedby": showInvalid ? errorId : showWarn ? warnId : helperText && !isFluid ? helperId : void 0,
          disabled: disabled || void 0,
          required: required || void 0,
          "aria-invalid": showInvalid || void 0,
          "aria-readonly": readonly || void 0,
          ...$$restProps
        },
        ($$renderer3) => {
          $$renderer3.push(`<!--[-->`);
          slot($$renderer3, $$props, "default", {}, null);
          $$renderer3.push(`<!--]-->`);
        },
        void 0,
        {
          "bx--select-input": true,
          "bx--select-input--xs": size === "xs",
          "bx--select-input--sm": size === "sm",
          "bx--select-input--xl": size === "xl"
        },
        void 0,
        void 0,
        true
      );
      $$renderer2.push(` `);
      ChevronDown($$renderer2, { class: "bx--select__arrow" });
      $$renderer2.push(`<!----> `);
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        WarningFilled($$renderer2, { class: "bx--select__invalid-icon" });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showWarn) {
        $$renderer2.push("<!--[-->");
        WarningAltFilled($$renderer2, {
          class: "bx--select__invalid-icon bx--select__invalid-icon--warning"
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (isFluid) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<hr${attr_class("", void 0, { "bx--select__divider": true })}/> `);
        if (showInvalid) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div${attr("id", errorId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--> `);
        if (showWarn) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]-->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div> `);
      if (!isFluid && helperText && !showInvalid && !showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", helperId)}${attr_class("", void 0, {
          "bx--form__helper-text": true,
          "bx--form__helper-text--disabled": disabled
        })}>${escape_html(helperText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!isFluid && showInvalid) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", errorId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!isFluid && showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      selected,
      size,
      inline,
      light,
      disabled,
      id,
      name,
      invalid,
      invalidText,
      warn,
      warnText,
      helperText,
      noLabel,
      labelText,
      hideLabel,
      ref,
      required,
      readonly,
      fluid
    });
  });
}
function SelectItem($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let value = fallback($$props["value"], "");
    let text = fallback($$props["text"], void 0);
    let hidden = fallback($$props["hidden"], false);
    let disabled = fallback($$props["disabled"], false);
    let className = fallback($$props["class"], void 0);
    let style = fallback($$props["style"], void 0);
    const id = uniqueId();
    const ctx = getContext("carbon:Select") || getContext("carbon:TimePickerSelect");
    let selected = false;
    ctx.selectedValue.subscribe((currentValue) => {
      selected = currentValue === value;
    });
    {
      ctx?.setDefaultValue?.(id, value);
      ctx?.syncNativeSelectValue?.();
    }
    $$renderer2.option(
      { value, disabled, hidden, selected, class: className, style },
      ($$renderer3) => {
        $$renderer3.push(`${escape_html(text ?? value)}`);
      },
      void 0,
      { "bx--select-option": true }
    );
    bind_props($$props, { value, text, hidden, disabled, class: className, style });
  });
}
function TooltipDefinition($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "tooltipText",
    "open",
    "align",
    "direction",
    "id",
    "clickToOpen",
    "enterDelayMs",
    "leaveDelayMs",
    "ref",
    "portalTooltip"
  ]);
  $$renderer.component(($$renderer2) => {
    let effectivePortalTooltip;
    let tooltipText = fallback($$props["tooltipText"], "");
    let open = fallback($$props["open"], false);
    let align = fallback($$props["align"], "center");
    let direction = fallback($$props["direction"], "bottom");
    let id = fallback($$props["id"], uniqueId, true);
    let clickToOpen = fallback($$props["clickToOpen"], false);
    let enterDelayMs = fallback($$props["enterDelayMs"], 100);
    let leaveDelayMs = fallback($$props["leaveDelayMs"], 300);
    let ref = fallback($$props["ref"], null);
    let portalTooltip = fallback($$props["portalTooltip"], void 0);
    const insideModal = getContext("carbon:Modal");
    const PORTAL_VERTICAL_GAP_TOP_PX = -2;
    const PORTAL_VERTICAL_GAP_BOTTOM_PX = -3;
    effectivePortalTooltip = portalTooltip === void 0 ? !!insideModal : portalTooltip;
    $$renderer2.push(`<span${attributes({ ...$$restProps }, void 0, { "bx--tooltip--definition": true, "bx--tooltip--a11y": true })}><button type="button"${attr("aria-describedby", id)}${attr_class("", void 0, {
      "bx--tooltip--portal-active": effectivePortalTooltip,
      "bx--tooltip--a11y": !effectivePortalTooltip,
      "bx--tooltip__trigger": true,
      "bx--tooltip__trigger--definition": true,
      "bx--tooltip--hidden": !effectivePortalTooltip && !open,
      "bx--tooltip--visible": !effectivePortalTooltip && open,
      "bx--tooltip--top": !effectivePortalTooltip && direction === "top",
      "bx--tooltip--bottom": !effectivePortalTooltip && direction === "bottom",
      "bx--tooltip--align-start": !effectivePortalTooltip && align === "start",
      "bx--tooltip--align-center": !effectivePortalTooltip && align === "center",
      "bx--tooltip--align-end": !effectivePortalTooltip && align === "end"
    })}><!--[-->`);
    slot($$renderer2, $$props, "default", {}, null);
    $$renderer2.push(`<!--]--></button> `);
    if (!effectivePortalTooltip) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div role="tooltip"${attr("id", id)}${attr_class("", void 0, { "bx--assistive-text": true })}><!--[-->`);
      slot($$renderer2, $$props, "tooltip", {}, () => {
        $$renderer2.push(`${escape_html(tooltipText)}`);
      });
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></span> `);
    if (effectivePortalTooltip) {
      $$renderer2.push("<!--[-->");
      FloatingPortal($$renderer2, {
        anchor: ref,
        direction,
        open,
        gapTop: direction === "top" ? PORTAL_VERTICAL_GAP_TOP_PX : 0,
        gapBottom: direction === "bottom" ? PORTAL_VERTICAL_GAP_BOTTOM_PX : 0,
        intrinsicAlign: align,
        intrinsicWidth: true,
        children: invalid_default_snippet,
        $$slots: {
          default: ($$renderer3, { direction: actualDirection }) => {
            $$renderer3.push(`<div${attr("data-direction", actualDirection ?? direction)} data-tooltip-type="definition"${attr_class("", void 0, { "bx--tooltip-portal": true })}><span${attr_class("", void 0, { "bx--tooltip-portal__caret": true })}></span> <span${attr("id", id)} role="tooltip"${attr_class("", void 0, {
              "bx--tooltip-portal__content": true,
              "bx--assistive-text": true
            })}><!--[-->`);
            slot($$renderer3, $$props, "tooltip", {}, () => {
              $$renderer3.push(`${escape_html(tooltipText)}`);
            });
            $$renderer3.push(`<!--]--></span></div>`);
          }
        }
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]-->`);
    bind_props($$props, {
      tooltipText,
      open,
      align,
      direction,
      id,
      clickToOpen,
      enterDelayMs,
      leaveDelayMs,
      ref,
      portalTooltip
    });
  });
}
function TagSkeleton($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["size"]);
  let size = fallback($$props["size"], "default");
  $$renderer.push(`<span${attributes({ ...$$restProps }, void 0, {
    "bx--tag": true,
    "bx--tag--sm": size === "sm",
    "bx--tag--lg": size === "lg",
    "bx--skeleton": true
  })}></span>`);
  bind_props($$props, { size });
}
function Tag($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "type",
    "size",
    "filter",
    "disabled",
    "interactive",
    "href",
    "skeleton",
    "inline",
    "title",
    "maxWidth",
    "icon",
    "id",
    "ref"
  ]);
  $$renderer.component(($$renderer2) => {
    var $$store_subs;
    let resolvedSize, showTruncationTooltip, interactiveTitle, groupOverflow;
    let type = fallback($$props["type"], void 0);
    let size = fallback($$props["size"], void 0);
    let filter = fallback($$props["filter"], false);
    let disabled = fallback($$props["disabled"], false);
    let interactive = fallback($$props["interactive"], false);
    let href = fallback($$props["href"], void 0);
    let skeleton = fallback($$props["skeleton"], false);
    let inline = fallback($$props["inline"], false);
    let title = fallback($$props["title"], "Clear filter");
    let maxWidth = fallback($$props["maxWidth"], void 0);
    let icon = fallback($$props["icon"], void 0);
    let id = fallback($$props["id"], uniqueId, true);
    let ref = fallback($$props["ref"], null);
    const tagSet = getContext("carbon:TagSet");
    const groupItemId = tagSet ? uniqueId("ctag") : void 0;
    const groupOverflowIds = tagSet?.overflowIds ?? readable(/* @__PURE__ */ new Set());
    const groupSize = tagSet?.size ?? readable(void 0);
    let isTruncated = false;
    let truncationLabel = "";
    let measureToken = 0;
    async function measureTruncation() {
      const token = ++measureToken;
      await tick();
      if (token !== measureToken) return;
      {
        isTruncated = false;
        truncationLabel = "";
        return;
      }
    }
    resolvedSize = size ?? store_get($$store_subs ??= {}, "$groupSize", groupSize) ?? "default";
    if (maxWidth != null && !skeleton) {
      measureTruncation();
    } else if (maxWidth == null) {
      isTruncated = false;
      truncationLabel = "";
    }
    showTruncationTooltip = isTruncated && !interactive;
    interactiveTitle = isTruncated && interactive ? truncationLabel : void 0;
    if (tagSet) {
      tagSet.update(groupItemId, { type, size: resolvedSize, disabled, filter });
    }
    groupOverflow = !!tagSet && store_get($$store_subs ??= {}, "$groupOverflowIds", groupOverflowIds).has(groupItemId);
    if (skeleton) {
      $$renderer2.push("<!--[-->");
      TagSkeleton($$renderer2, spread_props([{ size: resolvedSize }, $$restProps]));
    } else {
      $$renderer2.push("<!--[!-->");
      if (filter) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attributes(
          {
            "aria-label": title,
            id,
            "data-overflow": groupOverflow ? "true" : void 0,
            ...$$restProps
          },
          void 0,
          {
            "bx--tag": true,
            "bx--tag--inline": inline,
            "bx--tag--disabled": disabled,
            "bx--tag--filter": filter,
            "bx--tag--truncate": maxWidth != null,
            "bx--tag--sm": resolvedSize === "sm",
            "bx--tag--lg": resolvedSize === "lg",
            "bx--tag--red": type === "red",
            "bx--tag--magenta": type === "magenta",
            "bx--tag--purple": type === "purple",
            "bx--tag--blue": type === "blue",
            "bx--tag--cyan": type === "cyan",
            "bx--tag--teal": type === "teal",
            "bx--tag--green": type === "green",
            "bx--tag--gray": type === "gray",
            "bx--tag--cool-gray": type === "cool-gray",
            "bx--tag--warm-gray": type === "warm-gray",
            "bx--tag--high-contrast": type === "high-contrast",
            "bx--tag--outline": type === "outline"
          },
          { "max-width": maxWidth }
        )}>`);
        if (showTruncationTooltip) {
          $$renderer2.push("<!--[-->");
          TooltipDefinition($$renderer2, {
            class: "bx--tag__label-tooltip",
            tooltipText: truncationLabel,
            portalTooltip: true,
            children: ($$renderer3) => {
              $$renderer3.push(`<span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
              slot($$renderer3, $$props, "default", { props: { class: "bx--tag__label" } }, () => {
                $$renderer3.push(`${escape_html(type)}`);
              });
              $$renderer3.push(`<!--]--></span>`);
            },
            $$slots: { default: true }
          });
        } else {
          $$renderer2.push("<!--[!-->");
          $$renderer2.push(`<span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
          slot($$renderer2, $$props, "default", { props: { class: "bx--tag__label" } }, () => {
            $$renderer2.push(`${escape_html(type)}`);
          });
          $$renderer2.push(`<!--]--></span>`);
        }
        $$renderer2.push(`<!--]--> <button type="button"${attr("aria-labelledby", id)}${attr("disabled", disabled, true)}${attr("title", title)}${attr_class("", void 0, { "bx--tag__close-icon": true })}>`);
        Close($$renderer2, {});
        $$renderer2.push(`<!----></button></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
        if (href) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<a${attributes(
            {
              href: disabled ? void 0 : href,
              role: disabled ? "link" : void 0,
              id,
              "aria-disabled": disabled || void 0,
              rel: $$restProps.target === "_blank" ? "noopener noreferrer" : void 0,
              "data-overflow": groupOverflow ? "true" : void 0,
              ...$$restProps
            },
            void 0,
            {
              "bx--tag": true,
              "bx--tag--inline": inline,
              "bx--tag--interactive": true,
              "bx--tag--disabled": disabled,
              "bx--tag--sm": resolvedSize === "sm",
              "bx--tag--lg": resolvedSize === "lg",
              "bx--tag--red": type === "red",
              "bx--tag--magenta": type === "magenta",
              "bx--tag--purple": type === "purple",
              "bx--tag--blue": type === "blue",
              "bx--tag--cyan": type === "cyan",
              "bx--tag--teal": type === "teal",
              "bx--tag--green": type === "green",
              "bx--tag--gray": type === "gray",
              "bx--tag--cool-gray": type === "cool-gray",
              "bx--tag--warm-gray": type === "warm-gray",
              "bx--tag--high-contrast": type === "high-contrast",
              "bx--tag--outline": type === "outline"
            }
          )}>`);
          if ($$slots.icon || icon) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<div${attr_class("", void 0, { "bx--tag__custom-icon": true })}><!--[-->`);
            slot($$renderer2, $$props, "icon", {}, () => {
              $$renderer2.push(`<!---->`);
              icon?.($$renderer2, {});
              $$renderer2.push(`<!---->`);
            });
            $$renderer2.push(`<!--]--></div>`);
          } else {
            $$renderer2.push("<!--[!-->");
          }
          $$renderer2.push(`<!--]--> <span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
          slot($$renderer2, $$props, "default", {}, null);
          $$renderer2.push(`<!--]--></span></a>`);
        } else {
          $$renderer2.push("<!--[!-->");
          if (interactive) {
            $$renderer2.push("<!--[-->");
            $$renderer2.push(`<button${attributes(
              {
                type: "button",
                id,
                disabled,
                "aria-disabled": disabled,
                tabindex: disabled ? "-1" : void 0,
                title: interactiveTitle,
                "data-overflow": groupOverflow ? "true" : void 0,
                ...$$restProps
              },
              void 0,
              {
                "bx--tag": true,
                "bx--tag--inline": inline,
                "bx--tag--interactive": true,
                "bx--tag--disabled": disabled,
                "bx--tag--truncate": maxWidth != null,
                "bx--tag--sm": resolvedSize === "sm",
                "bx--tag--lg": resolvedSize === "lg",
                "bx--tag--red": type === "red",
                "bx--tag--magenta": type === "magenta",
                "bx--tag--purple": type === "purple",
                "bx--tag--blue": type === "blue",
                "bx--tag--cyan": type === "cyan",
                "bx--tag--teal": type === "teal",
                "bx--tag--green": type === "green",
                "bx--tag--gray": type === "gray",
                "bx--tag--cool-gray": type === "cool-gray",
                "bx--tag--warm-gray": type === "warm-gray",
                "bx--tag--high-contrast": type === "high-contrast",
                "bx--tag--outline": type === "outline"
              },
              { "max-width": maxWidth }
            )}>`);
            if ($$slots.icon || icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div${attr_class("", void 0, { "bx--tag__custom-icon": true })}><!--[-->`);
              slot($$renderer2, $$props, "icon", {}, () => {
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, {});
                $$renderer2.push(`<!---->`);
              });
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> <span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
            slot($$renderer2, $$props, "default", {}, null);
            $$renderer2.push(`<!--]--></span></button>`);
          } else {
            $$renderer2.push("<!--[!-->");
            $$renderer2.push(`<div${attributes(
              {
                id,
                "data-overflow": groupOverflow ? "true" : void 0,
                ...$$restProps
              },
              void 0,
              {
                "bx--tag": true,
                "bx--tag--inline": inline,
                "bx--tag--disabled": disabled,
                "bx--tag--truncate": maxWidth != null,
                "bx--tag--sm": resolvedSize === "sm",
                "bx--tag--lg": resolvedSize === "lg",
                "bx--tag--red": type === "red",
                "bx--tag--magenta": type === "magenta",
                "bx--tag--purple": type === "purple",
                "bx--tag--blue": type === "blue",
                "bx--tag--cyan": type === "cyan",
                "bx--tag--teal": type === "teal",
                "bx--tag--green": type === "green",
                "bx--tag--gray": type === "gray",
                "bx--tag--cool-gray": type === "cool-gray",
                "bx--tag--warm-gray": type === "warm-gray",
                "bx--tag--high-contrast": type === "high-contrast",
                "bx--tag--outline": type === "outline"
              },
              { "max-width": maxWidth }
            )}>`);
            if ($$slots.icon || icon) {
              $$renderer2.push("<!--[-->");
              $$renderer2.push(`<div${attr_class("", void 0, { "bx--tag__custom-icon": true })}><!--[-->`);
              slot($$renderer2, $$props, "icon", {}, () => {
                $$renderer2.push(`<!---->`);
                icon?.($$renderer2, {});
                $$renderer2.push(`<!---->`);
              });
              $$renderer2.push(`<!--]--></div>`);
            } else {
              $$renderer2.push("<!--[!-->");
            }
            $$renderer2.push(`<!--]--> `);
            if (showTruncationTooltip) {
              $$renderer2.push("<!--[-->");
              TooltipDefinition($$renderer2, {
                class: "bx--tag__label-tooltip",
                tooltipText: truncationLabel,
                portalTooltip: true,
                children: ($$renderer3) => {
                  $$renderer3.push(`<span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
                  slot($$renderer3, $$props, "default", {}, null);
                  $$renderer3.push(`<!--]--></span>`);
                },
                $$slots: { default: true }
              });
            } else {
              $$renderer2.push("<!--[!-->");
              $$renderer2.push(`<span${attr_class("", void 0, { "bx--tag__label": true })}><!--[-->`);
              slot($$renderer2, $$props, "default", {}, null);
              $$renderer2.push(`<!--]--></span>`);
            }
            $$renderer2.push(`<!--]--></div>`);
          }
          $$renderer2.push(`<!--]-->`);
        }
        $$renderer2.push(`<!--]-->`);
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]-->`);
    if ($$store_subs) unsubscribe_stores($$store_subs);
    bind_props($$props, {
      type,
      size,
      filter,
      disabled,
      interactive,
      href,
      skeleton,
      inline,
      title,
      maxWidth,
      icon,
      id,
      ref
    });
  });
}
const segmenter = typeof Intl !== "undefined" && typeof Intl.Segmenter === "function" ? new Intl.Segmenter() : null;
function graphemeCount(value) {
  if (segmenter) {
    let count = 0;
    for (const _ of segmenter.segment(value)) count++;
    return count;
  }
  return [...value].length;
}
function TextArea($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "value",
    "placeholder",
    "cols",
    "rows",
    "maxCount",
    "light",
    "disabled",
    "readonly",
    "helperText",
    "labelText",
    "hideLabel",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "fluid",
    "id",
    "name",
    "ref"
  ]);
  $$renderer.component(($$renderer2) => {
    let helperId, counterId, errorId, warnId, showInvalid, showWarn, isFluid, showCounter, errorMessageId, describedBy;
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let cols = fallback($$props["cols"], void 0);
    let rows = fallback($$props["rows"], 4);
    let maxCount = fallback($$props["maxCount"], void 0);
    let light = fallback($$props["light"], false);
    let disabled = fallback($$props["disabled"], false);
    let readonly = fallback($$props["readonly"], false);
    let helperText = fallback($$props["helperText"], "");
    let labelText = fallback($$props["labelText"], "");
    let hideLabel = fallback($$props["hideLabel"], false);
    let invalid = fallback($$props["invalid"], false);
    let invalidText = fallback($$props["invalidText"], "");
    let warn = fallback($$props["warn"], false);
    let warnText = fallback($$props["warnText"], "");
    let fluid = fallback($$props["fluid"], false);
    let id = fallback($$props["id"], uniqueId, true);
    let name = fallback($$props["name"], void 0);
    let ref = fallback($$props["ref"], null);
    const formContext = getContext("carbon:Form");
    helperId = `helper-${id}`;
    counterId = `counter-${id}`;
    errorId = `error-${id}`;
    warnId = `warn-${id}`;
    showInvalid = invalid && !disabled && !readonly;
    showWarn = warn && !invalid && !disabled && !readonly;
    isFluid = fluid || !!formContext?.isFluid;
    showCounter = !!maxCount && !!(labelText || $$slots.labelChildren);
    errorMessageId = showInvalid ? errorId : void 0;
    describedBy = [
      showInvalid ? null : showWarn && !isFluid ? warnId : helperText && !isFluid ? helperId : null,
      showCounter ? counterId : null
    ].filter(Boolean).join(" ") || void 0;
    $$renderer2.push(`<div${attr_class("", void 0, { "bx--form-item": true, "bx--text-area--fluid": isFluid })}>`);
    if (labelText || $$slots.labelChildren) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("", void 0, { "bx--text-area__label-wrapper": true })}><label${attr("for", id)}${attr_class("", void 0, {
        "bx--label": true,
        "bx--visually-hidden": hideLabel && !isFluid,
        "bx--label--disabled": disabled,
        "bx--label--slotted": isFluid && $$slots.labelChildren
      })}><!--[-->`);
      slot($$renderer2, $$props, "labelChildren", {}, () => {
        $$renderer2.push(`${escape_html(labelText)}`);
      });
      $$renderer2.push(`<!--]--></label> `);
      if (maxCount) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", counterId)}${attr_class("", void 0, {
          "bx--label": true,
          "bx--label--disabled": disabled,
          "bx--text-area__label-counter": true
        })}>${escape_html(graphemeCount(value ?? ""))}/${escape_html(maxCount)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr("data-invalid", showInvalid || void 0)}${attr("data-warn", showWarn || void 0)}${attr_class("", void 0, {
      "bx--text-area__wrapper": true,
      "bx--text-area__wrapper--readonly": readonly,
      "bx--text-area__wrapper--warn": showWarn
    })}>`);
    if (showInvalid && !isFluid) {
      $$renderer2.push("<!--[-->");
      WarningFilled($$renderer2, { class: "bx--text-area__invalid-icon" });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (showWarn && !isFluid) {
      $$renderer2.push("<!--[-->");
      WarningAltFilled($$renderer2, {
        class: "bx--text-area__invalid-icon\n        bx--text-area__invalid-icon--warning"
      });
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <textarea${attributes(
      {
        "aria-invalid": showInvalid || void 0,
        "aria-errormessage": errorMessageId,
        "aria-describedby": describedBy,
        "data-warn": showWarn || void 0,
        disabled,
        id,
        name,
        cols,
        rows,
        placeholder,
        readonly,
        maxlength: maxCount ?? void 0,
        ...$$restProps
      },
      void 0,
      {
        "bx--text-area": true,
        "bx--text-area--light": light,
        "bx--text-area--invalid": showInvalid,
        "bx--text-area--warning": showWarn
      },
      { resize: typeof cols === "number" ? "none" : void 0 }
    )}>`);
    const $$body = escape_html(value);
    if ($$body) {
      $$renderer2.push(`${$$body}`);
    }
    $$renderer2.push(`</textarea> `);
    if (isFluid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<hr${attr_class("", void 0, { "bx--text-area__divider": true })}/> `);
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", errorId)} role="alert"${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)} `);
        WarningFilled($$renderer2, { class: "bx--text-area__invalid-icon" });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showWarn) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)} `);
        WarningAltFilled($$renderer2, {
          class: "bx--text-area__invalid-icon\n            bx--text-area__invalid-icon--warning"
        });
        $$renderer2.push(`<!----></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (!isFluid && !showInvalid && !showWarn && helperText) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", helperId)}${attr_class("", void 0, {
        "bx--form__helper-text": true,
        "bx--form__helper-text--disabled": disabled
      })}>${escape_html(helperText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!isFluid && showInvalid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", errorId)} role="alert"${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!isFluid && showWarn) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div>`);
    bind_props($$props, {
      value,
      placeholder,
      cols,
      rows,
      maxCount,
      light,
      disabled,
      readonly,
      helperText,
      labelText,
      hideLabel,
      invalid,
      invalidText,
      warn,
      warnText,
      fluid,
      id,
      name,
      ref
    });
  });
}
function TextInput($$renderer, $$props) {
  const $$slots = sanitize_slots($$props);
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, [
    "size",
    "value",
    "placeholder",
    "light",
    "disabled",
    "helperText",
    "id",
    "name",
    "labelText",
    "hideLabel",
    "maxCount",
    "invalid",
    "invalidText",
    "warn",
    "warnText",
    "ref",
    "required",
    "inline",
    "readonly",
    "fluid"
  ]);
  $$renderer.component(($$renderer2) => {
    let showInvalid, showWarn, isFluid, helperId, errorId, warnId;
    let size = fallback($$props["size"], void 0);
    let value = fallback($$props["value"], "");
    let placeholder = fallback($$props["placeholder"], "");
    let light = fallback($$props["light"], false);
    let disabled = fallback($$props["disabled"], false);
    let helperText = fallback($$props["helperText"], "");
    let id = fallback($$props["id"], uniqueId, true);
    let name = fallback($$props["name"], void 0);
    let labelText = fallback($$props["labelText"], "");
    let hideLabel = fallback($$props["hideLabel"], false);
    let maxCount = fallback($$props["maxCount"], void 0);
    let invalid = fallback($$props["invalid"], false);
    let invalidText = fallback($$props["invalidText"], "");
    let warn = fallback($$props["warn"], false);
    let warnText = fallback($$props["warnText"], "");
    let ref = fallback($$props["ref"], null);
    let required = fallback($$props["required"], false);
    let inline = fallback($$props["inline"], false);
    let readonly = fallback($$props["readonly"], false);
    let fluid = fallback($$props["fluid"], false);
    const ctx = getContext("carbon:Form");
    showInvalid = invalid && !disabled && !readonly;
    showWarn = warn && !invalid && !disabled && !readonly;
    isFluid = !inline && (fluid || !!ctx?.isFluid);
    helperId = `helper-${id}`;
    errorId = `error-${id}`;
    warnId = `warn-${id}`;
    $$renderer2.push(`<div${attr_class("", void 0, {
      "bx--form-item": true,
      "bx--text-input-wrapper": true,
      "bx--text-input-wrapper--inline": inline,
      "bx--text-input-wrapper--light": light,
      "bx--text-input-wrapper--readonly": readonly,
      "bx--text-input--fluid": isFluid
    })}>`);
    if (inline) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("", void 0, { "bx--text-input__label-helper-wrapper": true })}>`);
      if (labelText || $$slots.labelChildren) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class("", void 0, { "bx--text-input__label-wrapper": true })}><label${attr("for", id)}${attr_class("", void 0, {
          "bx--label": true,
          "bx--visually-hidden": hideLabel,
          "bx--label--disabled": disabled,
          "bx--label--inline": inline,
          "bx--label--inline--xs": size === "xs",
          "bx--label--inline--sm": size === "sm",
          "bx--label--inline--xl": size === "xl",
          "bx--label--slotted": isFluid && $$slots.labelChildren
        })}><!--[-->`);
        slot($$renderer2, $$props, "labelChildren", {}, () => {
          $$renderer2.push(`${escape_html(labelText)}`);
        });
        $$renderer2.push(`<!--]--></label> `);
        if (maxCount != null) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<div${attr_class("", void 0, {
            "bx--label": true,
            "bx--label--disabled": disabled,
            "bx--text-input__label-counter": true
          })}>${escape_html(graphemeCount((value ?? "").toString()))}/${escape_html(maxCount)}</div>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (!isFluid && helperText) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class("", void 0, {
          "bx--form__helper-text": true,
          "bx--form__helper-text--disabled": disabled,
          "bx--form__helper-text--inline": inline
        })}>${escape_html(helperText)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!inline && (labelText || $$slots.labelChildren)) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr_class("", void 0, { "bx--text-input__label-wrapper": true })}><label${attr("for", id)}${attr_class("", void 0, {
        "bx--label": true,
        "bx--visually-hidden": hideLabel,
        "bx--label--disabled": disabled,
        "bx--label--inline": inline,
        "bx--label--inline-sm": inline && size === "sm",
        "bx--label--inline-xl": inline && size === "xl",
        "bx--label--slotted": isFluid && $$slots.labelChildren
      })}><!--[-->`);
      slot($$renderer2, $$props, "labelChildren", {}, () => {
        $$renderer2.push(`${escape_html(labelText)}`);
      });
      $$renderer2.push(`<!--]--></label> `);
      if (maxCount != null) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div${attr_class("", void 0, {
          "bx--label": true,
          "bx--label--disabled": disabled,
          "bx--text-input__label-counter": true
        })}>${escape_html(graphemeCount((value ?? "").toString()))}/${escape_html(maxCount)}</div>`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <div${attr_class("", void 0, {
      "bx--text-input__field-outer-wrapper": true,
      "bx--text-input__field-outer-wrapper--inline": inline
    })}><div${attr("data-invalid", showInvalid || void 0)}${attr("data-warn", showWarn || void 0)}${attr_class("", void 0, {
      "bx--text-input__field-wrapper": true,
      "bx--text-input__field-wrapper--warning": showWarn
    })}>`);
    if (readonly) {
      $$renderer2.push("<!--[-->");
      EditOff($$renderer2, { class: "bx--text-input__readonly-icon" });
    } else {
      $$renderer2.push("<!--[!-->");
      if (showInvalid) {
        $$renderer2.push("<!--[-->");
        WarningFilled($$renderer2, { class: "bx--text-input__invalid-icon" });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--> `);
      if (showWarn) {
        $$renderer2.push("<!--[-->");
        WarningAltFilled($$renderer2, {
          class: "bx--text-input__invalid-icon\n            bx--text-input__invalid-icon--warning"
        });
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]-->`);
    }
    $$renderer2.push(`<!--]--> <input${attributes(
      {
        "data-invalid": showInvalid || void 0,
        "aria-invalid": showInvalid || void 0,
        "data-warn": showWarn || void 0,
        "aria-errormessage": showInvalid ? errorId : void 0,
        "aria-describedby": showInvalid ? void 0 : showWarn ? warnId : helperText && !isFluid ? helperId : void 0,
        disabled,
        id,
        name,
        placeholder,
        value,
        required,
        readonly,
        maxlength: maxCount ?? void 0,
        ...$$restProps
      },
      void 0,
      {
        "bx--text-input": true,
        "bx--text-input--light": light,
        "bx--text-input--invalid": showInvalid,
        "bx--text-input--warning": showWarn,
        "bx--text-input--xs": size === "xs",
        "bx--text-input--sm": size === "sm",
        "bx--text-input--xl": size === "xl"
      },
      void 0,
      4
    )}/> `);
    if (isFluid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<hr${attr_class("", void 0, { "bx--text-input__divider": true })}/>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (isFluid && showInvalid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", errorId)} role="alert"${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (isFluid && showWarn) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div> `);
    if (!showInvalid && !showWarn && !isFluid && !inline && helperText) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", helperId)}${attr_class("", void 0, {
        "bx--form__helper-text": true,
        "bx--form__helper-text--disabled": disabled,
        "bx--form__helper-text--inline": inline
      })}>${escape_html(helperText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!isFluid && showInvalid) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", errorId)} role="alert"${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(invalidText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    if (!isFluid && showWarn) {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<div${attr("id", warnId)}${attr_class("", void 0, { "bx--form-requirement": true })}>${escape_html(warnText)}</div>`);
    } else {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--></div></div>`);
    bind_props($$props, {
      size,
      value,
      placeholder,
      light,
      disabled,
      helperText,
      id,
      name,
      labelText,
      hideLabel,
      maxCount,
      invalid,
      invalidText,
      warn,
      warnText,
      ref,
      required,
      inline,
      readonly,
      fluid
    });
  });
}
function Tile($$renderer, $$props) {
  const $$sanitized_props = sanitize_props($$props);
  const $$restProps = rest_props($$sanitized_props, ["light"]);
  let light = fallback($$props["light"], false);
  $$renderer.push(`<div${attributes({ ...$$restProps }, void 0, { "bx--tile": true, "bx--tile--light": light })}><!--[-->`);
  slot($$renderer, $$props, "default", {}, null);
  $$renderer.push(`<!--]--></div>`);
  bind_props($$props, { light });
}
function _page($$renderer, $$props) {
  $$renderer.component(($$renderer2) => {
    let errorCount, warningCount, totalMinutes;
    const PASS_SCORE = 80;
    const PASS_STREAK = 2;
    const confusablePairs = [
      ["/b/", "/p/"],
      ["/d/", "/t/"],
      ["/f/", "/v/"],
      ["/m/", "/n/"],
      ["/ɪ/", "/iː/"],
      ["/æ/", "/e/"]
    ];
    const initialCourse = () => ({
      id: "course-phonics-1",
      title: "Starter Phonics · 声音侦探",
      level: "启蒙一级",
      ageRange: "5–6 岁",
      objective: "建立音素意识，能听辨、拼读并书写短元音单词。",
      updatedAt: "2026-09-24T16:20:00+08:00",
      activities: [
        {
          id: "a-1",
          type: "音素",
          title: "听音游戏：认识 /m/",
          content: "/m/",
          phonemes: ["/m/"],
          dependencies: [],
          difficulty: 1,
          prompt: "闭上嘴唇，轻轻发出 /m/，感受鼻子的震动。",
          accessibility: "提供口型示范图和可重复播放的低频音频。",
          duration: 6,
          feedback: ""
        },
        {
          id: "a-2",
          type: "音素",
          title: "首音识别：/s/ 与 /m/",
          content: "/s/ /m/",
          phonemes: ["/s/", "/m/"],
          dependencies: ["a-1"],
          difficulty: 1,
          prompt: "听到单词时拍手，听到 /m/ 时把手放在鼻子上。",
          accessibility: "视觉提示使用不同形状，不只依赖颜色。",
          duration: 8,
          feedback: ""
        },
        {
          id: "a-3",
          type: "单词",
          title: "拼读短词：sat",
          content: "s – a – t → sat",
          phonemes: ["/s/", "/æ/", "/t/"],
          dependencies: ["a-2"],
          difficulty: 2,
          prompt: "用手指依次点每个字母，再连起来读。",
          accessibility: "字母块支持键盘逐字聚焦和屏幕阅读器朗读。",
          duration: 10,
          feedback: "三条电缆拼在一起形成完整电路。"
        },
        {
          id: "a-4",
          type: "练习",
          title: "听音选图：m / s 开头",
          content: "moon, sun, mat, sock",
          phonemes: ["/m/", "/s/"],
          dependencies: ["a-2"],
          difficulty: 2,
          prompt: "先听单词，再从两张图片中选出正确首音。",
          accessibility: "所有图片均配替代文本，可只用键盘选择。",
          duration: 8,
          feedback: ""
        },
        {
          id: "a-5",
          type: "音素",
          title: "短元音 /æ/ 的口型",
          content: "/æ/",
          phonemes: ["/æ/"],
          dependencies: ["a-1"],
          difficulty: 2,
          prompt: "嘴巴张大，舌尖放低，声音短而有力。",
          accessibility: "提供正面口型、侧面舌位和慢速音频。",
          duration: 6,
          feedback: ""
        },
        {
          id: "a-6",
          type: "句子",
          title: "拼读句子：Mat sat.",
          content: "Mat sat on the mat.",
          phonemes: ["/m/", "/æ/", "/s/", "/t/"],
          dependencies: ["a-3"],
          difficulty: 3,
          prompt: "先读每个单词，再按意群连读句子。",
          accessibility: "句子可按词高亮，并提供更大字号选项。",
          duration: 10,
          feedback: "读对了，再试试让声音更连贯。"
        },
        {
          id: "a-7",
          type: "练习",
          title: "把单词和图片配对",
          content: "mat · map · sun · sock",
          phonemes: ["/m/", "/æ/", "/s/"],
          dependencies: ["a-3", "a-4"],
          difficulty: 3,
          prompt: "读出单词，然后把单词卡拖到对应图片。",
          accessibility: "支持键盘选择起点和终点，不使用拖拽也能完成。",
          duration: 12,
          feedback: "答对后播放该单词的分解音。"
        },
        {
          id: "a-8",
          type: "句子",
          title: "迁移朗读：A man sat.",
          content: "A man sat and had a nap.",
          phonemes: ["/m/", "/æ/", "/n/"],
          dependencies: ["a-6"],
          difficulty: 4,
          prompt: "观察 a 和 man 之间的联系，再完整朗读。",
          accessibility: "提供分句导航、朗读速度控制和高对比模式。",
          duration: 12,
          feedback: ""
        }
      ],
      versions: [
        {
          id: "v-1",
          label: "初稿",
          savedAt: "2026-09-21T10:00:00+08:00",
          note: "完成音素和基础拼读活动。",
          activities: []
        },
        {
          id: "v-2",
          label: "增加句子迁移",
          savedAt: "2026-09-24T15:30:00+08:00",
          note: "补充 A man sat and had a nap.",
          activities: [
            {
              id: "a-1",
              type: "音素",
              title: "听音游戏：认识 /m/",
              content: "/m/",
              phonemes: ["/m/"],
              dependencies: [],
              difficulty: 1,
              prompt: "闭上嘴唇，轻轻发出 /m/。",
              accessibility: "口型示范和重复音频。",
              duration: 6,
              feedback: ""
            },
            {
              id: "a-2",
              type: "音素",
              title: "首音识别：/s/ 与 /m/",
              content: "/s/ /m/",
              phonemes: ["/s/", "/m/"],
              dependencies: ["a-1"],
              difficulty: 1,
              prompt: "听到单词时拍手。",
              accessibility: "不同形状的视觉提示。",
              duration: 8,
              feedback: ""
            },
            {
              id: "a-3",
              type: "单词",
              title: "拼读短词：sat",
              content: "s – a – t → sat",
              phonemes: ["/s/", "/æ/", "/t/"],
              dependencies: ["a-2"],
              difficulty: 2,
              prompt: "用手指依次点每个字母。",
              accessibility: "键盘逐字聚焦。",
              duration: 10,
              feedback: "形成完整电路。"
            },
            {
              id: "a-6",
              type: "句子",
              title: "拼读句子：Mat sat.",
              content: "Mat sat on the mat.",
              phonemes: ["/m/", "/æ/", "/s/", "/t/"],
              dependencies: ["a-3"],
              difficulty: 3,
              prompt: "先读每个单词，再按意群连读。",
              accessibility: "按词高亮。",
              duration: 10,
              feedback: "再试试更连贯。"
            }
          ]
        }
      ]
    });
    let course = initialCourse();
    let selectedActivityId = course.activities[0]?.id ?? "";
    let activeView = "compose";
    let compareBaseId = course.versions[0]?.id ?? "";
    let compareTargetId = course.versions.at(-1)?.id ?? "";
    let online = true;
    let savedLabel = "等待载入";
    let history = [];
    let future = [];
    let selectedActivity = null;
    let diagnostics = [];
    let students = [];
    let selectedStudentId = "";
    let selectedStudent = null;
    let studentRows = [];
    let blockedRows = [];
    function analyzeCourse(current) {
      const issues = [];
      const learned = /* @__PURE__ */ new Set();
      const seenPhonemes = [];
      current.activities.forEach((activity, index) => {
        activity.phonemes.forEach((phoneme) => {
          if (!learned.has(phoneme) && activity.type !== "音素") {
            issues.push({
              id: `early-${activity.id}-${phoneme}`,
              activityId: activity.id,
              level: "error",
              category: "前置知识",
              title: `${activity.title} 提前使用 ${phoneme}`,
              detail: `第 ${index + 1} 个活动中使用了尚未单独教学的音素。请增加前置音素活动或调整顺序。`
            });
          }
          if (activity.type === "音素") learned.add(phoneme);
          seenPhonemes.push({ activity, phoneme });
        });
        if (activity.type === "句子") {
          const words = activity.content.trim().split(/\s+/).filter(Boolean);
          if (words.length > 12) issues.push({
            id: `long-${activity.id}`,
            activityId: activity.id,
            level: "warning",
            category: "例句长度",
            title: `${activity.title} 包含 ${words.length} 个单词`,
            detail: "启蒙阶段建议控制在 12 个单词以内，或拆成两个意群。"
          });
        }
        if (activity.type === "练习" && !activity.feedback.trim()) issues.push({
          id: `feedback-${activity.id}`,
          activityId: activity.id,
          level: "error",
          category: "练习反馈",
          title: `${activity.title} 缺少反馈`,
          detail: "答对或答错后需要给出可理解、可行动的学习反馈。"
        });
        if (!activity.accessibility.trim()) issues.push({
          id: `a11y-${activity.id}`,
          activityId: activity.id,
          level: "error",
          category: "无障碍说明",
          title: `${activity.title} 缺少无障碍说明`,
          detail: "请说明视觉、听觉、运动或认知支持方式。"
        });
        activity.dependencies.forEach((dependency) => {
          if (!current.activities.some((item) => item.id === dependency)) issues.push({
            id: `missing-dep-${activity.id}-${dependency}`,
            activityId: activity.id,
            level: "error",
            category: "依赖缺失",
            title: `${activity.title} 的依赖已不存在`,
            detail: "请移除失效依赖或重新选择前置活动。"
          });
        });
      });
      confusablePairs.forEach(([left, right]) => {
        const leftActivity = seenPhonemes.find((item) => item.phoneme === left)?.activity;
        const rightActivity = seenPhonemes.find((item) => item.phoneme === right)?.activity;
        if (leftActivity && rightActivity) issues.push({
          id: `confusable-${left}-${right}`,
          activityId: rightActivity.id,
          level: "info",
          category: "相似音",
          title: `${left} 与 ${right} 可能混淆`,
          detail: `建议在“${leftActivity.title}”和“${rightActivity.title}”之间加入口型对比或辨音练习。`
        });
      });
      const cycle = findDependencyCycle(current.activities);
      if (cycle) issues.push({
        id: "cycle",
        activityId: cycle[0],
        level: "error",
        category: "依赖关系",
        title: "活动依赖形成循环",
        detail: cycle.join(" → ")
      });
      return issues;
    }
    function findDependencyCycle(activities) {
      const byId = new Map(activities.map((activity) => [activity.id, activity]));
      const visiting = /* @__PURE__ */ new Set();
      const visited = /* @__PURE__ */ new Set();
      let cycle = [];
      const visit = (id, path) => {
        if (visiting.has(id)) {
          cycle = [...path.slice(path.indexOf(id)), id];
          return true;
        }
        if (visited.has(id)) return false;
        visiting.add(id);
        const activity = byId.get(id);
        for (const dependency of activity?.dependencies ?? []) {
          if (visit(dependency, [...path, dependency])) return true;
        }
        visiting.delete(id);
        visited.add(id);
        return false;
      };
      for (const activity of activities) {
        if (visit(activity.id, [activity.id])) break;
      }
      return cycle.length ? cycle : null;
    }
    function compareCourseVersions(current, baseId, targetId) {
      const base = current.versions.find((version) => version.id === baseId);
      const target = current.versions.find((version) => version.id === targetId);
      if (!base || !target) return [];
      const rows = [];
      const baseMap = new Map(base.activities.map((activity) => [activity.id, activity]));
      const targetMap = new Map(target.activities.map((activity) => [activity.id, activity]));
      for (const activity of base.activities) {
        if (!targetMap.has(activity.id)) rows.push({
          id: activity.id,
          title: activity.title,
          kind: "removed",
          detail: "目标版本已删除该活动"
        });
      }
      for (const activity of target.activities) {
        const before = baseMap.get(activity.id);
        if (!before) {
          rows.push({
            id: activity.id,
            title: activity.title,
            kind: "added",
            detail: `${activity.type} · ${activity.duration} 分钟`
          });
          continue;
        }
        const fields = [];
        if (before.title !== activity.title) fields.push("标题");
        if (before.content !== activity.content) fields.push("内容");
        if (before.difficulty !== activity.difficulty) fields.push("难度");
        if (before.duration !== activity.duration) fields.push("时长");
        if (JSON.stringify(before.dependencies) !== JSON.stringify(activity.dependencies)) fields.push("依赖");
        if (before.prompt !== activity.prompt || before.accessibility !== activity.accessibility) fields.push("提示或无障碍");
        if (before.feedback !== activity.feedback) fields.push("练习反馈");
        if (fields.length) rows.push({
          id: activity.id,
          title: activity.title,
          kind: "changed",
          detail: `变化字段：${fields.join("、")}`
        });
      }
      return rows;
    }
    function isAssignmentPassed(assignment) {
      const attempts = assignment.attempts;
      if (attempts.length < PASS_STREAK) return false;
      return attempts.slice(-PASS_STREAK).every((attempt) => attempt.score >= PASS_SCORE);
    }
    function trailingStreak(assignment) {
      let streak = 0;
      for (let index = assignment.attempts.length - 1; index >= 0; index -= 1) {
        if (assignment.attempts[index].score >= PASS_SCORE) streak += 1;
        else break;
      }
      return Math.min(streak, PASS_STREAK);
    }
    function buildAssignmentRows(student, current) {
      const order = new Map(current.activities.map((activity, index) => [activity.id, index]));
      return student.assignments.map((assignment) => {
        const activity = current.activities.find((item) => item.id === assignment.activityId) ?? null;
        const blockers = activity ? activity.dependencies.flatMap((dependencyId) => {
          const dependencyActivity = current.activities.find((item) => item.id === dependencyId);
          if (!dependencyActivity) return [];
          const dependencyAssignment = student.assignments.find((item) => item.activityId === dependencyId);
          if (!dependencyAssignment) return [
            {
              id: dependencyId,
              title: dependencyActivity.title,
              reason: "未布置"
            }
          ];
          if (!isAssignmentPassed(dependencyAssignment)) return [
            {
              id: dependencyId,
              title: dependencyActivity.title,
              reason: "未过关"
            }
          ];
          return [];
        }) : [];
        const scores = assignment.attempts.map((attempt) => attempt.score);
        return {
          assignment,
          activity,
          blockers,
          passed: isAssignmentPassed(assignment),
          bestScore: scores.length ? Math.max(...scores) : null,
          streak: trailingStreak(assignment)
        };
      }).sort((left, right) => {
        const leftIndex = order.get(left.assignment.activityId);
        const rightIndex = order.get(right.assignment.activityId);
        if (leftIndex !== void 0 && rightIndex !== void 0) return leftIndex - rightIndex;
        if (leftIndex !== void 0) return -1;
        if (rightIndex !== void 0) return 1;
        return left.assignment.assignedAt.localeCompare(right.assignment.assignedAt);
      });
    }
    function summarizeStudent(student, current) {
      const rows = buildAssignmentRows(student, current).filter((row) => row.activity);
      const stuck = rows.find((row) => !row.passed && row.blockers.length > 0);
      return {
        passed: rows.filter((row) => row.passed).length,
        total: rows.length,
        stuckTitle: stuck ? stuck.activity?.title ?? stuck.assignment.activityTitle : "",
        stuckReason: stuck ? stuck.blockers.map((blocker) => `《${blocker.title}》${blocker.reason}`).join("、") : ""
      };
    }
    selectedActivity = course.activities.find((activity) => activity.id === selectedActivityId) ?? course.activities[0] ?? null;
    diagnostics = analyzeCourse(course);
    compareCourseVersions(course, compareBaseId, compareTargetId);
    errorCount = diagnostics.filter((issue) => issue.level === "error").length;
    warningCount = diagnostics.filter((issue) => issue.level === "warning").length;
    totalMinutes = course.activities.reduce((sum, activity) => sum + activity.duration, 0);
    selectedStudent = students.find((student) => student.id === selectedStudentId) ?? students[0] ?? null;
    studentRows = selectedStudent ? buildAssignmentRows(selectedStudent, course) : [];
    selectedStudent ? course.activities.filter((activity) => !selectedStudent?.assignments.some((assignment) => assignment.activityId === activity.id)) : [];
    studentRows.filter((row) => row.activity && row.passed).length;
    blockedRows = studentRows.filter((row) => row.activity && !row.passed && row.blockers.length > 0);
    blockedRows.map((row) => `《${row.activity?.title ?? row.assignment.activityTitle}》等待 ${row.blockers.map((blocker) => `《${blocker.title}》${blocker.reason}`).join("、")}`).join("；");
    students.map((student) => ({ student, ...summarizeStudent(student, course) }));
    $$renderer2.push(`<div class="app-frame"><header class="app-header"><div class="brand"><div class="brand-symbol" aria-hidden="true"><span>a</span><i>+</i><span>m</span></div> <div><h1>Phonics Studio</h1> <p>儿童自然拼读课程编排台</p></div></div> <div class="header-center"><span${attr_class("network-dot", void 0, { "connected": online })}></span> <span>${escape_html("本地离线编辑可用")}</span> <strong>${escape_html(savedLabel)}</strong></div> <div class="header-actions">`);
    Button($$renderer2, {
      size: "small",
      kind: "ghost",
      disabled: history.length === 0,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->撤销`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      size: "small",
      kind: "ghost",
      disabled: future.length === 0,
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->重做`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      size: "small",
      kind: "tertiary",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->保存`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----> `);
    Button($$renderer2, {
      size: "small",
      kind: "primary",
      children: ($$renderer3) => {
        $$renderer3.push(`<!---->存档版本`);
      },
      $$slots: { default: true }
    });
    $$renderer2.push(`<!----></div></header> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <section class="course-hero"><div class="hero-copy"><span class="kicker">COURSE BUILDER / ${escape_html(course.level)}</span> <h2>${escape_html(course.title)}</h2> <p>${escape_html(course.objective)}</p></div> <div class="hero-stats"><div><strong>${escape_html(course.activities.length)}</strong><span>活动</span></div> <div><strong>${escape_html(totalMinutes)}</strong><span>分钟</span></div> <div><strong class="critical">${escape_html(errorCount)}</strong><span>必修问题</span></div> <div><strong class="caution">${escape_html(warningCount)}</strong><span>建议调整</span></div></div></section> <nav class="workspace-tabs" aria-label="工作区"><button${attr_class("", void 0, { "active": activeView === "compose" })}><span>01</span><b>课程编排</b><small>活动、依赖与教学说明</small></button> <button${attr_class("", void 0, { "active": activeView === "path" })}><span>02</span><b>学习路径</b><small>多屏幕顺序预览</small></button> <button${attr_class("", void 0, { "active": activeView === "issues" })}><span>03</span><b>质量检查</b><small>音素、句子与反馈</small></button> <button${attr_class("", void 0, { "active": activeView === "versions" })}><span>04</span><b>版本与复用</b><small>复制、存档与比较</small></button> <button${attr_class("", void 0, { "active": activeView === "students" })}><span>05</span><b>学生补练</b><small>布置、记录与过关</small></button></nav> `);
    {
      $$renderer2.push("<!--[-->");
      $$renderer2.push(`<main class="compose-layout"><aside class="activity-sidebar"><div class="sidebar-heading"><div><span class="kicker">LESSON MAP</span><h3>学习活动</h3></div> `);
      Button($$renderer2, {
        size: "small",
        kind: "ghost",
        children: ($$renderer3) => {
          $$renderer3.push(`<!---->添加`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></div> <div class="type-legend"><!--[-->`);
      const each_array = ensure_array_like(["音素", "单词", "句子", "练习"]);
      for (let $$index = 0, $$length = each_array.length; $$index < $$length; $$index++) {
        let type = each_array[$$index];
        $$renderer2.push(`<span><i${attr_class("", void 0, { "practice": type === "练习", "phoneme": type === "音素" })}></i>${escape_html(type)}</span>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="activity-list"><!--[-->`);
      const each_array_1 = ensure_array_like(course.activities);
      for (let index = 0, $$length = each_array_1.length; index < $$length; index++) {
        let activity = each_array_1[index];
        $$renderer2.push(`<button${attr_class("activity-row", void 0, { "selected": activity.id === selectedActivityId })}><span class="sequence">${escape_html(String(index + 1).padStart(2, "0"))}</span> <span${attr_class(`activity-type ${stringify(activity.type)}`)}>${escape_html(activity.type)}</span> <span class="activity-copy"><b>${escape_html(activity.title)}</b><small>${escape_html(activity.duration)} 分钟 · 难度 ${escape_html(activity.difficulty)}/5</small></span> `);
        if (activity.dependencies.length) {
          $$renderer2.push("<!--[-->");
          $$renderer2.push(`<i title="有前置依赖">↳</i>`);
        } else {
          $$renderer2.push("<!--[!-->");
        }
        $$renderer2.push(`<!--]--></button>`);
      }
      $$renderer2.push(`<!--]--></div> <div class="sidebar-help">快捷键：Alt + N 新建 · Alt + ↑/↓ 调整顺序</div></aside> <section class="editor-column">`);
      if (selectedActivity) {
        $$renderer2.push("<!--[-->");
        $$renderer2.push(`<div class="editor-toolbar"><div><span class="kicker">ACTIVITY EDITOR</span> <h3>${escape_html(selectedActivity.type)}活动</h3></div> <div>`);
        Button($$renderer2, {
          size: "small",
          kind: "ghost",
          disabled: course.activities[0]?.id === selectedActivity.id,
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->上移`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----> `);
        Button($$renderer2, {
          size: "small",
          kind: "ghost",
          disabled: course.activities.at(-1)?.id === selectedActivity.id,
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->下移`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----> `);
        Button($$renderer2, {
          size: "small",
          kind: "ghost",
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->复制`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----> `);
        Button($$renderer2, {
          size: "small",
          kind: "danger-ghost",
          children: ($$renderer3) => {
            $$renderer3.push(`<!---->删除`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----></div></div> `);
        Tile($$renderer2, {
          class: "editor-card",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="form-grid">`);
            TextInput($$renderer3, { labelText: "活动标题", value: selectedActivity.title });
            $$renderer3.push(`<!----> `);
            Select($$renderer3, {
              labelText: "活动类型",
              selected: selectedActivity.type,
              children: ($$renderer4) => {
                SelectItem($$renderer4, { value: "音素", text: "音素" });
                $$renderer4.push(`<!----> `);
                SelectItem($$renderer4, { value: "单词", text: "单词" });
                $$renderer4.push(`<!----> `);
                SelectItem($$renderer4, { value: "句子", text: "句子" });
                $$renderer4.push(`<!----> `);
                SelectItem($$renderer4, { value: "练习", text: "练习活动" });
                $$renderer4.push(`<!---->`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----> `);
            TextInput($$renderer3, {
              labelText: "预计时长（分钟）",
              type: "number",
              min: "1",
              max: "60",
              value: String(selectedActivity.duration)
            });
            $$renderer3.push(`<!----> <div class="difficulty-field"><label for="difficulty">难度：${escape_html(selectedActivity.difficulty)}/5</label> <input id="difficulty" type="range" min="1" max="5"${attr("value", selectedActivity.difficulty)}/></div></div> `);
            TextArea($$renderer3, {
              labelText: selectedActivity.type === "音素" ? "音素内容" : selectedActivity.type === "句子" ? "目标句子" : "教学内容",
              rows: 3,
              value: selectedActivity.content
            });
            $$renderer3.push(`<!----> `);
            TextInput($$renderer3, {
              labelText: "涉及音素（用逗号或空格分隔）",
              value: selectedActivity.phonemes.join(", ")
            });
            $$renderer3.push(`<!----> `);
            TextArea($$renderer3, { labelText: "教师提示语", rows: 2, value: selectedActivity.prompt });
            $$renderer3.push(`<!----> `);
            TextArea($$renderer3, {
              labelText: "无障碍说明",
              rows: 2,
              value: selectedActivity.accessibility
            });
            $$renderer3.push(`<!----> `);
            TextArea($$renderer3, {
              labelText: selectedActivity.type === "练习" ? "练习反馈（必填）" : "学习反馈",
              rows: 2,
              value: selectedActivity.feedback
            });
            $$renderer3.push(`<!---->`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!----> `);
        Tile($$renderer2, {
          class: "dependency-card",
          children: ($$renderer3) => {
            $$renderer3.push(`<div class="section-title"><div><span class="kicker">PREREQUISITES</span><h3>前置活动与依赖关系</h3><p>只有完成选中的活动后，系统才会按当前顺序推荐本活动。</p></div> `);
            Tag($$renderer3, {
              type: "cool-gray",
              children: ($$renderer4) => {
                $$renderer4.push(`<!---->${escape_html(selectedActivity.dependencies.length)} 个依赖`);
              },
              $$slots: { default: true }
            });
            $$renderer3.push(`<!----></div> <div class="dependency-grid"><!--[-->`);
            const each_array_2 = ensure_array_like(course.activities.filter((activity) => activity.id !== selectedActivity?.id));
            for (let $$index_2 = 0, $$length = each_array_2.length; $$index_2 < $$length; $$index_2++) {
              let activity = each_array_2[$$index_2];
              Checkbox($$renderer3, {
                labelText: `${activity.title} · ${activity.type}`,
                checked: selectedActivity.dependencies.includes(activity.id)
              });
            }
            $$renderer3.push(`<!--]--></div>`);
          },
          $$slots: { default: true }
        });
        $$renderer2.push(`<!---->`);
      } else {
        $$renderer2.push("<!--[!-->");
      }
      $$renderer2.push(`<!--]--></section> <aside class="inspector">`);
      Tile($$renderer2, {
        class: "compact-card",
        children: ($$renderer3) => {
          $$renderer3.push(`<span class="kicker">COURSE META</span><h3>课程信息</h3> `);
          TextInput($$renderer3, { labelText: "课程名称", value: course.title });
          $$renderer3.push(`<!----> `);
          TextInput($$renderer3, { labelText: "课程等级", value: course.level });
          $$renderer3.push(`<!----> `);
          TextInput($$renderer3, { labelText: "适用年龄", value: course.ageRange });
          $$renderer3.push(`<!----> `);
          TextArea($$renderer3, { labelText: "学习目标", rows: 3, value: course.objective });
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----> `);
      Tile($$renderer2, {
        class: "compact-card issue-peek",
        children: ($$renderer3) => {
          $$renderer3.push(`<div class="section-title"><div><span class="kicker">LIVE CHECK</span><h3>实时提示</h3></div>`);
          Tag($$renderer3, {
            type: errorCount ? "red" : "green",
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->${escape_html(errorCount ? `${errorCount} 项` : "通过")}`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!----></div> <!--[-->`);
          const each_array_3 = ensure_array_like(diagnostics.slice(0, 4));
          for (let $$index_3 = 0, $$length = each_array_3.length; $$index_3 < $$length; $$index_3++) {
            let issue = each_array_3[$$index_3];
            $$renderer3.push(`<button class="peek-row"><i${attr_class("", void 0, {
              "error": issue.level === "error",
              "warning": issue.level === "warning"
            })}></i> <span><b>${escape_html(issue.title)}</b><small>${escape_html(issue.category)}</small></span></button>`);
          }
          $$renderer3.push(`<!--]--> `);
          if (diagnostics.length === 0) {
            $$renderer3.push("<!--[-->");
            $$renderer3.push(`<p class="empty-state">课程结构完整，没有发现提示。</p>`);
          } else {
            $$renderer3.push("<!--[!-->");
          }
          $$renderer3.push(`<!--]--> `);
          Button($$renderer3, {
            size: "small",
            kind: "ghost",
            children: ($$renderer4) => {
              $$renderer4.push(`<!---->查看全部检查`);
            },
            $$slots: { default: true }
          });
          $$renderer3.push(`<!---->`);
        },
        $$slots: { default: true }
      });
      $$renderer2.push(`<!----></aside></main>`);
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> `);
    {
      $$renderer2.push("<!--[!-->");
    }
    $$renderer2.push(`<!--]--> <footer class="app-footer"><span>所有数据保存在当前浏览器 localStorage</span> <span>Ctrl/Cmd + Z 撤销 · Ctrl/Cmd + Y 重做 · Alt + N 新建活动 · Ctrl/Cmd + S 保存</span></footer></div>`);
  });
}
export {
  _page as default
};
