package com.teapp.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "palabra")
public class Palabra {
    @Id
    private Long id;
    private String texto;
    private Integer dificultad;
    private String vocal;

    @Column(name = "url_imagen")
    private String urlImagen;

    @Column(name = "url_audio")
    private String urlAudio;

    public Long getId() { return id; }
    public String getTexto() { return texto; }
    public Integer getDificultad() { return dificultad; }
    public String getVocal() { return vocal; }
    public String getUrlImagen() { return urlImagen; }
    public String getUrlAudio() { return urlAudio; }
}
