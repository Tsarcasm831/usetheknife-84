function initSidebar() {
  const rightSidebar = document.getElementById("right-sidebar");
  document.querySelectorAll("#close-right-sidebar").forEach((btn) => {
    btn.addEventListener("click", function () {
      rightSidebar.classList.remove("open");
    });
  });
  document.querySelectorAll("#expand-right-sidebar").forEach((btn) => {
    btn.addEventListener("click", function () {
      rightSidebar.classList.toggle("full-width");
      this.textContent = rightSidebar.classList.contains("full-width") ? "Shrink" : "Expand";
    });
  });
  document.querySelectorAll("#collapse-sidebar-content").forEach((btn) => {
    btn.addEventListener("click", function () {
      const content = document.getElementById("sidebar-content");
      if (content) {
        content.style.display = content.style.display === "none" ? "block" : "none";
        this.textContent = content.style.display === "none" ? "Show Content" : "Hide Content";
      }
    });
  });

  document.querySelectorAll(".sidebar-button, .sidebar-dropdown a").forEach((button) => {
    button.addEventListener("click", function (e) {
      e.preventDefault();
      const iframeSrc = this.getAttribute("data-iframe-src");
      if (iframeSrc && window.openIframeModal) {
        window.openIframeModal(iframeSrc);
      }
    });
  });
}

export { initSidebar };