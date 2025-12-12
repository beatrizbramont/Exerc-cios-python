async function carregarDespesas() {
    const response = await fetch("http://127.0.0.1:8001/despesas/com-parcelas");
    const despesas = await response.json();

    const tbody = document.querySelector("#tabela-despesas tbody");
    tbody.innerHTML = "";

    despesas.forEach(d => {
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${d.descricao}</td>
            <td>R$ ${d.valor}</td>
            <td>
                ${
                    d.parcelado
                    ? `<button class="ver-parcelas" onclick='abrirModalParcelas(${JSON.stringify(
                        d
                    ).replace(/"/g, "&quot;")})'>Ver parcelas (${d.parcelas.length})</button>`
                    : `<span class="nao-parcelado">Não parcelado</span>`
                }
            </td>
            <td>
                <button class="editar" onclick="editarDespesa(${d.id})">Editar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });
}

function abrirModalParcelas(despesa) {
    const modal = document.getElementById("modal-parcelas");
    const titulo = document.getElementById("modal-titulo");
    const corpo = document.getElementById("parcelas-body");

    titulo.innerText = `Parcelas de: ${despesa.descricao}`;
    corpo.innerHTML = "";

    despesa.parcelas.forEach(p => {
        const tr = document.createElement("tr");
        tr.classList.add("parcela", p.status);

        tr.innerHTML = `
            <td>${p.mes}</td>
            <td>R$ ${p.valor}</td>
            <td>${p.status}</td>
            <td>
                <button class="pagar" onclick="alterarStatusParcela(${p.id}, 'pago')">Pagar</button>
                <button class="atrasado-btn" onclick="alterarStatusParcela(${p.id}, 'atrasado')">Atrasado</button>
                <button class="pendente-btn" onclick="alterarStatusParcela(${p.id}, 'pendente')">Pendente</button>
            </td>
        `;

        corpo.appendChild(tr);
    });

    modal.style.display = "block";
}

function fecharModal() {
    document.getElementById("modal-parcelas").style.display = "none";
    carregarDespesas(); 
}

window.onclick = function(event) {
    const modal = document.getElementById("modal-parcelas");
    if (event.target === modal) {
        fecharModal();
    }
};

async function alterarStatusParcela(id, status) {
    await fetch(`http://127.0.0.1:8001/despesas/parcela/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
    });

    fecharModal();
}

function editarDespesa(id) {
    window.location.href = `/despesas/editar/${id}`;
}

document.addEventListener("DOMContentLoaded", carregarDespesas);
