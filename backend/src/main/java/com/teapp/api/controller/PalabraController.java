package com.teapp.api.controller;

import com.teapp.api.repository.PalabraRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/palabras")
@CrossOrigin(origins = {
        "http://localhost:8100",
        "http://localhost"
})
public class PalabraController {

    private final PalabraRepository repo;

    public PalabraController(PalabraRepository repo) {
        this.repo = repo;
    }

    @GetMapping
    public List<Map<String, String>> getPalabras(
            @RequestParam String vocal,
            @RequestParam int dificultad) {

        return repo.obtenerPalabras(vocal, dificultad)
                .stream()
                .map(r -> Map.of(
                        "texto", (String) r[0],
                        "imagen", (String) r[1],
                        "audio", (String) r[2]))
                .toList();
    }
}
