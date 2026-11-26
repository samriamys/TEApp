package com.teapp.api.controller;

import com.teapp.api.repository.PalabraRepository;
import java.util.List;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/palabras")
@CrossOrigin(origins = { "http://localhost:8100", "http://localhost" })
public class PalabraController {
    public record PalabraResponse(String texto, String imagen, String audio) {}

    private final PalabraRepository repo;

    public PalabraController(PalabraRepository repo) { this.repo = repo; }

    @GetMapping
    public List<PalabraResponse> getPalabras(@RequestParam String vocal, @RequestParam int dificultad) {
        return repo.obtenerPalabras(vocal, dificultad).stream()
                .map(row -> new PalabraResponse((String) row[0], (String) row[1], (String) row[2]))
                .toList();
    }
}
