(function () {
  function c() {
    var b = a.contentDocument || a.contentWindow.document;
    if (b) {
      var d = b.createElement("script");
      d.innerHTML =
        "window.__CF$cv$params={r:'96e76340150e371f',t:'MTc1NTA3OTQ2MC4wMDAwMDA='};var a=document.createElement('script');a.nonce='';a.src='/cdn-cgi/challenge-platform/scripts/jsd/main.js';document.getElementsByTagName('head')[0].appendChild(a);";
      b.getElementsByTagName("head")[0].appendChild(d);
    }
  }
  if (document.body) {
    var a = document.createElement("iframe");
    a.height = 1;
    a.width = 1;
    a.style.position = "absolute";
    a.style.top = 0;
    a.style.left = 0;
    a.style.border = "none";
    a.style.visibility = "hidden";
    document.body.appendChild(a);
    if ("loading" !== document.readyState) c();
    else if (window.addEventListener)
      document.addEventListener("DOMContentLoaded", c);
    else {
      var e = document.onreadystatechange || function () {};
      document.onreadystatechange = function (b) {
        e(b);
        "loading" !== document.readyState &&
          ((document.onreadystatechange = e), c());
      };
    }
  }
})();

// Mobile menu toggle
document
  .getElementById("mobile-menu-btn")
  .addEventListener("click", function () {
    const mobileMenu = document.getElementById("mobile-menu");
    mobileMenu.classList.toggle("hidden");
  });

// Smooth scrolling
function scrollToSection(sectionId) {
  document.getElementById(sectionId).scrollIntoView({
    behavior: "smooth",
  });
}

// Navigation links smooth scroll
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
    // Close mobile menu if open
    document.getElementById("mobile-menu").classList.add("hidden");
  });
});

// Form submission
function handleSubmit(event) {
  event.preventDefault();

  // Get form data
  const formData = new FormData(event.target);
  const name = event.target.querySelector('input[type="text"]').value;
  const phone = event.target.querySelector('input[type="tel"]').value;
  const service = event.target.querySelector("select").value;
  const description = event.target.querySelector("textarea").value;

  // Show success message
  alert(
    `درخواست شما با موفقیت ارسال شد!\n\nنام: ${name}\nتلفن: ${phone}\nخدمت: ${service}\n\nبه زودی با شما تماس خواهیم گرفت.`
  );

  // Reset form
  event.target.reset();
}

// Add fade-in animation on scroll
const observerOptions = {
  threshold: 0.1,
  rootMargin: "0px 0px -50px 0px",
};

const observer = new IntersectionObserver(function (entries) {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("fade-in");
    }
  });
}, observerOptions);

// Observe service cards
document.querySelectorAll(".service-card").forEach((card) => {
  observer.observe(card);
});

// Active navigation highlighting
window.addEventListener("scroll", function () {
  const sections = ["home", "services", "about", "contact"];
  const scrollPos = window.scrollY + 100;

  sections.forEach((section) => {
    const element = document.getElementById(section);
    const navLink = document.querySelector(`a[href="#${section}"]`);

    if (element && navLink) {
      const offsetTop = element.offsetTop;
      const height = element.offsetHeight;

      if (scrollPos >= offsetTop && scrollPos < offsetTop + height) {
        document.querySelectorAll(".nav-link").forEach((link) => {
          link.classList.remove("text-blue-600");
          link.classList.add("text-gray-700");
        });
        navLink.classList.remove("text-gray-700");
        navLink.classList.add("text-blue-600");
      }
    }
  });
});
