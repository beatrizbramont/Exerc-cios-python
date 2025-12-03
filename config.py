import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__)) # Guarda o caminho atual do arquivo

class Config:
    SQLALCHEMY_DATABASE_URI = "sqlite:///" + os.path.join(BASE_DIR, "database.db") # Vai criar e usar o banco sqlite dentro da mesma pasta do projeto
    SQLALCHEMY_TRACK_MODIFICATIONS = False