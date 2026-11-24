const buttons = Array.from(document.querySelectorAll("[data-copy-target]"));

for (const button of buttons) {
  const targetId = button.getAttribute("data-copy-target");
  if (!targetId) continue;

  const originalLabel = button.textContent || "Copy";

  button.addEventListener("click", async () => {
    const target = document.getElementById(targetId);
    if (!target) return;

    try {
      await navigator.clipboard.writeText(target.textContent || "");
      button.textContent = "Copied";
    } catch {
      button.textContent = "Copy failed";
    }

    window.setTimeout(() => {
      button.textContent = originalLabel;
    }, 1500);
  });
}
