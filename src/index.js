
console.log("im in!")
let observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        console.log(entry)
        entry.target.classList.toggle('opacity-100', entry.isIntersecting);
    })
});

const hiddenElements = document.querySelectorAll('.opacity-0');
hiddenElements.forEach((el) => observer.observe(el));