from flask import Blueprint, jsonify, request
from models.model import db, Categoria

categorias_bp = Blueprint("categorias_bp", __name__)

@categorias_bp.route("/", methods=["POST"])
def criar_categoria():
    data = request.json
    nome =  data.get("nome")

    if not nome:
        return jsonify({"erro": "O campo 'nome' é obrigatório"}), 400
    
    categoria = Categoria(nome=nome)
    db.session.add(categoria)
    db.session.commit()
    return jsonify({"mensagem": "Categoria criada com sucesso"}), 200

@categorias_bp.route("/", methods=["GET"])
def listar_categorias():
    categorias = Categoria.query.all()

    return jsonify([{"id": categoria.id, "nome": categoria.nome}
                    for categoria in categorias
    ])

@categorias_bp.route("/<int:id>", methods=["PUT"])
def atualizar_categoria(id):
    categoria = Categoria.query.get_or_404(id)
    data = request.json

    novo_nome = data.get("nome")

    if not novo_nome:
        return jsonify({"erro": "O campo 'nome' é obrigatório"}), 400

    categoria.nome = novo_nome
    db.session.commit()

    return jsonify({"mensagem": f"Categoria {id} atualizada com sucesso!"})

@categorias_bp.route("/<int:id>", methods=["DELETE"])
def deletar_categoria(id):
    categoria = Categoria.query.get_or_404(id)

    db.session.delete(categoria)
    db.session.commit()

    return jsonify({"mensagem": f"Categoria {id} foi deletada com sucesso!"})
