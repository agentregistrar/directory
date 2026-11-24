const form = document.querySelector("[data-search-form]");
const input = document.querySelector("[data-search-input]");
const count = document.querySelector("[data-search-count]");
const cards = Array.from(document.querySelectorAll("[data-entry]"));

if (input && cards.length > 0) {
  const params = new URLSearchParams(window.location.search);
  input.value = params.get("q") || "";

  const apply = () => {
    const query = input.value.trim().toLowerCase();
    let visible = 0;

    for (const card of cards) {
      const haystack = card.getAttribute("data-search") || "";
      const show = query === "" || haystack.includes(query);
      card.hidden = !show;
      if (show) visible += 1;
    }

    if (count) {
      count.textContent = `${visible} provider${visible === 1 ? "" : "s"}`;
    }

    const url = new URL(window.location.href);
    if (query) {
      url.searchParams.set("q", input.value.trim());
    } else {
      url.searchParams.delete("q");
    }
    window.history.replaceState(null, "", url);
  };

  if (form) {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      apply();
    });
  }

  input.addEventListener("input", apply);

  document.addEventListener("keydown", (event) => {
    const target = event.target;
    const typing =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (event.key === "/" && document.activeElement !== input && !typing) {
      event.preventDefault();
      input.focus();
    }

    if (event.key === "Escape" && document.activeElement === input) {
      input.value = "";
      apply();
    }
  });

  apply();
}
