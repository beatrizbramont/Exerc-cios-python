const API = "/despesas";
const params = new URLSearchParams(window.location.search);
const idEdicao = params.get("id");

document.addEventListener("DOMContentLoaded", () => {

  const checkboxParcelado = document.getElementById("parcelado");
  const inputParcelas = document.getElementById("qtd_parcelas");
  const inputDataInicio = document.getElementById("data_inicio");

  if (checkboxParcelado && inputParcelas && inputDataInicio) {
    checkboxParcelado.addEventListener("change", () => {
      const ativo = checkboxParcelado.checked;
      inputParcelas.disabled = !ativo;
      inputDataInicio.disabled = !ativo;

      if (!ativo) {
        inputParcelas.value = "";
        inputDataInicio.value = "";
      }
    });
  }

  gerarEventosFormulario();
  carregarDespesas();
  carregarCategorias();
  carregarDespesaEdicao();
});

function gerarMeses(dataInicio, qtdParcelas) {
  const meses = [];
  const data = new Date(dataInicio);

  for (let i = 0; i < qtdParcelas; i++) {
    const d = new Date(data);
    d.setMonth(d.getMonth() + i);

    const mes = d.toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' });
    meses.push({ mes, pago: false });
  }

  return meses;
}

async function toggleParcela(idParcela) {
  await fetch(`/despesas/parcela/${idParcela}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status: "pago" })
  });

  carregarDespesas();
}

async function carregarDespesas() {
  const response = await fetch(API);
  const despesas = await response.json();

  const tabela = document.getElementById("tabelaDespesas");
  if (!tabela) return;

  tabela.innerHTML = "";

  despesas.forEach(d => {
    const row = document.createElement("tr");

    let colunasParcelas = "";
    let status = "Pago à vista";

    if (d.parcelado && d.parcelas) {
      colunasParcelas = d.parcelas.map((p, index) => `
        <td>
          <input 
            type="checkbox"
            ${p.pago ? "checked" : ""}
            onchange="toggleParcela(${d.id}, ${index})"
          />
          <small>${p.mes}</small>
        </td>
      `).join("");

      const pagas = d.parcelas.filter(p => p.pago).length;

      if (pagas === 0) status = "Em aberto";
      else if (pagas === d.parcelas.length) status = "Pago";
      else status = `Parcial (${pagas}/${d.parcelas.length})`;

    } else {
      colunasParcelas = `<td>À vista</td>`;
    }

    row.innerHTML = `
      <td>${d.descricao}</td>
      <td>R$ ${d.valor.toFixed(2)}</td>
      <td>${d.data || ""}</td>
      ${colunasParcelas}
      <td><strong>${status}</strong></td>
      <td><button onclick="excluirDespesa(${d.id})">✕</button></td>
    `;

    tabela.appendChild(row);
  });
}

async function criarDespesa(despesa) {
  const response = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(despesa)
  });

  if (!response.ok) {
    const erro = await response.json();
    alert(erro.erro || "Erro ao criar despesa");
    return;
  }

  carregarDespesas();
}

async function excluirDespesa(id) {
  const response = await fetch(`${API}/${id}`, { method: "DELETE" });

  if (!response.ok) {
    const erro = await response.json();
    alert(erro.erro || "Erro ao deletar despesa");
    return;
  }

  carregarDespesas();
}

async function carregarCategorias() {
  const response = await fetch("/categorias/");
  const categorias = await response.json();

  const select = document.getElementById("categoria_id");
  if (!select) return;

  categorias.forEach(c => {
    const option = document.createElement("option");
    option.value = c.id;
    option.textContent = c.nome;
    select.appendChild(option);
  });
}

async function carregarDespesaEdicao() {
  if (!idEdicao) return; 

  const response = await fetch(`${API}/${idEdicao}`);
  const despesa = await response.json();

  document.getElementById("descricao").value = despesa.descricao;
  document.getElementById("valor").value = despesa.valor;
  document.getElementById("data").value = despesa.data;
  document.getElementById("categoria_id").value = despesa.categoria_id;

  if (despesa.parcelado) {
    checkboxParcelado.checked = true;
    inputParcelas.disabled = false;
    inputDataInicio.disabled = false;

    document.getElementById("qtd_parcelas").value = despesa.qtd_parcelas;
    document.getElementById("data_inicio").value = despesa.data_inicio;
  }

  const botao = document.querySelector("#formDespesa button[type=submit]");
  if (botao) botao.textContent = "Salvar Alterações";
}

function gerarEventosFormulario() {
  const form = document.getElementById("formDespesa");

  if (!form) return;

  const checkboxParcelado = document.getElementById("parcelado");
  const inputParcelas = document.getElementById("qtd_parcelas");
  const inputDataInicio = document.getElementById("data_inicio");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const parcelado = checkboxParcelado?.checked || false;

    const qtdParcelas = parcelado
      ? parseInt(inputParcelas.value)
      : 1;

    const dataInicio = inputDataInicio?.value;

    let parcelas = [];

    if (parcelado && dataInicio) {
      parcelas = gerarMeses(dataInicio, qtdParcelas);
    }

    const despesa = {
      descricao: document.getElementById("descricao").value,
      valor: parseFloat(document.getElementById("valor").value),
      data: document.getElementById("data").value,
      data_inicio: dataInicio,
      categoria_id: parseInt(document.getElementById("categoria_id").value),
      parcelado,
      qtd_parcelas: qtdParcelas,
      parcelas
    };

    if (idEdicao) {

    await fetch(`${API}/${idEdicao}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(despesa)
    });

      alert("Despesa atualizada com sucesso!");
      window.location.href = "/minhas-despesas";

    } else {
        await criarDespesa(despesa);
        alert("Despesa cadastrada!");
    }

form.reset();

    if (inputParcelas) inputParcelas.disabled = true;
    if (inputDataInicio) inputDataInicio.disabled = true;
  });
}
