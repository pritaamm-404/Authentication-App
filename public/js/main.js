// public/js/main.js
document.addEventListener("DOMContentLoaded", () => {
  // Password matching validation
  const passwordForms = document.querySelectorAll("form");

  passwordForms.forEach((form) => {
    const passwordInput = form.querySelector(
      'input[type="password"][name="password"]'
    );
    const confirmPasswordInput = form.querySelector(
      'input[type="password"][name="confirmPassword"]'
    );

    if (passwordInput && confirmPasswordInput) {
      form.addEventListener("submit", (e) => {
        if (passwordInput.value !== confirmPasswordInput.value) {
          e.preventDefault();
          alert("Passwords do not match");
        }
      });
    }
  });

  // Flash message auto-dismiss
  const flashMessages = document.querySelectorAll(".alert");
  flashMessages.forEach((message) => {
    setTimeout(() => {
      message.style.transition = "opacity 0.5s";
      message.style.opacity = "0";
      setTimeout(() => message.remove(), 500);
    }, 3000);
  });
});
