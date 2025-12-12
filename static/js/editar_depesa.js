const id = window.location.pathname.split("/").pop()
const API = `/despesas/${id}`

async function carregarDespesa() {
  const response = await fetch(API)
  const data = await response.json()

  descricao.value = data.descricao
  valor.value = data.valor
  data.value = data.data || ""

  if (data.parcelado) {
    parcelado.checked = true
    qtd_parcelas.value = data.qtd_parcelas
    parcelas_pagas.value = data.parcelas_pagas
  }
}

document.getElementById("formEditar").addEventListener("submit", async (e) => {
  e.preventDefault()

  const dados = {
    descricao: descricao.value,
    valor: parseFloat(valor.value),
    data: data.value,
    parcelado: parcelado.checked,
    qtd_parcelas: parcelado.checked ? parseInt(qtd_parcelas.value) : null,
    parcelas_pagas: parcelado.checked ? parseInt(parcelas_pagas.value) : 0,
  }

  await fetch(API, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(dados)
  })

  window.location.href = "/frontend/despesas"
})

carregarDespesa()
