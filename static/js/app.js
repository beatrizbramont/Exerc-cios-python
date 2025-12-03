const API = "/despesas";

async function carregarDespesas() {
  const response = await fetch(API)
  const despesas = await response.json()

  const lista = document.getElementById("listaDespesas")
  lista.innerHTML = ""

  despesas.forEach(d => {
    const card = document.createElement("div")
    card.className = "card"

    card.innerHTML = `
      <div class="info">
        <p><strong>${d.descricao}</strong></p>
        <small>${d.data || ""}</small>
        <p class="valor">R$ ${d.valor}</p>
      </div>

      <button onclick="excluirDespesa(${d.id})">✕</button>
    `

    lista.appendChild(card)
  })
}

document.getElementById("formDespesa").addEventListener("submit", async (e) => {
  e.preventDefault()

  const despesa = {
    descricao: document.getElementById("descricao").value,
    valor: parseFloat(document.getElementById("valor").value),
    data: document.getElementById("data").value,
    categoria_id: parseInt(document.getElementById("categoria_id").value)
  }

  await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(despesa)
  })

  e.target.reset()
  carregarDespesas()
})

async function excluirDespesa(id) {
  await fetch(`${API}/${id}`, {
    method: "DELETE"
  })

  carregarDespesas()
}

carregarDespesas()
