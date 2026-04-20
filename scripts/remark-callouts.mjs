export default function remarkCallouts() {
  const variantMap = {
    note: "note",
    info: "info",
    tip: "info",
    idea: "info",
    hint: "info",
    success: "success",
    check: "success",
    win: "success",
    warn: "warning",
    warning: "warning",
    caution: "warning",
    danger: "danger",
    important: "danger",
    alert: "danger",
  };

  const validVariants = new Set(Object.values(variantMap).concat(["note"]));

  const visit = (node, parent, callback) => {
    if (!node || typeof node !== "object") return;
    callback(node, parent);
    if (Array.isArray(node.children)) {
      node.children.forEach((child) => visit(child, node, callback));
    }
  };

  const humanize = (value) =>
    String(value || "")
      .replace(/[-_]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());

  return (tree) => {
    visit(tree, null, (node) => {
      if (node.type !== "blockquote" || !Array.isArray(node.children) || !node.children.length) {
        return;
      }

      const firstParagraph = node.children.find((child) => child.type === "paragraph");
      if (!firstParagraph || !Array.isArray(firstParagraph.children) || !firstParagraph.children.length) {
        return;
      }

      const textChildIndex = firstParagraph.children.findIndex(
        (child) => child.type === "text" && typeof child.value === "string",
      );
      if (textChildIndex === -1) return;

      const textChild = firstParagraph.children[textChildIndex];
      const match = textChild.value.match(/^\s*\[!([a-z0-9_-]+)\]\s*/i);
      if (!match) return;

      const rawVariant = match[1].toLowerCase();
      const variant = validVariants.has(rawVariant)
        ? rawVariant
        : variantMap[rawVariant] || "note";

      textChild.value = textChild.value.slice(match[0].length);
      if (!textChild.value.trim()) {
        firstParagraph.children.splice(textChildIndex, 1);
      }

      const label = humanize(match[1]);
      node.data = node.data || {};
      const existingClass =
        (node.data.hProperties && node.data.hProperties.class) || "";
      const classes = [existingClass, "callout", `callout--${variant}`]
        .filter(Boolean)
        .join(" ")
        .trim();

      node.data.hName = "div";
      node.data.hProperties = {
        ...(node.data.hProperties || {}),
        class: classes,
        "data-callout": variant,
        "data-callout-label": label || variant.toUpperCase(),
      };
    });
  };
}
