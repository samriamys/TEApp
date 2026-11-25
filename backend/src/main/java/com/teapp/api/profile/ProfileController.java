package com.teapp.api.profile;

import java.security.SecureRandom;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final JdbcTemplate jdbc;
    private final SecureRandom random = new SecureRandom();

    public ProfileController(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    record Profile(String role, String tutorCode) {}
    record Setup(String tutorCode) {}
    record Student(String name, String email) {}

    @GetMapping
    public Profile profile(@AuthenticationPrincipal Jwt jwt) {
        return find(jwt.getSubject()).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Profile setup required"));
    }

    @GetMapping("/students")
    public List<Student> students(@AuthenticationPrincipal Jwt jwt) {
        Profile current = profile(jwt);
        if (!"tutor".equals(current.role())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Tutor access required");
        }
        return jdbc.query("SELECT display_name, email FROM app_profile WHERE role = 'student' AND tutor_subject = ? ORDER BY display_name",
                (rs, row) -> new Student(rs.getString("display_name"), rs.getString("email")), jwt.getSubject());
    }

    @PostMapping
    @Transactional
    public Profile setup(@AuthenticationPrincipal Jwt jwt, @RequestBody Setup setup) {
        List<Profile> existing = find(jwt.getSubject());
        if (!existing.isEmpty()) return existing.get(0);

        String role = jwt.getClaimAsString("teapp_role");
        String name = jwt.getClaimAsString("name");
        String email = jwt.getClaimAsString("email");
        if (name == null) name = "";
        if (email == null) email = "";
        if ("student".equals(role)) {
            String code = setup.tutorCode() == null ? "" : setup.tutorCode().trim();
            List<String> tutors = jdbc.queryForList(
                    "SELECT subject FROM app_profile WHERE role = 'tutor' AND tutor_code = ?", String.class, code);
            if (tutors.isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tutor code not found");
            jdbc.update("INSERT INTO app_profile (subject, role, tutor_subject, display_name, email) VALUES (?, 'student', ?, ?, ?) ON CONFLICT (subject) DO NOTHING",
                    jwt.getSubject(), tutors.get(0), name, email);
        } else if ("tutor".equals(role)) {
            // Hexadecimal codes are generated server-side; the unique constraint handles collisions.
            // ON CONFLICT avoids aborting the surrounding PostgreSQL transaction on a collision.
            boolean inserted = false;
            for (int attempt = 0; attempt < 10 && !inserted; attempt++) {
                byte[] bytes = new byte[8];
                random.nextBytes(bytes);
                String code = java.util.HexFormat.of().formatHex(bytes).toUpperCase();
                inserted = jdbc.update("INSERT INTO app_profile (subject, role, tutor_code, display_name, email) VALUES (?, 'tutor', ?, ?, ?) ON CONFLICT DO NOTHING",
                        jwt.getSubject(), code, name, email) > 0;
                if (!inserted && !find(jwt.getSubject()).isEmpty()) break;
            }
        } else {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Account role is missing");
        }
        return find(jwt.getSubject()).stream().findFirst()
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Could not create profile"));
    }

    private List<Profile> find(String subject) {
        return jdbc.query("SELECT role, tutor_code FROM app_profile WHERE subject = ?",
                (rs, row) -> new Profile(rs.getString("role"), rs.getString("tutor_code")), subject);
    }
}
