from sqlalchemy import Column, Integer, String, Float, JSON
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

class Movie(Base):
    __tablename__ = "movies"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    genre = Column(String, nullable=True)
    rating = Column(Float, nullable=True)
    director = Column(String, nullable=True)
    cast = Column(JSON, nullable=True)  # store list of cast members
    description = Column(String, nullable=True)
    poster = Column(String, nullable=True)
    trailerUrl = Column(String, nullable=True)
    showtimes = Column(JSON, nullable=True)  # store list of times