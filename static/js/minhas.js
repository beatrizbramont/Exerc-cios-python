async function carregarDespesas() {
    const response = await fetch("http://127.0.0.1:8001/despesas/com-parcelas");
    const despesas = await response.json();

    const tbody = document.querySelector("#tabela-despesas tbody");
    tbody.innerHTML = "";

    despesas.forEach(d => {
        const tr = document.createElement("tr");

        // tabela interna das parcelas
        const parcelasHTML = `
            <table class="tabela-parcelas">
                <thead>
                    <tr>
                        <th>Mês</th>
                        <th>Valor</th>
                        <th>Status</th>
                        <th>Ações</th>
                    </tr>
                </thead>
                <tbody>
                    ${d.parcelas.map(p => `
                        <tr class="parcela ${p.status}">
                            <td>${p.mes}</td>
                            <td>R$ ${p.valor}</td>
                            <td>${p.status}</td>
                            <td>
                                <button onclick="alterarStatusParcela(${p.id}, 'pago')">Pagar</button>
                                <button onclick="alterarStatusParcela(${p.id}, 'atrasado')">Atrasado</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;

        tr.innerHTML = `
            <td>${d.descricao}</td>
            <td>R$ ${d.valor}</td>
            <td>${parcelasHTML}</td>
            <td>
                <button onclick="editarDespesa(${d.id})">Editar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

// PATCH de parcela
async function alterarStatusParcela(id, status) {
    await fetch(`http://127.0.0.1:8001/despesas/parcela/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    carregarDespesas();
}

function editarDespesa(id) {
    window.location.href = `/despesas/editar/${id}`;
}
document.addEventListener("DOMContentLoaded", carregarDespesas);


async function alterarStatusParcela(id, status) {
    await fetch(`http://127.0.0.1:8001/despesas/parcela/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    carregarDespesas();
}

document.addEventListener("DOMContentLoaded", carregarDespesas);
