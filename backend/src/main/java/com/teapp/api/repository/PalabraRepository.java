package com.teapp.api.repository;

import com.teapp.api.model.Palabra;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PalabraRepository extends JpaRepository<Palabra, Long> {
    @Query(value = """
        SELECT p.texto, p.url_imagen, p.url_audio
        FROM palabra p
        WHERE p.vocal = :letra AND p.dificultad = :nivel
    """, nativeQuery = true)
    List<Object[]> obtenerPalabras(@Param("letra") String letra, @Param("nivel") int nivel);
}
