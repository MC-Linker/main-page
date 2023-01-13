let observer = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
        if (entry.intersectionRatio === 1) {
            setTimeout(() => {
                entry.target.classList.add("shown");
            }, 150)
        }
    }
}, { threshold: 1 });

const hiddenElements = document.querySelectorAll('.unshown');
hiddenElements.forEach((el) => observer.observe(el));