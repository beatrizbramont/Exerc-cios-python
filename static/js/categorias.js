const API = "http://127.0.0.1:8001/categorias/";

const form = document.getElementById("form-categoria");
const lista = document.getElementById("lista-categorias");
const inputNome = document.getElementById("nome");

let editandoId = null;

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = inputNome.value.trim();
  if (!nome) return alert("Digite um nome para a categoria.");

  try {
    if (editandoId) {
      await fetch(`${API}${editandoId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
      editandoId = null;
    } else {
      await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome }),
      });
    }

    form.reset();
    inputNome.focus();
    carregarCategorias();
  } catch (err) {
    console.error(err);
    alert("Erro ao salvar. Veja o console.");
  }
});

async function carregarCategorias() {
  try {
    const res = await fetch(API);
    if (!res.ok) throw new Error("Erro ao carregar categorias");
    const data = await res.json();

    lista.innerHTML = "";

    data.forEach(cat => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${cat.id}</td>
        <td class="nome-col">${escapeHtml(cat.nome)}</td>
        <td class="acoes-col">
          <button class="btn-icon btn-edit" data-id="${cat.id}" data-nome="${escapeAttr(cat.nome)}" title="Editar">
            <i class="fa-solid fa-pen"></i>
          </button>
          <button class="btn-icon btn-delete" data-id="${cat.id}" title="Excluir">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      `;

      lista.appendChild(tr);
    });
  } catch (err) {
    console.error(err);
    lista.innerHTML = `<tr><td colspan="3">Erro ao carregar categorias.</td></tr>`;
  }
}

lista.addEventListener("click", (ev) => {
  const btnEdit = ev.target.closest(".btn-edit");
  const btnDelete = ev.target.closest(".btn-delete");

  if (btnEdit) {
    const id = btnEdit.dataset.id;
    const nome = btnEdit.dataset.nome;
    iniciarEdicao(id, nome);
    return;
  }

  if (btnDelete) {
    const id = btnDelete.dataset.id;
    confirmarExcluir(id);
    return;
  }
});

function iniciarEdicao(id, nome) {
  editandoId = id;
  inputNome.value = nome;
  inputNome.focus();
}

async function confirmarExcluir(id) {
  if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;

  try {
    const res = await fetch(`${API}${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Erro ao deletar");
    carregarCategorias();
  } catch (err) {
    console.error(err);
    alert("Erro ao excluir. Veja o console.");
  }
}

function escapeHtml(unsafe) {
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function escapeAttr(s) {
  return String(s).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

carregarCategorias();
