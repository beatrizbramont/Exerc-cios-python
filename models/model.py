from flask_sqlalchemy import SQLAlchemy
from flask import Flask 
from datetime import date

db = SQLAlchemy()

class Categoria(db.Model):
    __tablename__ = 'categorias'
    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(50), nullable=False)

    despesas = db.relationship('Despesa', backref='categoria', lazy=True)

    def __repr__(self):
        return f'<Categoria {self.nome}>'
    
class Despesa(db.Model):
    __tablename__ = 'despesas'
    id = db.Column(db.Integer, primary_key=True)
    descricao = db.Column(db.String(100), nullable=False)
    valor = db.Column(db.Float, nullable=False)
    data = db.Column(db.Date, nullable=False, default=date.today)
    pago = db.Column(db.Boolean, default=False)
    parcelado = db.Column(db.Boolean, default=False)
    qtd_parcelas = db.Column(db.Integer, nullable=True)
    parcelas_pagas = db.Column(db.Integer, nullable=True)
    
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)

    def __repr__(self):
        return f'<Despesa {self.descricao} - R${self.valor}>'
    
class Parcela(db.Model):
    __tablename__ = "parcelas"

    id = db.Column(db.Integer, primary_key=True)
    despesa_id = db.Column(db.Integer, db.ForeignKey("despesas.id"), nullable=False)
    mes_referencia = db.Column(db.Date, nullable=False)
    valor = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default="pendente")

    despesa = db.relationship("Despesa", backref=db.backref("parcelas", lazy=True))

    def __repr__(self):
        return f"<Parcela {self.mes_referencia} - {self.status}>"