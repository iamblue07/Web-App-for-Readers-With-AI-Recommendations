from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class Carte(Base):
    __tablename__ = "cartes"
    id = Column(Integer, primary_key=True, autoincrement=True)
    isbn = Column(String(255), unique=True, nullable=True)
    titlu = Column(String(255), nullable=False)
    autor = Column(String(255), nullable=False)
    descriere = Column(Text, nullable=True)
    gen_literar = Column("genLiterar", String(255), nullable=True)
    cale_imagine = Column("caleImagine", String(255), nullable=True)
    anger = Column("anger_score", Float, nullable=True)
    disgust = Column("disgust_score", Float, nullable=True)
    fear = Column("fear_score", Float, nullable=True)
    joy = Column("joy_score", Float, nullable=True)
    sadness = Column("sadness_score", Float, nullable=True)
    surprise = Column("surprise_score", Float, nullable=True)
    neutral = Column("neutral_score", Float, nullable=True)


class Utilizator(Base):
    __tablename__ = "utilizators"
    id = Column(Integer, primary_key=True, autoincrement=True)
    email = Column(String(255), unique=True, nullable=False)
    parola_hash = Column("parolaHash", String(255), nullable=False)
    username = Column(String(255), unique=True, nullable=False)
    descriere = Column(String(255), nullable=True)
    data_inregistrare = Column("dataInregistrare", DateTime, nullable=False)
    poate_crea_anunt = Column("poateCreaAnunt", Boolean, default=False)
    poate_crea_forum = Column("poateCreaForum", Boolean, default=False)
    poate_trimite_mesaj = Column("poateTrimiteMesaj", Boolean, default=False)
    poate_raporta = Column("poateRaporta", Boolean, default=False)
    este_administrator = Column("esteAdministrator", Boolean, default=False)
    cale_imagine_profil = Column("caleImagineProfil", String(255), nullable=True)

class RecomandareAI(Base):
    __tablename__ = "RecomandareAIs"
    id = Column(Integer, primary_key=True, autoincrement=True)
    id_utilizator = Column("idUtilizator", Integer, ForeignKey('utilizators.id'), nullable=False)
    id_carte = Column("idCarte", Integer, ForeignKey('cartes.id'), nullable=False)
