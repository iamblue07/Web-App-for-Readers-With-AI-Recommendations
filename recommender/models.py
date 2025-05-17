from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Carte(Base):
    __tablename__ = "Cartes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    isbn = Column(String(255), unique=True, nullable=True)
    titlu = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    descriere = Column(Text, nullable=True)
    gen_literar = Column("genLiterar", String(255), nullable=True)
    cale_imagine = Column("caleImagine", String(255), nullable=True)