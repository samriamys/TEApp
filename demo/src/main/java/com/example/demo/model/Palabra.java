package com.example.demo.model;

import jakarta.persistence.*;

@Entity
@Table(name = "palabra")
public class Palabra {

    @Id
    private Long id;

    private String texto;

    private Integer dificultad;

    @Column(name = "vocal_id")
    private Long vocalId;

    public Long getId() {
        return id;
    }

    public String getTexto() {
        return texto;
    }

    public Integer getDificultad() {
        return dificultad;
    }

    public Long getVocalId() {
        return vocalId;
    }
}