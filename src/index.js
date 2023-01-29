

let observer = new IntersectionObserver((entries, observer) => {
    for (const entry of entries) {
        if (entry.intersectionRatio === 1) {
            entry.target.classList.add("shown");
        }
    }
}, {});

const hiddenElements = document.querySelectorAll('.unshown');
hiddenElements.forEach((el) => observer.observe(el));

if(document.URL.includes("invite")){
    let counter = 3;
    setInterval(() => {
        counter > 0 ? counter-- : null;
        counter == 0 ? window.location.replace("https://discord.com/oauth2/authorize?client_id=712759741528408064&permissions=275415092224&scope=applications.commands%20bot") : null;
        counter == 0 ? document.getElementById("notRedirected").style.setProperty('opacity', '100%') : null;

        document.getElementById("counterElement").style.setProperty('--value', counter);
    }, 1000);
}

if(document.URL.includes("plugin")){
    let counter = 3;
    setInterval(() => {
        counter > 0 ? counter-- : null;
        counter == 0 ? window.location.replace("https://www.spigotmc.org/resources/discord-linker.98749/") : null;
        counter == 0 ? document.getElementById("notRedirected").style.setProperty('opacity', '100%') : null;

        document.getElementById("counterElement").style.setProperty('--value', counter);
    }, 1000);
}

document.querySelectorAll("[include-html]").forEach(async e => {
    const r = await fetch(e.getAttribute("include-html"));
    e.innerHTML = await r.text();
});