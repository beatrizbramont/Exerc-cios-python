from flask import Blueprint, request, jsonify
from models.model import db, Despesa
from datetime import datetime

despesas_bp = Blueprint("despesas_bp", __name__)

@despesas_bp.route("/", methods=["POST"])
def criar_despesa():
    data = request.json

    descricao = data.get("descricao")
    valor = data.get("valor")
    data_despesa = data.get("data")
    categoria_id = data.get("categoria_id")

    if not descricao or not valor or not categoria_id:
        return jsonify({
            "erro": "Campos obrigatórios: descricao, valor, categoria_id"
        }), 400

    if data_despesa:
        try:
            data_formatada = datetime.strptime(data_despesa, "%d/%m/%Y").date()
        except ValueError:
            return jsonify({
                "erro": "Formato inválido. Use DD/MM/AAAA"
            }), 400
    else:
        data_formatada = None  

    despesa = Despesa(
        descricao=descricao,
        valor=valor,
        data=data_formatada,
        categoria_id=categoria_id
    )

    db.session.add(despesa)
    db.session.commit()

    return jsonify({"mensagem": "Despesa criada com sucesso"}), 200

@despesas_bp.route("/", methods=["GET"])
def listar_despesas():
    despesas = Despesa.query.all()

    return jsonify([
        {
            "id": d.id,
            "descricao": d.descricao,
            "valor": d.valor,
            "data": d.data.strftime("%d/%m/%Y") if d.data else None,
            "categoria_id": d.categoria_id
        }
        for d in despesas
    ])

@despesas_bp.route("/<int:id>", methods=["PUT"])
def atualizar_despesa(id):
    despesa = Despesa.query.get_or_404(id)
    data = request.json

    descricao = data.get("descricao", despesa.descricao)
    valor = data.get("valor", despesa.valor)
    data_despesa = data.get("data")
    categoria_id = data.get("categoria_id", despesa.categoria_id)

    if data_despesa:
        try:
            data_formatada = datetime.strptime(data_despesa, "%d/%m/%Y").date()
        except ValueError:
            return jsonify({"erro": "Formato inválido. Use DD/MM/AAAA"}), 400
    else:
        data_formatada = despesa.data

    despesa.descricao = descricao
    despesa.valor = valor
    despesa.data = data_formatada
    despesa.categoria_id = categoria_id

    db.session.commit()

    return jsonify({"mensagem": f"Despesa {id} atualizada com sucesso!"}), 200

@despesas_bp.route("/<int:id>", methods=["DELETE"])
def deletar_despesa(id):
    despesa = Despesa.query.get_or_404(id)

    db.session.delete(despesa)
    db.session.commit()

    return jsonify({"mensagem": f"Despesa {id} deletada com sucesso!"})
