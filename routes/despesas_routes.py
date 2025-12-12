from flask import Blueprint, request, jsonify
from dateutil.relativedelta import relativedelta
from models.model import db, Despesa, Parcela
from datetime import datetime, date

despesas_bp = Blueprint("despesas_bp", __name__)

@despesas_bp.route("/", methods=["POST"])
def criar_despesa():
    data = request.json

    descricao = data.get("descricao")
    valor = float(data.get("valor"))
    data_despesa = data.get("data")
    parcelado = data.get("parcelado", False)
    qtd_parcelas = int(data.get("qtd_parcelas", 1))
    categoria_id = data.get("categoria_id")

    if not descricao or not valor or not categoria_id:
        return jsonify({"erro": "Campos obrigatórios: descricao, valor, categoria_id"}), 400

    if data_despesa:
        data_formatada = datetime.strptime(data_despesa, "%Y-%m-%d").date()
    else:
        data_formatada = date.today()

    despesa = Despesa(
        descricao=descricao,
        valor=valor,
        data=data_formatada,
        parcelado=parcelado,
        qtd_parcelas=qtd_parcelas if parcelado else 1,
        categoria_id=categoria_id
    )

    db.session.add(despesa)
    db.session.commit()

    if parcelado:
        valor_parcela = round(valor / qtd_parcelas, 2)

        for i in range(qtd_parcelas):
            mes = data_formatada + relativedelta(months=i)

            nova_parcela = Parcela(
                despesa_id=despesa.id,
                mes_referencia=mes,
                valor=valor_parcela,
                status="pendente"
            )

            db.session.add(nova_parcela)

        db.session.commit()

    return jsonify({"mensagem": "Despesa criada com sucesso!", "id": despesa.id}), 200

@despesas_bp.route("/", methods=["GET"])
def listar_despesas():
    despesas = Despesa.query.all()

    return jsonify([
        {
            "id": d.id,
            "descricao": d.descricao,
            "valor": d.valor,
            "data": d.data.strftime("%d/%m/%Y") if d.data else None,
            "pago": d.pago,
            "parcelado": d.parcelado,
            "qtd_parcelas": d.qtd_parcelas,
            "parcelas_pagas": d.parcelas_pagas,
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

@despesas_bp.route("/<int:id>", methods=["GET"])
def obter_despesa(id):
    despesa = Despesa.query.get_or_404(id)

    return jsonify({
        "id": despesa.id,
        "descricao": despesa.descricao,
        "valor": despesa.valor,
        "data": despesa.data.strftime("%Y-%m-%d"),
        "parcelado": despesa.parcelado,
        "qtd_parcelas": despesa.qtd_parcelas,
        "categoria_id": despesa.categoria_id
    })


@despesas_bp.route("/<int:id>", methods=["DELETE"])
def deletar_despesa(id):
    despesa = Despesa.query.get_or_404(id)

    db.session.delete(despesa)
    db.session.commit()

    return jsonify({"mensagem": f"Despesa {id} deletada com sucesso!"})

@despesas_bp.route("/com-parcelas", methods=["GET"])
def listar_despesas_com_parcelas():
    despesas = Despesa.query.all()

    resultado = []

    for d in despesas:
        parcelas = []

        for p in d.parcelas:
            parcelas.append({
                "id": p.id,
                "mes": p.mes_referencia.strftime("%m/%Y"),
                "valor": p.valor,
                "status": p.status
            })

        resultado.append({
            "id": d.id,
            "descricao": d.descricao,
            "valor": d.valor,
            "parcelado": d.parcelado,
            "categoria_id": d.categoria_id,
            "parcelas": parcelas
        })

    return jsonify(resultado)

@despesas_bp.route("/parcela/<int:id>", methods=["PATCH"])
def atualizar_status_parcela(id):
    parcela = Parcela.query.get_or_404(id)
    
    data = request.json
    status = data.get("status")

    if status not in ["pago", "atrasado", "pendente"]:
        return jsonify({"erro": "Status inválido"}), 400

    parcela.status = status
    db.session.commit()

    return jsonify({"mensagem": "Parcela atualizada com sucesso"})