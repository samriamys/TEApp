package com.teapp.api.repository;

import com.teapp.api.model.Palabra;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PalabraRepository extends JpaRepository<Palabra, Long> {

    @Query(value = """
        SELECT p.texto, r.url_imagen, r.url_audio
        FROM palabra p
        JOIN recurso r ON p.id = r.palabra_id
        JOIN vocal v ON p.vocal_id = v.id
        WHERE v.letra = :letra AND p.dificultad = :nivel
    """, nativeQuery = true)
    List<Object[]> obtenerPalabras(
            @Param("letra") String letra,
            @Param("nivel") int nivel
    );
}
