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
    categoria_id = db.Column(db.Integer, db.ForeignKey('categorias.id'), nullable=False)

    def __repr__(self):
        return f'<Despesa {self.descricao} - R${self.valor}>'
    