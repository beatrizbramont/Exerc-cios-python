from flask import Blueprint, render_template

frontend_bp = Blueprint("frontend", __name__)

@frontend_bp.route("/")
def index():
    return render_template("index.html")

@frontend_bp.route("/categorias")
def categorias():
    return render_template("categoria.html")

@frontend_bp.route("/despesasFront")
def despesas():
    return render_template("despesas.html")

@frontend_bp.route("/minhasDespesas")
def  minhasDespesas():
    return render_template("minhas.html")

@frontend_bp.route("/despesas/editar/<int:id>")
def editar_despesa(id):
    return render_template("editar_despesa.html", id=id)
