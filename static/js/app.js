document.addEventListener("DOMContentLoaded", () => {
    const menuCards = document.querySelectorAll(".menu-card");

    menuCards.forEach(card => {
        card.addEventListener("click", (e) => {
            const href = card.getAttribute("href");
            console.log(`Você clicou em: ${href}`);
        });
    });

    console.log("Página carregada: index.html");
});
