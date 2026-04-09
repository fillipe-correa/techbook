package techbook.controller;

import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import techbook.dto.ReservaRequest;
import techbook.model.Reserva;
import techbook.service.TechbookService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reservas")
public class ReservaController {

    private final TechbookService service;

    public ReservaController(TechbookService service) {
        this.service = service;
    }

    @GetMapping
    public List<Reserva> listar() {
        return service.listarReservas();
    }

    @PostMapping
    public Reserva reservar(@Valid @RequestBody ReservaRequest request) {
        return service.criarReserva(request);
    }

    @PatchMapping("/{id}/cancelar")
    public Reserva cancelar(@PathVariable Long id) {
        return service.cancelarReserva(id);
    }

    @PostMapping("/expirar")
    public Map<String, Integer> expirar() {
        return Map.of("reservasExpiradas", service.expirarReservasPendentes());
    }
}
